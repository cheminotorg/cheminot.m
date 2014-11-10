import m = require('mithril');
import View = require('view');
import Header = require('header');
import Home = require('home');
import Departures = require('departures');
import Trip = require('trip');

export interface Ctrl {
  header: Header.Ctrl;
  home: Home.Ctrl;
  departures: Departures.Ctrl;
  trip: Trip.Ctrl;
}

function renderHeader(ctrl: Header.Ctrl) {
  return m("header", { id: "header" }, Header.get().view(ctrl));
}

function renderHome(ctrl: Home.Ctrl) {
  var attributes: View.Attributes = {
    'id': 'home',
    'class': 'view hidden'
  };

  attributes = View.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
      case 'class:hidden': return ctrl.shouldBeHidden();
      default: return true;
    }
  });

  return m("section", attributes, Home.get().view(ctrl));
}

function renderDepartures(ctrl: Departures.Ctrl) {
  var attributes: View.Attributes = {
    'id': 'departures',
    'class': 'view hidden'
  };

  attributes = View.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
    case 'class:hidden': return ctrl.shouldBeHidden();
      default: return true;
    }
  });

  return m("section", attributes, Departures.get().view(ctrl));
}

function renderTrip(ctrl: Trip.Ctrl) {

  var attributes: View.Attributes = {
    'id': 'trip',
    'class': 'view hidden'
  };

  attributes = View.handleAttributes(attributes, (name, value) => {
    switch (name + ':' + value) {
    case 'class:hidden': return ctrl.shouldBeHidden();
      default: return true;
    }
  });

  return m("section", attributes, Trip.get().view(ctrl));
}

export class App implements m.Module<Ctrl> {

  controller(): Ctrl {
    return {
      header: Header.get().controller(),
      home: Home.get().controller(),
      departures: Departures.get().controller(),
      trip: Trip.get().controller()
    };
  }

  view(ctrl: Ctrl) {
    return [
      renderHeader(ctrl.header),
      renderHome(ctrl.home),
      renderDepartures(ctrl.departures),
      renderTrip(ctrl.trip)
    ];
  }
}

var app = new App();

export function get(): App {
  return app;
}
