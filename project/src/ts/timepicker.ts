import m = require('mithril');
import moment = require('moment');
import i18n = require('i18n');
import _ = require('lodash');
import Q = require('q');
import Utils = require('utils');
import Modals = require('modals');

var deferred: Q.Deferred<Date>;

export type Ctrl = {
  timeSelected: (value?: Date) => Date;
  onHourChange: (ctrl: Ctrl, e: Event) => void;
  onMinuteChange: (ctrl: Ctrl, e: Event) => void;
  onOkTouched: (ctrl: Ctrl, e: Event) => void;
  onClearTouched: (ctrl: Ctrl, e: Event) => void;
  onCancelTouched: (ctrl: Ctrl, e: Event) => void;
}

function renderTitle(ctrl: Ctrl): m.VirtualElement {
  return m('div.title', {}, "Définir l'heure");
}

function renderHour(ctrl: Ctrl): m.VirtualElement {
  var attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        el.addEventListener('touchend', _.partial(ctrl.onHourChange, ctrl));
      }
    }
  };

  return m('div.hour', {} , [
    m('div.up', attrs, m('button')),
    m('span.value', {}, moment(ctrl.timeSelected()).format('HH')),
    m('div.down', attrs, m('button'))
  ]);
}

function renderMinute(ctrl: Ctrl): m.VirtualElement {
  var attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        el.addEventListener('touchend', _.partial(ctrl.onMinuteChange, ctrl));
      }
    }
  };

  return m('div.minute', {}, [
    m('div.up', attrs, m('button')),
    m('span.value', moment(ctrl.timeSelected()).format('mm')),
    m('div.down', attrs, m('button'))
  ]);
}

function renderButtons(ctrl: Ctrl): m.VirtualElement {
  var getAttrs = (handler: (ctrl: Ctrl, e: Event) => void) => {
    return {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if(!isUpdate) {
          el.addEventListener('touchend', _.partial(handler, ctrl));
        }
      }
    }
  };

  var onok = getAttrs(ctrl.onOkTouched);
  var onclear = getAttrs(ctrl.onClearTouched);
  var oncancel = getAttrs(ctrl.onCancelTouched);

  return m('div.actions', {}, [
    m('button.ok', onok, 'ok'),
    m('button.clear', onclear, i18n.fr('clear')),
    m('button.cancel', oncancel, i18n.fr('cancel'))
  ]);
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  return [
    m('div.modal.time-picker', {}, [
      renderTitle(ctrl),
      m('div.controls', {}, [
        renderHour(ctrl),
        m('div.separator', {}, ':'),
        renderMinute(ctrl)
      ]),
      renderButtons(ctrl)])];
}

var timePicker: m.Module<Ctrl> = {
  controller(date?: Date): Ctrl {
    date = date || new Date();

    return {
      timeSelected: m.prop(date),

      onOkTouched: (ctrl: Ctrl, e: Event) => {
        deferred.resolve(ctrl.timeSelected());
        Modals.hide('.date-picker');
      },

      onClearTouched: (ctrl: Ctrl, e: Event) => {
        deferred.resolve(null);
        Modals.hide('.time-picker');
      },

      onCancelTouched: (ctrl: Ctrl, e: Event) => {
        deferred.reject('cancel');
        Modals.hide('.time-picker');
      },

      onHourChange: (ctrl: Ctrl, e: Event) => {
        var button = <HTMLElement> e.currentTarget;
        var date = ctrl.timeSelected();
        if(button.classList.contains('up')) {
          ctrl.timeSelected(moment(date).add(1, 'hour').toDate());
        } else {
          ctrl.timeSelected(moment(date).subtract(1, 'hour').toDate());
        }
        m.redraw();
      },

      onMinuteChange: (ctrl: Ctrl, e: Event) => {
        var button = <HTMLElement> e.currentTarget;
        var date = ctrl.timeSelected();
        if(button.classList.contains('up')) {
          ctrl.timeSelected(moment(date).add(1, 'minute').toDate());
        } else {
          ctrl.timeSelected(moment(date).subtract(1, 'minute').toDate());
        }
        m.redraw();
      }
    };
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

export function get(): m.Module<Ctrl> {
  return timePicker;
}

export function show(): Q.Promise<Date> {
  deferred = Q.defer<Date>();
  Modals.show('.time-picker');
  return deferred.promise;
}
