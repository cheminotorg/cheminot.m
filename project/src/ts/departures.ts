import m = require('mithril');
import Routes = require('routes');
import _ = require('lodash');
import IScroll = require('IScroll');
import moment = require('moment');
import locale = require('locale');
import Toolkit = require('toolkit');
import Common = require('common');
import native = require('native');
import Mock = require('mock');
import Q = require('q');
import Cache = require('cache');
import i18n = require('i18n');
import Alert = require('alert');
import Zanimo = require('Zanimo');

export type Ctrl = {
  scope: () => HTMLElement;
  displayed: () => boolean;
  startStationId: (value?: string) => string;
  endStationId: (value?: string) => string;
  departures: (value?: Departure[]) => Departure[];
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

function renderMeta(departure: Departure): m.VirtualElement<Ctrl>[] {
  const value = Toolkit.DateTime.diff(departure.startTime, departure.endTime)
  const duration = m('div.duration', {}, [
    m('span.egg-timer'),
    m('span.value', {}, Common.Departure.formatDuration(value))
  ]);

  if(departure.nbSteps <= 1) {
    return [m("span.steps", {}, i18n.get('direct')), duration];
  } else {
    return [m("span.steps", {}, [
      m("span.value", {}, departure.nbSteps),
      m("span.changements")
    ]), duration];
  }
}

function renderPullup(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const attrs = Toolkit.m.attributes
  ({ 'class:trace': ctrl.isComputingLongTrip() })
  ({key: 'departures-pullup'}, (el: HTMLElement, isUpdate: boolean) => {
    if(ctrl.displayed()) {
      ctrl.iscroll().refresh();
      if(ctrl.isComputingLongTrip()) {
        ctrl.iscroll().scrollTo(0, ctrl.iscroll().maxScrollY, 600);
      }
    }
  });

  return m("li.pull-up", attrs, [
    m('span.pin'),
    m("span.label", {}, i18n.get('pull-to-refresh'))
  ]);
}

function renderLoading(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const label = ctrl.isComputingLongTrip() ? i18n.get('trip-not-direct') : i18n.get('loading');

  const attrs: m.Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
      if(!isUpdate) {
        el.classList.add('fade-in')
      }
    }
  }

  return m('div.empty-loading', { key: 'departures-loading' }, [
    m('img.train', _.merge({ src: 'images/cheminot_eceff1.gif' }, attrs)),
    m('p', {}, m('span.label', {}, label))
  ]);
}

function renderDepartureItem(departure: Departure, attrs: m.Attributes): m.VirtualElement<Ctrl> {
  return m('li', attrs, [
    m('div.wrapper', {}, [
      m('div.meta', {}, renderMeta(departure)),
      m('div.start-end', {}, [
        m('span.alarm-clock'),
        m('span.start', {}, Common.Departure.formatTime(departure.startTime)),
        m('span.end', {}, Common.Departure.formatTime(departure.endTime))
      ])
    ])
  ]);
}

function renderFakeDepartureItem(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const departure = Common.tripToDeparture(Mock.getTrip());
  const attrs: m.Attributes = {
    'class': 'fake',
    config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
      if(!isUpdate) {
        ctrl.itemHeight(el.offsetHeight);
      }
    }
  };
  return renderDepartureItem(departure, attrs)
}

function renderDepartureList(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
  return ctrl.departures().map((departure, index) => {
    const attrs: m.Attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
        if(!isUpdate) {
          Toolkit.$.touchend(el, _.partial(ctrl.onDepartureSelected, ctrl, departure));
        }
      },
      key: departure.id,
      class: (index + 1 === ctrl.departures().length) ? 'last' : ''
    };
    return renderDepartureItem(departure, attrs);
  });
}

function renderTrace(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
      if(ctrl.displayed()) {
        ctrl.iscroll().refresh();
        if(!isUpdate) {
          el.style.bottom = '-' + el.clientHeight + 'px';
        }

        context.onunload = () => {
          if(ctrl.isComputationInProgress()) {
            ctrl.isComputationInProgress(false);
            native.Cheminot.abort();
            hideHolo(ctrl);
          }
        }
      }
    }
  };
  return m('div.trace', attrs, [
    m('span.pin'),
    m('span.label', {}, i18n.get('loading'))]);
}

