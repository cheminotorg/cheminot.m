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
  departures: (value?: Departure[]) => Departure[];
  itemHeight: (value?: number) => number;
  onDepartureSelected: (ctrl: Ctrl, departure: Departure, e: Event) => void;
  timerId: (value?: number) => number;
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
      if(!isUpdate && ctrl.displayed()) {
        Cache.getOrSetNextDepartures(() => {
          return lookForNextDepartures(ctrl);
        }).then((departures) => {
          ctrl.departures(departures);
          m.redraw();
          if(!ctrl.timerId()) {
            // const timerId = setInterval(() => {
            //   const deprecated = ctrl.departures().map(departure => departure.id);
            //   lookForNextDepartures(ctrl).then((departures) => {
            //     Cache.setNextDepartures(departures);
            //     Cache.removeByKeys(deprecated);
            //   });
            // }, 1000);
            // ctrl.timerId(timerId);
          }
        });
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
    m('p', {}, 'Il semblerait que vous n\'avez encore mis aucun trajet en favoris!'),
    m('button.stars', buttonAttrs, 'Ajouter un trajet maintenant')
  ])];
}

function render(ctrl: Ctrl) {
  if(!ctrl.displayed()) {
    return new Array<m.VirtualElement>();
  } else {
    return [
      m('div.top-bar.title', {}, [
        m('div', {}, i18n.fr('your-departures'))
      ]),
      Preferences.hasStars() ? renderDeparturesList(ctrl) : renderNothing(ctrl)
    ];
  }
}

var now: m.Module<Ctrl> = {

  controller(): Ctrl {
    return {
      scope: () => <HTMLElement> document.querySelector('#now'),
      displayed: () => Routes.matchNow(m.route()),
      departures: m.prop([]),
      timerId: m.prop(null),
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
  ctrl.departures([]);
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
      if(isScreenFull(ctrl) || !ctrl.displayed()) {
        if(!ctrl.displayed()) {
          clearInterval(ctrl.timerId());
          ctrl.timerId(null);
          throw new Error("aborted");
        } else {
          m.redraw();
          return Q(updated);
        }
      } else {
        const nextDeparture = Utils.DateTime.addMinutes(_.last(updated).startTime, 1);
        return step(nextDeparture);
      }
    });
  }
  return step(new Date());
}

function isScreenFull(ctrl: Ctrl): boolean {
  const header = <HTMLElement> document.querySelector('#header');
  const topBar = <HTMLElement> ctrl.scope().querySelector('.top-bar');
  const [viewportHeight, viewportWidth] = Utils.viewportSize();
  const height = Math.max(viewportHeight, viewportWidth);
  return (header.offsetHeight + topBar.offsetHeight + (ctrl.itemHeight() * ctrl.departures().length)) >= height;
}
