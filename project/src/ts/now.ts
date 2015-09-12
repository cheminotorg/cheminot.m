import m = require('mithril');
import Routes = require('routes');
import IScroll = require('IScroll');
import native = require('native');
import Preferences = require('preferences');
import Common = require('common');
import Toolkit = require('toolkit');
import Mock = require('mock');
import Q = require('q');
import _ = require('lodash');
import Cache = require('cache');
import i18n = require('i18n');

let timerId: number;

export type Ctrl = {
  scope: () => HTMLElement;
  displayed: () => boolean;
  departures: (value?: Departure[]) => Departure[];
  itemHeight: (value?: number) => number;
  onDepartureSelected: (ctrl: Ctrl, departure: Departure, e: Event) => void;
  onGoToSearchTouched: (ctrl: Ctrl, e: Event) => void;
}

function renderDepartureItem(ctrl: Ctrl, departure: Departure, attrs: m.Attributes): m.VirtualElement<Ctrl> {
  const remaining = Toolkit.DateTime.diff(new Date(), departure.startTime);
  const formattedRemaining = Common.Departure.formatDuration(remaining, (hours, minutes) => {
    if(hours > 0) {
      return hours + 'h' + Toolkit.pad(minutes, 2);
    } else {
      return Toolkit.pad(minutes, 2) + ' min';
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

function renderDepartureItems(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
  return ctrl.departures().map((departure) => {
    const attrs: m.Attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
        if(!isUpdate) {
          Toolkit.$.touchend(el, _.partial(ctrl.onDepartureSelected, ctrl, departure));
        }
      },
      key: departure.id
    };
    return renderDepartureItem(ctrl, departure, attrs);
  });
}

function renderFakeDepartureItem(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const departure = Common.tripToDeparture(Mock.getTrip());
  const attrs: m.Attributes = {
    'class': 'fake',
    config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
      if(!isUpdate) {
        if(!ctrl.itemHeight()) ctrl.itemHeight(el.offsetHeight);
      }
    }
  };
  return renderDepartureItem(ctrl, departure, attrs);
}

function renderDeparturesList(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
  let departureItems = renderDepartureItems(ctrl);

  if(!departureItems.length) {
    departureItems = [renderFakeDepartureItem(ctrl)];
  }

  const attrs = {
    key: 'now-list',
    config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
      const loop = (departures: Departure[]) => {
        ctrl.departures(departures);
        if(timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
          m.redraw();
          lookForNextDepartures(ctrl).then((departures) => {
            ctrl.departures(departures);
          }).fin(() => {
            timerId = null;
            m.redraw();
          });
        }, Preferences.Now.refresh);
        m.redraw();
        return departures;
      }

      if(!isUpdate && timerId) {
        clearTimeout(timerId);
        timerId = null;
      }

      if(ctrl.displayed() && !timerId) {
        if(!isUpdate) {
          Cache.getOrSetNextDepartures(() => lookForNextDepartures(ctrl)).then(loop).catch((e) => {
            console.log(e);
          });
        } else {
          Cache.setNextDepartures(ctrl.departures());
          lookForNextDepartures(ctrl).then(loop).catch((e) => {
            console.log(e);
          });
        }
      }
    }
  }

  return [m('ul.departures.list', attrs, departureItems)];
}

function renderNothing(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
  const addStarBtnAttrs: m.Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
      if(!isUpdate) {
        Toolkit.$.touchend(el, _.partial(ctrl.onGoToSearchTouched, ctrl));
      }
    },
  };
  return [m('div.nothing', {}, [
    m('div.description', {}, m('p', {}, i18n.get('stars-empty'))),
    m('button.add-star', addStarBtnAttrs, i18n.get('add-star'))
  ])];
}

function render(ctrl: Ctrl) {
  if(!ctrl.displayed()) {
    return [];
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

export const component: m.Component<Ctrl> = {

  controller(): Ctrl {
    const scope = () => <HTMLElement> document.querySelector('#now');
    return {
      scope: scope,
      displayed: () => Routes.matchNow(m.route()),
      departures: m.prop([]),
      itemHeight: m.prop(0),
      onGoToSearchTouched: (ctrl: Ctrl, e: Event) => {
        m.route(Routes.search());
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

function lookForNextDepartures(ctrl: Ctrl): Q.Promise<Departure[]> {
  const starred = Preferences.starred();
  const step = (at: Date, departures: Departure[]): Q.Promise<Departure[]> => {
    return Toolkit.Promise.foldLeftSequentially(Preferences.starred(), departures, (acc, s) => {
      if(!isScreenFull(ctrl, acc) && ctrl.displayed()) {
        const te = Common.departureBound(at);
        return native.Cheminot.lookForBestDirectTrip(s.startId, s.endId, at, te).then((trip) => {
          const departure = Common.tripToDeparture(trip);
          acc.push(departure);
          return acc;
        });
      } else {
        return ctrl.displayed() ? Toolkit.Promise.pure<Departure[]>(departures) : Toolkit.Promise.pure<Departure[]>([]);
      }
    }).then((departures) => {
      const updated = _.sortBy(departures, (departure) => {
        return departure.startTime.getTime();
      });
      if(!ctrl.displayed() || isScreenFull(ctrl, departures)) {
        if(!ctrl.displayed()) {
          throw new Error("aborted");
        } else {
          return Q(updated);
        }
      } else {
        const nextDeparture = Toolkit.DateTime.addMinutes(_.last(updated).startTime, 1);
        return step(nextDeparture, departures);
      }
    });
  }
  return step(new Date(), []);
}

function isScreenFull(ctrl: Ctrl, departures: Departure[]): boolean {
  const header = <HTMLElement> document.querySelector('#header');
  const topBar = <HTMLElement> ctrl.scope().querySelector('.top-bar');
  const [viewportHeight, viewportWidth] = Toolkit.viewportSize();
  const height = Math.max(viewportHeight, viewportWidth);
  if(!header || !topBar) return false;
  return (header.offsetHeight + topBar.offsetHeight + (ctrl.itemHeight() * departures.length)) >= height;
}
