import m = require('mithril');
import Header = require('header');
import Search = require('search');
import Departures = require('departures');
import Trip = require('trip');
import Now = require('now');
import Utils = require('utils');
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

function renderHeader(ctrl: Header.Ctrl): m.VirtualElement {
  var headerAttrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.longtouch(el, 3000, () => {
          Alert.about();
        });
      }
    }
  }
  return m("header", _.merge({ id: "header" }, headerAttrs), Header.get().view(ctrl));
}

function renderSearch(ctrl: Search.Ctrl): m.VirtualElement {
  var attributes: Attributes = {
    'id': 'search',
    'class': 'view hidden'
  };

  attributes = Utils.m.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
      case 'class:hidden': return !ctrl.displayed();
      default: return true;
    }
  });

  return m("section", attributes, Search.get().view(ctrl));
}

function renderNow(ctrl: Now.Ctrl): m.VirtualElement {
  var attributes: Attributes = {
    'id': 'now',
    'class': 'view hidden'
  };

  attributes = Utils.m.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
      case 'class:hidden': return !ctrl.displayed();
      default: return true;
    }
  });

  return m("section", attributes, Now.get().view(ctrl));
}

function renderDepartures(ctrl: Departures.Ctrl): m.VirtualElement {
  var attributes: Attributes = {
    'id': 'departures',
    'class': 'view hidden'
  };

  attributes = Utils.m.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
    case 'class:hidden': return !ctrl.displayed();
      default: return true;
    }
  });

  return m("section", attributes, Departures.get().view(ctrl));
}

function renderTrip(ctrl: Trip.Ctrl): m.VirtualElement {
  var attributes: Attributes = {
    'id': 'trip',
    'class': 'view hidden'
  };

  attributes = Utils.m.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
    case 'class:hidden': return !ctrl.displayed();
      default: return true;
    }
  });

  return m("section", attributes, Trip.get().view(ctrl));
}

var app = {
  controller(): Ctrl {
    return {
      modals: Modals.get().controller(),
      header: Header.get().controller(),
      now: Now.get().controller(),
      search: Search.get().controller(),
      departures: Departures.get().controller(),
      trip: Trip.get().controller()
    };
  },

  view(ctrl: Ctrl) {
    var attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if (!isUpdate) {
          document.querySelector('#viewport').classList.add('ready');
          setTimeout(() => {
            window.parent.postMessage({ event: 'cheminot:ready' }, window.location.origin);
            Utils.$.trigger('cheminot:ready')
          }, 200);
        }
      }
    }
    return [m('main#viewport', attributes, [
      Modals.get().view(ctrl.modals),
      renderHeader(ctrl.header),
      renderSearch(ctrl.search),
      renderNow(ctrl.now),
      renderDepartures(ctrl.departures),
      renderTrip(ctrl.trip)
    ])];
  }
}

export function get(): m.Module<Ctrl> {
  return app;
}
