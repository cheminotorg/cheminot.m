import m = require('mithril');
import Routes = require('routes');
import IScroll = require('IScroll');
import native = require('native');
import Preferences = require('preferences');
import Common = require('common');
import Utils = require('utils');
import Mock = require('mock');
import Q = require('q');
import _ = require('lodash');
import Cache = require('cache');
import i18n = require('i18n');

export type Ctrl = {
  scope: () => HTMLElement;
  displayed: () => boolean;
  isLoading: (value?: boolean) => boolean;
  timerId: (value?: number) => number;
  departures: (value?: Departure[]) => Departure[];
  itemHeight: (value?: number) => number;
  onDepartureSelected: (ctrl: Ctrl, departure: Departure, e: Event) => void;
  onGoToSearchTouched: (ctrl: Ctrl, e: Event) => void;
}

function renderDepartureItem(ctrl: Ctrl, departure: Departure, attrs: Attributes): m.VirtualElement {
  const remaining = Utils.DateTime.diff(new Date(), departure.startTime);
  const formattedRemaining = Common.Departure.formatDuration(remaining, (hours, minutes) => {
    if(hours > 0) {
      return hours + 'h' + Utils.pad(minutes, 2);
    } else {
      return Utils.pad(minutes, 2) + ' min';
    }
  });
  return m('li', attrs, [
      m('div.trip', {}, [
        m('span.start', {}, departure.startName),
        m('span.end', {}, departure.endName)
      ]),
      m('div.timing', {}, [
        m('span.at', {}, Common.Departure.formatTime(departure.startTime)),
        m('span.remaining', {}, `Dans ${formattedRemaining}`)])]);
}

function renderDepartureItems(ctrl: Ctrl): m.VirtualElement[] {
  return ctrl.departures().map((departure) => {
    const attrs: Attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if(!isUpdate) {
          Utils.$.touchend(el, _.partial(ctrl.onDepartureSelected, ctrl, departure));
        }
      },
      key: departure.id
    };
    return renderDepartureItem(ctrl, departure, attrs);
  });
}

function renderDeparturesList(ctrl: Ctrl): m.VirtualElement[] {
  let departureItems = renderDepartureItems(ctrl);

  if(!departureItems.length) {
    const departure = Common.tripToDeparture(Mock.getTrip());
    const attrs: Attributes = {
      'class': 'fake',
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if(!isUpdate) {
          if(!ctrl.itemHeight()) ctrl.itemHeight(el.offsetHeight);
        }
      }
    };
    departureItems = [renderDepartureItem(ctrl, departure, attrs)];
  }

  const attrs = {
    key: 'now-list',

    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      const loop = (departures: Departure[]) => {
        ctrl.departures(departures);
        console.log('setTimeout');
        const timerId = setTimeout(() => {
          ctrl.isLoading(true);
          m.redraw();
          const expired = ctrl.departures().map(departure => departure.id);
          lookForNextDepartures(ctrl).then((departures) => {
            Cache.setNextDepartures(departures);
            Cache.removeByKeys(expired);
          }).fin(() => {
            ctrl.isLoading(false);
            ctrl.timerId(null);
            m.redraw();
          });
        }, 1000 * 10);
        ctrl.timerId(timerId);
        m.redraw();
        return departures;
      }

      if(!isUpdate && ctrl.timerId()) {
        clearTimeout(ctrl.timerId());
        ctrl.timerId(null);
      }

      if(ctrl.displayed() && !ctrl.timerId()) {
        if(!isUpdate) {
          Cache.getOrSetNextDepartures(() => lookForNextDepartures(ctrl)).then(loop);
        } else {
          lookForNextDepartures(ctrl).then(loop);
        }
      }
    }
  }

  return [m('ul.departures.list', attrs, departureItems)];
}

function renderNothing(ctrl: Ctrl): m.VirtualElement[] {
  const buttonAttrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.touchend(el, _.partial(ctrl.onGoToSearchTouched, ctrl));
      }
    },
  };
  return [m('div.nothing', {}, [
    m('div.description', {}, m('p', {}, i18n.get('stars-empty'))),
    m('button.add-star', buttonAttrs, i18n.get('add-star'))
  ])];
}

function render(ctrl: Ctrl) {
  if(!ctrl.displayed()) {
    return new Array<m.VirtualElement>();
  } else {
    const topBar = m('div.top-bar.title', {}, [
      m('div', {}, i18n.get('your-departures'))
    ]);
    const dom = Preferences.hasStars() ? [topBar] : [];
    return dom.concat(
      Preferences.hasStars() ? renderDeparturesList(ctrl) : renderNothing(ctrl)
    );
  }
}

var now: m.Module<Ctrl> = {

  controller(): Ctrl {
    const scope = () => <HTMLElement> document.querySelector('#now');
    return {
      scope: scope,
      displayed: () => Routes.matchNow(m.route()),
      timerId: (id?: number) => {
        if(id) {
          Cache.setNowTimerId(id);
        } else if(_.isUndefined(id)) {
          return Cache.getNowTimerId();
        } else {
          Cache.clearNowTimerId();
        }
      },
      isLoading: Utils.m.prop(false, (isLoading) => {
        const list = <HTMLElement> scope().querySelector('.departures');
        if(list) {
          if(isLoading) {
            list.classList.add('loading');
          } else {
            list.classList.remove('loading');
          }
        }
      }),
      departures: m.prop([]),
      itemHeight: m.prop(0),
      onGoToSearchTouched: (ctrl: Ctrl, e: Event) => {
        m.route('/');
      },
      onDepartureSelected: (ctrl: Ctrl, departure: Departure, e: Event) => {
        m.route(Routes.trip(departure.id));
      }
    };
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

export function get(): m.Module<Ctrl> {
  return now;
}

function lookForNextDepartures(ctrl: Ctrl): Q.Promise<Departure[]> {
  const starred = Preferences.starred();
  const step = (at: Date): Q.Promise<Departure[]> => {
    return Utils.Promise.sequence(Preferences.starred(), (s) => {
      if(!isScreenFull(ctrl) && ctrl.displayed()) {
        const te = Common.departureBound(at);
        return native.Cheminot.lookForBestDirectTrip(s.startId, s.endId, at, te).then((trip) => {
          const departure = Common.tripToDeparture(trip);
          ctrl.departures().push(departure);
        }).catch((e) => {
          console.log(e);
        });
      } else {
        return Utils.Promise.done();
      }
    }).then(() => {
      const updated = _.sortBy(ctrl.departures(), (departure) => {
        return departure.startTime.getTime();
      });
      ctrl.departures(updated);
      if(!ctrl.displayed() || isScreenFull(ctrl)) {
        if(!ctrl.displayed()) {
          throw new Error("aborted");
        } else {
          return Q(updated);
        }
      } else {
        const nextDeparture = Utils.DateTime.addMinutes(_.last(updated).startTime, 1);
        return step(nextDeparture);
      }
    });
  }
  ctrl.departures([]);
  return step(new Date());
}

function isScreenFull(ctrl: Ctrl): boolean {
  const header = <HTMLElement> document.querySelector('#header');
  const topBar = <HTMLElement> ctrl.scope().querySelector('.top-bar');
  const [viewportHeight, viewportWidth] = Utils.viewportSize();
  const height = Math.max(viewportHeight, viewportWidth);
  if(!header || !topBar) return false;
  return (header.offsetHeight + topBar.offsetHeight + (ctrl.itemHeight() * ctrl.departures().length)) >= height;
}
