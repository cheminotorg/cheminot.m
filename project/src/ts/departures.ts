import m = require('mithril');
import Routes = require('routes');
import _ = require('lodash');
import IScroll = require('IScroll');
import moment = require('moment');
import locale = require('locale');
import Utils = require('utils');
import View = require('view');
import native = require('native');
import Q = require('q');

export interface Ctrl {
  scope: () => HTMLElement;
  shouldBeHidden: () => boolean;
  startStation: string;
  endStation: string;
  departures: (value?: Array<Departure>) => Array<Departure>;
  onDepartureSelected: (ctrl: Ctrl, departure: Departure, e: Event) => void;
  isPullUpDisplayed: (value?: boolean) => boolean;
  isPullUpLoading: (value?: boolean) => boolean;
  isPullUpFlip: (value?: boolean) => boolean;
  pullUpProgress: (value?: number) => number;
  pullUpLabel: (value?: string) => string;
  nbItemsPerScreen: (value?: number) => number;
  lastDepartureTime: (value?: Date) => Date;
  currentPageSize: (value?: number) => number;
  at: Date;
  isScrollingDepartures: (value?: boolean) => boolean;
  isComputationInProgress: (value?: boolean) => boolean;
  iscroll: () => IScroll;
}

function formatDay(dateTime: Date): string {
  return moment(dateTime).format('dddd D MMMM YYYY');
}

function formatTime(dateTime: Date): string {
  return moment(dateTime).format('HH:mm');
}

function formatDuration(duration: number): string {
  return moment.utc(duration).format('HH:mm');
}

function renderMeta(departure: Departure): m.VirtualElement[] {
  var duration = m('div.duration', {}, [
    m('span.egg-timer'),
    m('span.value', {}, formatDuration(Utils.DateTime.diff(departure.startTime, departure.endTime)))
  ]);

  if(departure.nbSteps <= 1) {
    return [m("span.steps", {}, "Direct"), duration];
  } else {
    return [m("span.steps", {}, [
      m("span.value", {}, departure.nbSteps),
      m("span.changements")
    ]), duration];
  }
}

function render(ctrl: Ctrl) {
  var pullupAttrs = {
    key: 'departures-pullup',
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!ctrl.shouldBeHidden()) {
        ctrl.iscroll().refresh();
        ctrl.iscroll().scrollTo(0, ctrl.iscroll().maxScrollY, 600);
      }
    }
  };

  var pullUp = m("li.pull-up", pullupAttrs, [
    m("span.label", {}, 'Tirer pour actualiser')
  ]);

  var loading = m("div.empty-loading", { key: 'departures-loading' }, [
    m("span.label", {}, 'Chargement...')
  ]);

  var departuresList = ctrl.departures().map((departure, index) => {
    var attrs = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if (!isUpdate) {
          Utils.$.touchend(el, _.partial(ctrl.onDepartureSelected, ctrl, departure));
        }
      },
      key: departure.id
    };

    return m('li', attrs, [
      m('div.meta', {}, renderMeta(departure)),
      m('div.start-end', {}, [
        m('span.alarm-clock'),
        m('span.start', {}, formatTime(departure.startTime)),
        m('span.end', {}, formatTime(departure.endTime))
      ])
    ]);
  });

  var zipped = _.zip<Departure, m.VirtualElement>(ctrl.departures(), departuresList);
  var departures = _.reduce(zipped, (acc, d) => {
    var model = d[0];
    var dom = d[1];
    if(!moment(acc.lastDay).isSame(model.startTime, 'day')) {
      var dayEl = m('li.day', { key: model.startTime }, formatDay(model.startTime));
      acc.lastDay = model.startTime;
      acc.elements.push(dayEl);
    }
    acc.elements.push(dom);
    return acc;
  }, { lastDay: new Date(), elements: new Array<m.VirtualElement>() });

  if(ctrl.isPullUpDisplayed()) {
    departures.elements.push(pullUp);
  }

  var departuresAttrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!ctrl.shouldBeHidden()) {
        ctrl.iscroll().refresh();
        if(!isUpdate) {
          lookForNextDepartures(ctrl, ctrl.at);
        } else {
          ctrl.iscroll().scrollTo(0, ctrl.iscroll().maxScrollY, 0);
        }
      }
    }
  };

  var wrapper = [m("ul.departures", departuresAttrs, departures.elements)]
  if(ctrl.departures().length == 0) {
    wrapper.push(loading);
  }

  return [m("div#wrapper", {}, wrapper)];
}

export class Departures implements m.Module<Ctrl> {

