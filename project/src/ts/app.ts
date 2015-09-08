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

export type Ctrl = {
  modals: Modals.Ctrl;
  header: Header.Ctrl;
  search: Search.Ctrl;
  now: Now.Ctrl;
  departures: Departures.Ctrl;
  trip: Trip.Ctrl;
}

function renderHeader(ctrl: Header.Ctrl): m.VirtualElement<Header.Ctrl> {
  const headerAttrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Toolkit.$.longtouch(el, 3000, () => {
          Alert.about();
        });
      }
    }
  }
  return m("header", _.merge({ id: "header" }, headerAttrs), Header.component.view(ctrl));
}

function renderSearch(ctrl: Search.Ctrl): m.VirtualElement<Search.Ctrl> {
  const ma = Toolkit.m.attributes({ 'class.hidden': ctrl.displayed() });
  return m("section", ma({ id: 'search', 'class': 'view hidden' }), Search.component.view(ctrl));
}

function renderNow(ctrl: Now.Ctrl): m.VirtualElement<Now.Ctrl> {
  let attributes: Attributes = {
    'id': 'now',
    'class': 'view hidden'
  };

  attributes = Toolkit.m.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
      case 'class:hidden': return !ctrl.displayed();
      default: return true;
    }
  });

  return m("section", attributes, Now.component.view(ctrl));
}

function renderDepartures(ctrl: Departures.Ctrl): m.VirtualElement<Departures.Ctrl> {
  let attributes: Attributes = {
    'id': 'departures',
    'class': 'view hidden'
  };

  attributes = Toolkit.m.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
    case 'class:hidden': return !ctrl.displayed();
      default: return true;
    }
  });

  return m("section", attributes, Departures.component.view(ctrl));
}

function renderTrip(ctrl: Trip.Ctrl): m.VirtualElement<Trip.Ctrl> {
  let attributes: Attributes = {
    'id': 'trip',
    'class': 'view hidden'
  };

  attributes = Toolkit.m.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
    case 'class:hidden': return !ctrl.displayed();
      default: return true;
    }
  });

  return m("section", attributes, Trip.component.view(ctrl));
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
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if (!isUpdate) {
          document.querySelector('#viewport').classList.add('ready');
          setTimeout(() => {
            window.parent.postMessage({ event: 'cheminot:ready' }, window.location.origin);
            Toolkit.$.trigger('cheminot:ready')
          }, 200);
        }
      }
    }
    return [m('main#viewport', attributes, [
      Modals.component.view(ctrl.modals),
      renderHeader(ctrl.header),
      renderSearch(ctrl.search),
      renderNow(ctrl.now),
      renderDepartures(ctrl.departures),
      renderTrip(ctrl.trip)
    ])];
  }
}
