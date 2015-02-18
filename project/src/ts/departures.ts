import m = require('mithril');
import Routes = require('routes');
import _ = require('lodash');
import IScroll = require('IScroll');
import moment = require('moment');
import locale = require('locale');
import Utils = require('utils');
import native = require('native');
import Mock = require('mock');
import Q = require('q');
import Cache = require('cache');
import i18n = require('i18n');

export type Ctrl = {
  scope: () => HTMLElement;
  shouldBeHidden: () => boolean;
  startStation: string;
  endStation: string;
  cached: (value?: Array<Departure>) => Array<Departure>;
  departures: (value?: Array<Departure>) => Array<Departure>;
  onDepartureSelected: (ctrl: Ctrl, departure: Departure, e: Event) => void;
  isPullUpDisplayed: (value?: boolean) => boolean;
  isPullUpLoading: (value?: boolean) => boolean;
  isPullUpFlip: (value?: boolean) => boolean;
  pullUpProgress: (value?: number) => number;
  pullUpLabel: (value?: string) => string;
  nbItemsPerScreen: (value?: number) => number;
  itemHeight: (value?: number) => number;
  lastDepartureTime: (value?: Date) => Date;
  currentPageSize: (value?: number) => number;
  at: (value?: Date) => Date;
  isComputingLongTrip: (value?: boolean) => boolean;
  isScrollingDepartures: (value?: boolean) => boolean;
  isComputationInProgress: (value?: boolean) => boolean;
  iscroll: () => IScroll;
}

function formatDay(dateTime: Date): string {
  return moment(dateTime).format('dddd D MMMM YYYY');
}