  controller(): Ctrl {
    var at = parseInt(m.route.param("at"), 10);
    var scope = () => <HTMLElement> document.querySelector('#departures');

    var ctrl = {
      scope: scope,

      shouldBeHidden: () => {
        return !Routes.matchDepartures(m.route());
      },

      iscroll: _.once(function() {
        var wrapper = <HTMLElement> scope().querySelector('#wrapper');
        var header = <HTMLElement> document.querySelector('#header');
        var top = header.offsetTop + header.offsetHeight;
        wrapper.style.top = top + 'px';

        var iscroll = new IScroll(wrapper, { probeType: 1});

        iscroll.on('refresh', () => {
          if(this.isPullUpLoading() && this.currentPageSize() == 0) {
            this.isPullUpLoading(false);
            this.isPullUpFlip(false);
            this.pullUpLabel('Tirer pour actualiser');
          }
        });

        iscroll.on('scrollStart', () => {
          this.isScrollingDepartures(true);
        });

        iscroll.on('scroll', () => {
          this.pullUpProgress(computePullUpBar(iscroll));
          if(this.pullUpProgress() >= 100) {
            this.isPullUpFlip(true);
            this.pullUpLabel('Relacher pour actualiser');
          } else {
            this.isPullUpFlip(false);
            this.pullUpLabel('Tirer pour actualiser');
          }
          this.maxScrollY = this.maxScrollY;
        });

        iscroll.on('scrollEnd', () => {
          this.isScrollingDepartures(false);
          if(this.isPullUpFlip() && !this.isPullUpLoading()) {
            this.isPullUpLoading(true);
            this.pullUpLabel('Chargement...');
            lookForNextDepartures(this, Utils.DateTime.addMinutes(this.lastDepartureTime(), 1));
          } else {
            this.pullUpProgress(0);
            this.isPullUpFlip(false);
          }
        });

        return iscroll;
      }),

      startStation: m.route.param("start"),

      endStation: m.route.param("end"),

      at: new Date(at),

      departures: m.prop([]),

      nbItemsPerScreen: m.prop(0),

      currentPageSize: m.prop(0),

      onDepartureSelected: (ctrl: Ctrl, departure: Departure, e: Event) => {
        if(ctrl.isComputationInProgress()) native.Cheminot.abort();
        if(!ctrl.isScrollingDepartures()) m.route(Routes.trip(departure.id));
      },

      isPullUpDisplayed: m.prop(false),

      isPullUpLoading: Utils.m.prop(false, (isLoading: boolean) => {
        var wrapper = <HTMLElement> scope().querySelector('#wrapper');
        if(isLoading) {
          wrapper.classList.add('loading');
        } else {
          wrapper.classList.remove('loading');
        }
      }),

      isPullUpFlip: Utils.m.prop(false, (isFlip: boolean) => {
        var wrapper = <HTMLElement> scope().querySelector('#wrapper');
        if(isFlip) {
          wrapper.classList.add('flip');
        } else {
          wrapper.classList.remove('flip');
        }
      }),

      pullUpProgress: m.prop(0),

      pullUpLabel: Utils.m.prop('Tirer pour rafraichir', (label: string) => {
        var pullUpLabel = scope().querySelector('.pull-up .label')
        if(pullUpLabel) pullUpLabel.textContent = label;
      }),

      lastDepartureTime: m.prop(),

      isComputationInProgress: m.prop(false),

      isScrollingDepartures: Utils.m.prop(false, (isScrolling) => {
        if(isScrolling) {
          document.body.classList.add('scrolling');
        } else {
          document.body.classList.remove('scrolling');
        }
      })
    };

    native.onBackButton('departures', () => {
      if(ctrl.isComputationInProgress()) native.Cheminot.abort();
      if(!ctrl.shouldBeHidden()) history.back();
    });

    return ctrl;
  }

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

function lookForNextDepartures(ctrl: Ctrl, at: Date): void {
  var te = Utils.DateTime.addHours(at, 12);
  ctrl.isComputationInProgress(true);
  native.Cheminot.lookForBestDirectTrip(ctrl.startStation, ctrl.endStation, at, te).then((trip) => {
    if(!trip.arrivalTimes.length && !trip.isDirect) {
      return native.Cheminot.lookForBestTrip(ctrl.startStation, ctrl.endStation, at, te, 1)
    } else return Q(trip);
  }).then((trip) => {
    ctrl.isComputationInProgress(false);
    if(trip.arrivalTimes.length > 0) {
      var departure = tripToDeparture(trip);
      ctrl.departures().push(departure);
      ctrl.currentPageSize(ctrl.currentPageSize() + 1);
      ctrl.lastDepartureTime(departure.startTime);
      m.redraw(true);
      if(isMoreItemsNeeded(ctrl)) {
        lookForNextDepartures(ctrl, Utils.DateTime.addMinutes(ctrl.lastDepartureTime(), 1));
      } else {
        ctrl.currentPageSize(0);
        m.redraw(true);
      }
    } else {
      ctrl.lastDepartureTime(te);
      lookForNextDepartures(ctrl, Utils.DateTime.addMinutes(ctrl.lastDepartureTime(), 1));
    }
  });
}

function tripToDeparture(trip: ArrivalTimes): Departure {
  var start = _.head(trip.arrivalTimes);
  var end = _.last(trip.arrivalTimes);
  var nbSteps = Object.keys(_.groupBy(trip.arrivalTimes, arrivalTime => arrivalTime.tripId)).length;

  return {
    startId: start.stopId,
    endId: end.stopId,
    startTime: start.departure,
    endTime: end.arrival,
    nbSteps: nbSteps,
    id: trip.id
  };
}

function isMoreItemsNeeded(ctrl: Ctrl): boolean {
  if(!isScreenFull(ctrl) && ctrl.nbItemsPerScreen() == 0 && !ctrl.shouldBeHidden()) {
    return true;
  } else {
    return ctrl.currentPageSize() < ctrl.nbItemsPerScreen();
  }
}

function isScreenFull(ctrl: Ctrl): boolean {
  var departures = <HTMLElement> ctrl.scope().querySelector('.departures');
  var header = <HTMLElement> document.querySelector('#header');
  var viewportSize = Utils.viewportSize();
  var height = Math.max(viewportSize[0], viewportSize[1]);
  var isFull = (departures.offsetHeight + header.offsetHeight) >= height;
  if(isFull && ctrl.nbItemsPerScreen() == 0) {
    ctrl.nbItemsPerScreen(ctrl.departures().length);
  }
  ctrl.isPullUpDisplayed(isFull);
  return isFull;
}

function computePullUpBar(iscroll: IScroll): number {
  var max = 8;
  var deltaY = iscroll.y + Math.abs(iscroll.maxScrollY);
  var value = Math.abs(deltaY * 100 / max);
  return deltaY < 0 ? value : 0;
}

var departures = new Departures();

export function get(): Departures {
  return departures;
}