function render(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {

  const zipped = _.zip<Departure, m.VirtualElement<Ctrl>>(ctrl.departures(), renderDepartureList(ctrl));
  const departures = _.reduce(zipped, (acc, d) => {
    const [model, dom] = d;
    if(!moment(acc.lastDay).isSame(model.startTime, 'day')) {
      const formattedStartTime = Common.Departure.formatDay(model.startTime);
      const dayEl = m('li.day', formattedStartTime);
      acc.lastDay = model.startTime;
      acc.elements.push(dayEl);
    }
    acc.elements.push(dom);
    return acc;
  }, { lastDay: Toolkit.DateTime.now(), elements: [] });

  if(ctrl.isPullUpDisplayed()) {
    departures.elements.push(renderPullup(ctrl));
  }

  if(!departures.elements.length) {
    departures.elements.push(renderFakeDepartureItem(ctrl));
  }

  const attrs = {
    key: 'departures-list',
    config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
      if(ctrl.displayed()) {
        ctrl.iscroll().refresh();
        if(!isUpdate) {
          const cached = Cache.getAllTripsFrom(ctrl.startStationId(), ctrl.endStationId(), ctrl.at(), 0, nextDeparture, departureBound).map((departure) => {
            return Common.tripToDeparture(departure);
          });
          cached.forEach((departure) => ctrl.departures().push(departure));
          if(cached.length) ctrl.lastDepartureTime(_.last(cached).startTime);
          ctrl.currentPageSize(cached.length);
          if(!ctrl.isComputationInProgress()) {
            lookForNextDepartures(ctrl, ctrl.at());
          }
        } else {
          if(ctrl.isComputingLongTrip()) {
            ctrl.iscroll().scrollTo(0, ctrl.iscroll().maxScrollY, 0);
          }
        }
      }
    }
  };

  const wrapper = [m("ul.departures", attrs, departures.elements)]
  if(!ctrl.departures().length) {
    wrapper.push(renderLoading(ctrl));
  }

  return [m("div#wrapper", {}, wrapper), renderTrace(ctrl)];
}

