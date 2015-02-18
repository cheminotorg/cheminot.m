import m = require('mithril');
import Header = require('header');
import Home = require('home');
import Departures = require('departures');
import Trip = require('trip');
import Utils = require('utils');
import _ = require('lodash');
import moment = require('moment');
import Modals = require('modals');

export type Ctrl = {
  modals: Modals.Ctrl;
  header: Header.Ctrl;
  home: Home.Ctrl;
  departures: Departures.Ctrl;
  trip: Trip.Ctrl;
}

function renderHeader(ctrl: Header.Ctrl): m.VirtualElement {
  var headerAttrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.longtouch(el, 3000, () => {
          Modals.show('.about');
        });
      }
    }
  }
  return m("header", _.merge({ id: "header" }, headerAttrs), Header.get().view(ctrl));
}

function renderHome(ctrl: Home.Ctrl): m.VirtualElement {
  var attributes: Attributes = {
    'id': 'home',
    'class': 'view hidden'
  };

  attributes = Utils.m.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
      case 'class:hidden': return ctrl.shouldBeHidden();
      default: return true;
    }
  });

  return m("section", attributes, Home.get().view(ctrl));
}

function renderDepartures(ctrl: Departures.Ctrl): m.VirtualElement {
  var attributes: Attributes = {
    'id': 'departures',
    'class': 'view hidden'
  };

  attributes = Utils.m.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
    case 'class:hidden': return ctrl.shouldBeHidden();
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
    case 'class:hidden': return ctrl.shouldBeHidden();
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
      home: Home.get().controller(),
      departures: Departures.get().controller(),
      trip: Trip.get().controller()
    };
  },

  view(ctrl: Ctrl) {
    var attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if (!isUpdate) {
          setTimeout(() => Utils.$.trigger('cheminot:ready'), 200);
        }
      }
    }
    return [m('main#viewport', attributes, [
      Modals.get().view(ctrl.modals),
      renderHeader(ctrl.header),
      renderHome(ctrl.home),
      renderDepartures(ctrl.departures),
      renderTrip(ctrl.trip)
    ])];
  }
}

export function get(): m.Module<Ctrl> {
  return app;
}