function formatDateTime(dateTime: Date): string {
  return moment(dateTime).format('d/MM/YYYY HH:mm');
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
    return [m("span.steps", {}, i18n.fr('direct')), duration];
  } else {
    return [m("span.steps", {}, [
      m("span.value", {}, departure.nbSteps),
      m("span.changements")
    ]), duration];
  }
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  var pullupAttrs = {
    key: 'departures-pullup',
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!ctrl.shouldBeHidden()) {
        ctrl.iscroll().refresh();
        if(ctrl.cached().length != ctrl.departures().length) {
          ctrl.iscroll().scrollTo(0, ctrl.iscroll().maxScrollY, 600);
        }
      }
    }
  };

  var pullUp = m("li.pull-up", pullupAttrs, [
    m("span.label", {}, i18n.fr('pull-to-refresh'))
  ]);

  var loadingLabel = 'Chargement...';
  if(ctrl.isComputingLongTrip()) {
    loadingLabel = i18n.fr('trip-not-direct');
  }

  var trainAttrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        el.classList.add('fade-in')
      }
    }
  }

  var loading = m("div.empty-loading", { key: 'departures-loading' }, [
    m('img.train', _.merge({ src: 'images/cheminot_f4f7f9.gif' }, trainAttrs)),
    m('p', {}, m('span.label', {}, loadingLabel))
  ]);

  var renderDepartureItem = (departure: Departure, attrs: Attributes) => {
    return m('li', attrs, [
      m('div.wrapper', {}, [
        m('div.meta', {}, renderMeta(departure)),
        m('div.start-end', {}, [
          m('span.alarm-clock'),
          m('span.start', {}, formatTime(departure.startTime)),
          m('span.end', {}, formatTime(departure.endTime))
        ])
      ])
    ]);
  }

  var departuresList = ctrl.departures().map((departure) => {
    var attrs: Attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if(!isUpdate) {
          el.addEventListener('touchend', _.partial(ctrl.onDepartureSelected, ctrl, departure));
        }
      },
      key: departure.id
    };

    return renderDepartureItem(departure, attrs);
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

  if(!departures.elements.length) {
    var departure = tripToDeparture(Mock.getTrip());
    var attrs: Attributes = {
      'class': 'fake',
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if(!isUpdate) {
          ctrl.itemHeight(el.clientHeight);
        }
      }
    };
    departures.elements.push(renderDepartureItem(departure, attrs));
  }

  var departuresAttrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!ctrl.shouldBeHidden()) {
        ctrl.iscroll().refresh();
        if(!isUpdate) {
          var cached = Cache.getAllTripsFrom(ctrl.startStation, ctrl.endStation, ctrl.at(), 0, nextDeparture, departureBound).map((departure) => {
            return tripToDeparture(departure);
          });
          ctrl.cached(cached);
          cached.forEach((departure) =>ctrl.departures().push(departure));
          if(cached.length) ctrl.lastDepartureTime(_.last(cached).startTime);
          ctrl.currentPageSize(cached.length);
          lookForNextDepartures(ctrl, ctrl.at());
        } else {
          if(ctrl.cached().length != ctrl.departures().length) {
            ctrl.iscroll().scrollTo(0, ctrl.iscroll().maxScrollY, 0);
          }
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

var departures: m.Module<Ctrl> = {

  controller(): Ctrl {
    var at = parseInt(m.route.param("at"), 10);
    var scope = () => <HTMLElement> document.querySelector('#departures');

    var ctrl: Ctrl = {
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
            this.pullUpLabel(i18n.fr('pull-to-refresh'));
          }
        });

        iscroll.on('scrollStart', () => {
          this.isScrollingDepartures(true);
        });

        iscroll.on('scroll', () => {
          this.pullUpProgress(computePullUpBar(iscroll));
          if(this.pullUpProgress() >= 100) {
            this.isPullUpFlip(true);
            this.pullUpLabel(i18n.fr('release-to-refresh'));
          } else {
            this.isPullUpFlip(false);
            this.pullUpLabel(i18n.fr('pull-to-refresh'));
          }
          this.maxScrollY = this.maxScrollY;
        });

        iscroll.on('scrollEnd', () => {
          this.isScrollingDepartures(false);
          if(this.isPullUpFlip() && !this.isPullUpLoading()) {
            this.isPullUpLoading(true);
            this.pullUpLabel(i18n.fr('loading'));
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

      at: m.prop(new Date(at)),

      departures: m.prop([]),

      cached: m.prop([]),

      nbItemsPerScreen: m.prop(0),

      itemHeight: m.prop(0),

      currentPageSize: m.prop(0),

      onDepartureSelected: (ctrl: Ctrl, departure: Departure, e: Event) => {
        if(ctrl.isComputationInProgress()) native.Cheminot.abort();
        ctrl.isComputationInProgress(false);
        if(!ctrl.isScrollingDepartures()) m.route(Routes.trip(departure.id));
      },

      isPullUpDisplayed: m.prop(false),

      isPullUpLoading: Utils.m.prop(false, (isLoading: boolean) => {
        var wrapper = <HTMLElement> scope().querySelector('#wrapper');
        isLoading ? wrapper.classList.add('loading') : wrapper.classList.remove('loading');
        return isLoading ? displayHolo(ctrl) : hideHolo(ctrl);
      }),

      isPullUpFlip: Utils.m.prop(false, (isFlip: boolean) => {
        var wrapper = <HTMLElement> scope().querySelector('#wrapper');
        isFlip ? wrapper.classList.add('flip') : wrapper.classList.remove('flip');
      }),

      pullUpProgress: m.prop(0),

      pullUpLabel: Utils.m.prop(i18n.fr('pull-to-refresh'), (label: string) => {
        var pullUpLabel = scope().querySelector('.pull-up .label')
        if(pullUpLabel) pullUpLabel.textContent = label;
      }),

      lastDepartureTime: m.prop(undefined),

      isComputingLongTrip: m.prop(false),

      isComputationInProgress: Utils.m.prop(false),

      isScrollingDepartures: Utils.m.prop(false, (isScrolling) => {
        if(isScrolling) {
          document.body.classList.add('scrolling');
        } else {
          document.body.classList.remove('scrolling');
        }
      })
    };

    native.onBackButton('departures', () => {
      if(ctrl.isComputationInProgress()) {
        ctrl.isComputationInProgress(false);
        native.Cheminot.abort();
      }
      if(!ctrl.shouldBeHidden()) history.back();
    });

    return ctrl;
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
};

function lookForNextDepartures(ctrl: Ctrl, at: Date): Q.Promise<void> {
  var step = (ctrl: Ctrl, at: Date): Q.Promise<void> => {
    if(isMoreItemsNeeded(ctrl)) {
      var te = departureBound(at);
      ctrl.isComputationInProgress(true);
      return native.Cheminot.lookForBestDirectTrip(ctrl.startStation, ctrl.endStation, at, te).then((trip) => {
        if(!trip.arrivalTimes.length && !trip.isDirect) {
          ctrl.isComputingLongTrip(true);
          m.redraw(true);
          return native.Cheminot.lookForBestTrip(ctrl.startStation, ctrl.endStation, at, te, 1);
        } else return Q(trip);
      }).then((trip) => {
        if(trip.arrivalTimes.length > 0) {
          var departure = tripToDeparture(trip);
          ctrl.departures().push(departure);
          if(ctrl.isComputingLongTrip()) {
            displayHolo(ctrl);
            m.redraw(true);
          }
          ctrl.currentPageSize(ctrl.currentPageSize() + 1);
          ctrl.lastDepartureTime(departure.startTime);
          return step(ctrl, nextDeparture(ctrl.lastDepartureTime()));
        } else {
          ctrl.lastDepartureTime(te);
          return step(ctrl, nextDeparture(ctrl.lastDepartureTime()));
        }
      });
    } else {
      return Utils.Promise.done();
    }
  }
  return step(ctrl, at).fin(() => {
    ctrl.currentPageSize(0);
    ctrl.isComputationInProgress(false);
    ctrl.isComputingLongTrip(false);
    if(!ctrl.isComputingLongTrip()) m.redraw(true);
    hideHolo(ctrl);
  });
}

function nextDeparture(departure: Date): Date {
  return Utils.DateTime.addMinutes(departure, 1);
}

function departureBound(departure: Date): Date {
  return Utils.DateTime.addHours(departure, 12);
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
  var screenFull = isScreenFull(ctrl);
  var hasFirstPageNotFull = ctrl.nbItemsPerScreen() == 0 && !screenFull;
  var hasLastPageNotFull = screenFull && ctrl.currentPageSize() < ctrl.nbItemsPerScreen();
  return (hasFirstPageNotFull || hasLastPageNotFull) && !ctrl.shouldBeHidden();
}

function isScreenFull(ctrl: Ctrl): boolean {
  var header = <HTMLElement> document.querySelector('#header');
  var viewportSize = Utils.viewportSize();
  var height = Math.max(viewportSize[0], viewportSize[1]);
  var isFull = (header.offsetHeight + (ctrl.itemHeight() * ctrl.departures().length)) >= height;
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

function displayHolo(ctrl: Ctrl): void {
  document.body.classList.add('loading')
}

function hideHolo(ctrl: Ctrl): void {
  document.body.classList.remove('loading');
}

export function get(): m.Module<Ctrl> {
  return departures;
}