export const component: m.Component<Ctrl> = {

  controller(): Ctrl {
    const at = parseInt(m.route.param("at"), 10);
    const scope = () => <HTMLElement> document.querySelector('#departures');
    const displayed = () => Routes.matchDepartures(m.route());
    if(displayed()) native.GoogleAnalytics.trackView('Departures');

    const ctrl: Ctrl = {
      scope: scope,

      displayed: displayed,

      iscroll: _.once(function() {
        const wrapper = <HTMLElement> scope().querySelector('#wrapper');
        const header = <HTMLElement> document.querySelector('#header');
        const top = header.offsetTop + header.offsetHeight;
        wrapper.style.top = top + 'px';

        const iscroll = new IScroll(wrapper, { probeType: 1});

        iscroll.on('refresh', () => {
          if(this.isPullUpLoading() && !this.isComputationInProgress()) {
            this.isPullUpLoading(false);
            this.isPullUpFlip(false);
            this.pullUpLabel(i18n.get('pull-to-refresh'));
          }
        });

        iscroll.on('scrollStart', () => {
          this.isScrollingDepartures(true);
        });

        iscroll.on('scroll', () => {
          if(!this.isPullUpLoading()) {
            this.pullUpProgress(computePullUpBar(iscroll));
            if(this.pullUpProgress() >= 100) {
              this.isPullUpFlip(true);
              this.pullUpLabel(i18n.get('release-to-refresh'));
            } else {
              this.isPullUpFlip(false);
              this.pullUpLabel(i18n.get('pull-to-refresh'));
            }
            this.maxScrollY = this.maxScrollY;
          }
        });

        iscroll.on('scrollEnd', () => {
          this.isScrollingDepartures(false);
          if(this.isPullUpFlip() && !this.isPullUpLoading()) {
            this.isPullUpLoading(true);
            this.pullUpLabel(i18n.get('loading'));
            lookForNextDepartures(this, Toolkit.DateTime.addMinutes(this.lastDepartureTime(), 1));
          } else {
            this.pullUpProgress(0);
            this.isPullUpFlip(false);
          }
        });

        return iscroll;
      }),

      startStationId: m.prop(m.route.param("start")),

      endStationId: m.prop(m.route.param("end")),

      at: m.prop(new Date(at)),

      departures: m.prop([]),

      nbItemsPerScreen: m.prop(0),

      itemHeight: m.prop(0),

      currentPageSize: m.prop(0),

      onDepartureSelected: (ctrl: Ctrl, departure: Departure, e: Event) => {
        if(!ctrl.isScrollingDepartures()) {
          if(ctrl.isComputationInProgress()) {
            native.Cheminot.abort();
            hideHolo(ctrl);
          }
          ctrl.isComputationInProgress(false);
          m.route(Routes.trip(departure.id));
        }
      },

      isPullUpDisplayed: m.prop(false),

      isPullUpLoading: Toolkit.m.prop(false, (isLoading: boolean) => {
        const wrapper = <HTMLElement> scope().querySelector('#wrapper');
        isLoading ? wrapper.classList.add('loading') : wrapper.classList.remove('loading');
        return isLoading ? displayHolo(ctrl) : hideHolo(ctrl);
      }),

      isPullUpFlip: Toolkit.m.prop(false, (isFlip: boolean) => {
        const wrapper = <HTMLElement> scope().querySelector('#wrapper');
        isFlip ? wrapper.classList.add('flip') : wrapper.classList.remove('flip');
      }),

      pullUpProgress: m.prop(0),

      pullUpLabel: Toolkit.m.prop(i18n.get('pull-to-refresh'), (label: string) => {
        const pullUpLabel = scope().querySelector('.pull-up .label')
        if(pullUpLabel) pullUpLabel.textContent = label;
      }),

      lastDepartureTime: m.prop<Date>(),

      isComputingLongTrip: m.prop(false),

      isComputationInProgress: m.prop(false),

      isScrollingDepartures: Toolkit.m.prop(false, (isScrolling) => {
        if(isScrolling) {
          document.body.classList.add('scrolling');
        } else {
          document.body.classList.remove('scrolling');
        }
      })
    };

    if(ctrl.displayed()) {
      native.onBackButton('departures', () => {
        if(ctrl.displayed()) history.back();
      });
    }

    return ctrl;
  },

  view(ctrl: Ctrl) {
    return render(ctrl)
  }
};

enum StatusCode {
  OK, NO_MORE, ERROR
}

function traceLongTrip(ctrl: Ctrl) {
  let queue: Station[] = [];
  let lastProducerSpeed = 0;
  let minInterval = 100;

  (function consummer(interval: number) {
    if(ctrl.isComputationInProgress()) {
      const h = queue.shift();
      const el = ctrl.scope().querySelector('.trace .label');
      if(el && h) el.textContent = h.name;
      const producerSpeed = queue.length > 1 ? lastProducerSpeed / queue.length : lastProducerSpeed;
      setTimeout(() => consummer(producerSpeed), producerSpeed);
    }
  })(1000);

  (function producer(interval: number) {
    if(ctrl.isComputationInProgress()) {
      native.Cheminot.trace().then(function(trace) {
        queue = queue.concat(trace);
        lastProducerSpeed = (trace.length > 2) ? (interval / trace.length) : (interval * 2);
        setTimeout(() => producer(lastProducerSpeed), lastProducerSpeed);
      });
    }
  })(1000);
}

