import m = require('mithril');
import Header = require('header');
import Search = require('search');
import Departures = require('departures');
import Trip = require('trip');
import Now = require('now');
import Toolkit = require('toolkit');
import _ = require('lodash');
import moment = require('moment');
import Modals = require('modals');
import Alert = require('alert');
import Touch = require('ui/touch');

export type Ctrl = {
  modals: Modals.Ctrl;
  header: Header.Ctrl;
  search: Search.Ctrl;
  now: Now.Ctrl;
  departures: Departures.Ctrl;
  trip: Trip.Ctrl;
}

function renderHeader(ctrl: Header.Ctrl): m.VirtualElement<Header.Ctrl> {
  const attrs = Toolkit.m.attributes({})({ id: "header" }, (el: HTMLElement, isUpdate: boolean) => {
    if(!isUpdate) {
      Touch.onlongtap(el, () => Alert.about());
    }
  });

  return m("header", attrs, Header.component.view(ctrl));
}

function renderSearch(ctrl: Search.Ctrl): m.VirtualElement<Search.Ctrl> {
  const attrs = Toolkit.m.attributes
  ({ 'class:hidden': !ctrl.displayed() })
  ({ id: 'search', 'class': 'view hidden' });

  return m("section", attrs, Search.component.view(ctrl));
}

function renderNow(ctrl: Now.Ctrl): m.VirtualElement<Now.Ctrl> {
  const attrs = Toolkit.m.attributes
  ({ 'class:hidden': !ctrl.displayed() })
  ({ 'id': 'now', 'class': 'view hidden' });

  return m("section", attrs, Now.component.view(ctrl));
}

function renderDepartures(ctrl: Departures.Ctrl): m.VirtualElement<Departures.Ctrl> {
  const attrs = Toolkit.m.attributes
  ({ 'class:hidden': !ctrl.displayed() })
  ({ 'id': 'departures', 'class': 'view hidden' });

  return m("section", attrs, Departures.component.view(ctrl));
}

function renderTrip(ctrl: Trip.Ctrl): m.VirtualElement<Trip.Ctrl> {
  const attrs = Toolkit.m.attributes
  ({ 'class:hidden': !ctrl.displayed() })
  ({ 'id': 'trip','class': 'view hidden' });

  return m("section", attrs, Trip.component.view(ctrl));
}

export const component = {
  controller(): Ctrl {
    return {
      modals: Modals.component.controller(),
      header: Header.component.controller(),
      now: Now.component.controller(),
      search: Search.component.controller(),
      departures: Departures.component.controller(),
      trip: Trip.component.controller()
    };
  },

  view(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
    const attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
        if (!isUpdate) {
          setTimeout(() => {
            window.parent.postMessage({ event: 'cheminot:ready' }, window.location.origin);
            Toolkit.Event.trigger('cheminot:ready')
          }, 500);
        }
      }
    }
    return [m('div', attributes, [
      Modals.component.view(ctrl.modals),
      renderHeader(ctrl.header),
      renderSearch(ctrl.search),
      renderNow(ctrl.now),
      renderDepartures(ctrl.departures),
      renderTrip(ctrl.trip)
    ])];
  }
}
