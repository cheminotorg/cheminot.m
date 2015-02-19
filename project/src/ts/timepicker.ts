import m = require('mithril');
import moment = require('moment');
import i18n = require('i18n');
import _ = require('lodash');
import Q = require('q');
import Utils = require('utils');

var deferred: Q.Deferred<Date>;

export type Ctrl = {
  timeSelected: (value?: Date) => Date;
  onHourChange: (ctrl: Ctrl, e: Event) => void;
  onMinuteChange: (ctrl: Ctrl, e: Event) => void;
  onOkTouched: (ctrl: Ctrl, e: Event) => void;
  onClearTouched: (ctrl: Ctrl, e: Event) => void;
  onCancelTouched: (ctrl: Ctrl, e: Event) => void;
  displayed: (value?: boolean) => boolean;
  onDisplay: (ctrl: Ctrl, e: Event) => void;
}

function vibrate() {
  navigator.vibrate(30);
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

  var attrs = Utils.m.handleAttributes({ class: 'fade-in'}, (name, value) => {
    if((name + ':' + value) == 'class:fade-in') {
      return ctrl.displayed();
    }
    return true;
  });

  var eventAttrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.bind('cheminot:timepicker', _.partial(ctrl.onDisplay, ctrl));
      }
    }
  };

  return [
    m('div.modal.time-picker', _.merge(attrs, eventAttrs), [
      renderTitle(ctrl),
      m('div.controls', {}, [
        renderHour(ctrl),
        renderMinute(ctrl)
      ]),
      renderButtons(ctrl)])];
}

var timePicker: m.Module<Ctrl> = {
  controller(): Ctrl {

    return {
      displayed: m.prop(false),

      onDisplay: (ctrl: Ctrl, e: any) => {
        var time: Date = e.detail.time || new Date();
        ctrl.timeSelected(time);
        ctrl.displayed(true);
        m.redraw();
      },

      timeSelected: m.prop(new Date()),

      onOkTouched: (ctrl: Ctrl, e: Event) => {
        vibrate();
        deferred && deferred.resolve(ctrl.timeSelected());
        ctrl.displayed(false);
        m.redraw();
      },

      onClearTouched: (ctrl: Ctrl, e: Event) => {
        vibrate();
        deferred && deferred.resolve(null);
        ctrl.displayed(false);
        m.redraw();
      },

      onCancelTouched: (ctrl: Ctrl, e: Event) => {
        vibrate();
        deferred && deferred.reject('cancel');
        ctrl.displayed(false);
        m.redraw();
      },

      onHourChange: (ctrl: Ctrl, e: Event) => {
        vibrate();
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
        vibrate();
        var button = <HTMLElement> e.currentTarget;
        var time = ctrl.timeSelected();
        if(button.classList.contains('up')) {
          ctrl.timeSelected(moment(time).add(1, 'minute').toDate());
        } else {
          ctrl.timeSelected(moment(time).subtract(1, 'minute').toDate());
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

export function show(time?: Date): Q.Promise<Date> {
  deferred = Q.defer<Date>();
  Utils.$.trigger('cheminot:timepicker', { time: time });
  return deferred.promise;
}