function lookForNextDepartures(ctrl: Ctrl, at: Date): Q.Promise<StatusCode> {
  ctrl.isComputationInProgress(true);
  const step = (ctrl: Ctrl, at: Date): Q.Promise<StatusCode> => {
    if(isMoreItemsNeeded(ctrl)) {
      let eventuallyTrip: Q.Promise<ArrivalTimes>;
      if(!ctrl.isComputingLongTrip()) {
        eventuallyTrip = native.Cheminot.lookForBestDirectTrip(ctrl.startStationId(), ctrl.endStationId(), at).then((trip) => {
          if(!trip.arrivalTimes.length && !trip.isDirect) {
            ctrl.isComputingLongTrip(true);
            if(!ctrl.isPullUpDisplayed()) showTrace(ctrl);
            m.redraw();
            traceLongTrip(ctrl);
            return native.Cheminot.lookForBestTrip(ctrl.startStationId(), ctrl.endStationId(), at, 1);
          } else return Q(trip);
        });
      } else {
        eventuallyTrip = native.Cheminot.lookForBestTrip(ctrl.startStationId(), ctrl.endStationId(), at, 1);
      }
      return eventuallyTrip.then((trip) => {
        if(trip.arrivalTimes.length > 0) {
          const departure = Common.tripToDeparture(trip);
          ctrl.departures().push(departure);
          if(ctrl.isComputingLongTrip()) {
            displayHolo(ctrl);
            m.redraw();
          }
          ctrl.currentPageSize(ctrl.currentPageSize() + 1);
          ctrl.lastDepartureTime(departure.startTime);
          return step(ctrl, nextDeparture(ctrl.lastDepartureTime()));
        } else {
          return Q(StatusCode.NO_MORE);
        }
      });
    } else {
      hideTrace(ctrl);
      return Q(StatusCode.OK);
    }
  }
  return step(ctrl, at).then((statusCode) => {
    if(statusCode == StatusCode.NO_MORE) {
      if(!ctrl.departures().length) {
        Alert.info(i18n.get('no-trip-matched')).then(() => history.back());
      }
    }
    return statusCode;
  }).catch((error) => {
    if(error == 'busy') {
      Alert.info(i18n.get('demo-try-later-busy')).then(() => history.back());
    } else if(error != 'aborted') {
      Toolkit.handleError(error);
    }
    return StatusCode.ERROR;
  }).finally(() => {
    ctrl.currentPageSize(0);
    ctrl.isComputationInProgress(false);
    ctrl.isComputingLongTrip(false);
    if(!ctrl.isComputingLongTrip()) m.redraw();
    hideHolo(ctrl);
  });
}

function nextDeparture(departure: Date): Date {
  return Toolkit.DateTime.addMinutes(departure, 1);
}

function departureBound(departure: Date): Date {
  return Toolkit.DateTime.addHours(departure, 12);
}

function isMoreItemsNeeded(ctrl: Ctrl): boolean {
  const screenFull = isScreenFull(ctrl);
  const hasFirstPageNotFull = ctrl.nbItemsPerScreen() == 0 && !screenFull;
  const hasLastPageNotFull = screenFull && ctrl.currentPageSize() < ctrl.nbItemsPerScreen();
  return (hasFirstPageNotFull || hasLastPageNotFull) && ctrl.displayed();
}

function isScreenFull(ctrl: Ctrl): boolean {
  const header = <HTMLElement> document.querySelector('#header');
  const [viewportHeight, viewportWidth] = Toolkit.viewportSize();
  const height = Math.max(viewportHeight, viewportWidth);
  const isFull = (header.offsetHeight + (ctrl.itemHeight() * ctrl.departures().length)) >= height;
  if(isFull && ctrl.nbItemsPerScreen() == 0) {
    ctrl.nbItemsPerScreen(ctrl.departures().length);
  }
  ctrl.isPullUpDisplayed(isFull);
  return isFull;
}

function computePullUpBar(iscroll: IScroll): number {
  const max = 8;
  const deltaY = iscroll.y + Math.abs(iscroll.maxScrollY);
  const value = Math.abs(deltaY * 100 / max);
  return deltaY < 0 ? value : 0;
}

function displayHolo(ctrl: Ctrl): void {
  document.body.classList.add('loading')
}

function hideHolo(ctrl: Ctrl): void {
  document.body.classList.remove('loading');
}

function hideTrace(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const el = <HTMLElement> ctrl.scope().querySelector('.trace');
  return Zanimo(el, 'transform', 'translate3d(0, 0, 0)', 100);
}

function showTrace(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const el = <HTMLElement> ctrl.scope().querySelector('.trace');
  return Zanimo(el, 'transform', 'translate3d(0, -' + el.clientHeight + 'px, 0)', 400, 'cubic-bezier(0.025, 0.970, 0.395, 1.000)');
}
