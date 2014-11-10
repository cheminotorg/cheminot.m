import m = require('mithril');
import Routes = require('routes');
import _ = require('lodash');
import IScroll = require('IScroll');
import moment = require('moment');
import Utils = require('utils');
import View = require('view');

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
  lastArrivalTime: (value?: Date) => Date;
  currentPageSize: (value?: number) => number;
  at: Date;
  isScrollingDepartures: (value?: boolean) => boolean;
  iscroll: () => IScroll;
}

function formatDay(dateTime: Date): string {
  return moment(dateTime).format('dddd MM MMMM');
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
  var pullUp = m("li.pull-up", { key: 'departures-pullup' }, [
    m("span.label", {}, 'Tirer pour actualiser')
  ]);

  var departuresList = ctrl.departures().map((departure) => {
    var attrs = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if (!isUpdate) {
          el.addEventListener('touchend', _.partial(ctrl.onDepartureSelected, ctrl, departure));
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

  var zipped = _.zip(ctrl.departures(), departuresList);
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
        if(!isUpdate) {
          lookForNextDepartures(ctrl, ctrl.at);
        } else {
          ctrl.iscroll().refresh();
          ctrl.iscroll().scrollTo(0, ctrl.iscroll().maxScrollY, 600)
        }
      }
    }
  };

  return [m("div#wrapper", {}, m("ul.departures", departuresAttrs, departures.elements))];
}

export class Departures implements m.Module<Ctrl> {

  controller(): Ctrl {
    var at = parseInt(m.route.param("at"), 10);
    var scope = () => document.querySelector('#departures');
    return {
      scope: scope,

      shouldBeHidden: () => {
        return !Routes.matchDepartures(m.route());
      },

      iscroll: _.once(function() {
        var wrapper = scope().querySelector('#wrapper');
        var header = document.querySelector('#header');
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
            lookForNextDepartures(this, this.lastArrivalTime());
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
        if(!ctrl.isScrollingDepartures()) {
          m.route(Routes.trip(departure.id));
        }
      },

      isPullUpDisplayed: m.prop(false),

      isPullUpLoading: Utils.m.prop(false, (isLoading: boolean) => {
        var wrapper = scope().querySelector('#wrapper');
        if(isLoading) {
          wrapper.classList.add('loading');
        } else {
          wrapper.classList.remove('loading');
        }
      }),

      isPullUpFlip: Utils.m.prop(false, (isFlip: boolean) => {
        var wrapper = scope().querySelector('#wrapper');
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

      lastArrivalTime: m.prop(),

      isScrollingDepartures: m.prop(false)
    };
  }

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

function lookForNextDepartures(ctrl: Ctrl, at: Date): void {
  cordova.plugins.Cheminot.lookForBestTrip(ctrl.startStation, ctrl.endStation, at.getTime(),
    (trip) => {
      m.startComputation();
      var departure = tripToDeparture(trip);
      ctrl.departures().push(departure);
      sessionStorage.setItem(departure.id, JSON.stringify(trip));
      ctrl.currentPageSize(ctrl.currentPageSize() + 1);
      ctrl.lastArrivalTime(departure.endTime);
      if(isMoreItemsNeeded(ctrl)) {
        lookForNextDepartures(ctrl, departure.endTime);
      } else {
        ctrl.currentPageSize(0);
      }
      m.endComputation();
    },
    () => {
    }
  );
}

function tripToDeparture(trip: StopTime[]): Departure {
  var startTime = _.head(trip).departureTime;
  var endTime = _.last(trip).arrivalTime;
  var id = startTime.getTime() + '|' + endTime.getTime();
  return {
    startId: _.head(trip).stopId,
    endId: _.last(trip).stopId,
    startTime: startTime,
    endTime: endTime,
    nbSteps: trip.length,
    id: cordova.isMock ? id + '|' + Date.now() : id
  };
}

function isMoreItemsNeeded(ctrl: Ctrl): boolean {
  if(!isScreenFull(ctrl) && ctrl.nbItemsPerScreen() == 0) {
    return true;
  } else {
    return ctrl.currentPageSize() < ctrl.nbItemsPerScreen();
  }
}

function isScreenFull(ctrl: Ctrl): boolean {
  var departures = ctrl.scope().querySelector('.departures');
  var header = document.querySelector('#header');
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
