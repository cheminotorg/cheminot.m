import m = require('mithril');
import Header = require('header');
import Home = require('home');
import Departures = require('departures');
import Trip = require('trip');
import Utils = require('utils');
import _ = require('lodash');
import moment = require('moment');
import DatePicker = require('datepicker');
import TimePicker = require('timepicker');

export interface Ctrl {
  timePicker: TimePicker.Ctrl;
  datePicker: DatePicker.Ctrl;
  header: Header.Ctrl;
  home: Home.Ctrl;
  departures: Departures.Ctrl;
  trip: Trip.Ctrl;
}

function renderSettings(): m.VirtualElement {
  var formatDay = (dateTime: Date) => {
    return moment(dateTime).format('dddd D MMMM YYYY');
  }

  var buttonAttrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        el.addEventListener('touchend', (e) => {
          e.preventDefault();
          var settings = <HTMLElement> document.querySelector('.settings');
          settings.classList.remove('fade-in');
        });
      }
    }
  }

  return m('div.settings.modal', {}, [
    m('table', {}, [
      m('tr', {}, [m('td', {}, 'bundleId'), m('td', Settings.bundleId)]),
      m('tr', {}, [m('td', {}, 'version'), m('td', {}, Settings.version)]),
      m('tr', {}, [m('td', {}, 'git'), m('td', {}, Settings.gitVersion)]),
      m('tr', {}, [m('td', {}, 'db creation'), m('td', {}, formatDay(Settings.db.createdAt))]),
      m('tr', {}, [m('td', {}, 'db expiration'), m('td', {}, formatDay(Settings.db.expiredAt))]),
      m('tr', {}, [m('td', {}, 'db version'), m('td', {}, Settings.db.version)])]),
    m('button.ok', buttonAttrs, "OK")
  ]);
}

function renderModals(dateCtrl: DatePicker.Ctrl, timeCtrl: TimePicker.Ctrl): m.VirtualElement {
  return m('div.modals', {},[
    renderSettings(),
    m('div.date-picker.modal', {}, DatePicker.get().view(dateCtrl)),
    m('div.date-picker.modal.fade-in', {}, TimePicker.get().view(timeCtrl))
  ]);
}

function renderHeader(ctrl: Header.Ctrl): m.VirtualElement {
  var headerAttrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.longtouch(el, 3000, () => {
          var settings = <HTMLElement> document.querySelector('.settings');
          settings.classList.add('fade-in');
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

export class App implements m.Module<Ctrl> {

  controller(): Ctrl {
    return {
      timePicker: TimePicker.get().controller(),
      datePicker: DatePicker.get().controller(),
      header: Header.get().controller(),
      home: Home.get().controller(),
      departures: Departures.get().controller(),
      trip: Trip.get().controller()
    };
  }

  view(ctrl: Ctrl) {
    var attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if (!isUpdate) {
          setTimeout(() => Utils.$.trigger('cheminot:ready'), 200);
        }
      }
    }
    return [m('main#viewport', attributes, [
      renderModals(ctrl.datePicker, ctrl.timePicker),
      renderHeader(ctrl.header),
      renderHome(ctrl.home),
      renderDepartures(ctrl.departures),
      renderTrip(ctrl.trip)
    ])];
  }
}

var app = new App();

export function get(): App {
  return app;
}
