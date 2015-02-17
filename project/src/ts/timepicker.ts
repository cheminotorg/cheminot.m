import m = require('mithril');
import moment = require('moment');
import i18n = require('i18n');
import _ = require('lodash');
import Utils = require('utils');

var Meridian = {
  AM: 'AM',
  PM: 'PM'
}

export type Ctrl = {
  hourSelected: (value?: number) => number;
  minuteSelected: (value?: number) => number;
  meridianSelected: (value?: string) => string;
  onHourChange: (ctrl: Ctrl, e: Event) => void;
  onMinuteChange: (ctrl: Ctrl, e: Event) => void;
  onMeridianChange: (ctrl: Ctrl, e: Event) => void;
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
    m('span.value', {}, ctrl.hourSelected()),
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
    m('span.value', Utils.paddy(ctrl.minuteSelected(), 2)),
    m('div.down', attrs, m('button'))
  ]);
}

function renderMeridian(ctrl: Ctrl): m.VirtualElement {
  var attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        el.addEventListener('touchend', _.partial(ctrl.onMeridianChange, ctrl));
      }
    }
  };

  return m('div.meridian', {}, [
    m('div.up', attrs, m('button', {}, '')),
    m('span.value', {}, ctrl.meridianSelected()),
    m('div.down', attrs,  m('button', {}, ''))
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
    renderTitle(ctrl),
    m('div.controls', {}, [
      renderHour(ctrl),
      renderMinute(ctrl),
      renderMeridian(ctrl)
    ]),
    renderButtons(ctrl)
  ];
}

var timePicker: m.Module<Ctrl> = {
  controller(date?: Date): Ctrl {
    date = date || new Date();

    return {
      hourSelected: m.prop(moment(date).format('hh')),

      minuteSelected: m.prop(moment(date).format('mm')),

      meridianSelected: m.prop(moment(date).format('A')),

      onOkTouched: (ctrl: Ctrl, e: Event) => {
        console.log('ok')
      },

      onClearTouched: (ctrl: Ctrl, e: Event) => {
        console.log('clear')
      },

      onCancelTouched: (ctrl: Ctrl, e: Event) => {
        console.log('cancel');
      },

      onHourChange: (ctrl: Ctrl, e: Event) => {
        var button = <HTMLElement> e.currentTarget;
        var hour = ctrl.hourSelected();
        if(button.classList.contains('up')) {
          hour = (hour == 12) ? 1 : ++hour;
        } else {
          hour = (hour == 1) ? 12 : --hour;
        }
        ctrl.hourSelected(hour);
        m.redraw();
      },

      onMinuteChange: (ctrl: Ctrl, e: Event) => {
        var button = <HTMLElement> e.currentTarget;
        var minute = ctrl.minuteSelected();
        if(button.classList.contains('up')) {
          minute = (minute == 59) ? 1 : ++minute;
        } else {
          minute = (minute == 1) ? 59 : --minute;
        }
        ctrl.minuteSelected(minute);
        m.redraw();
      },

      onMeridianChange: (ctrl: Ctrl, e: Event) => {
        var button = <HTMLElement> e.currentTarget;
        var meridian = ctrl.meridianSelected();
        meridian = (meridian == Meridian.PM) ? Meridian.AM : Meridian.PM;
        ctrl.meridianSelected(meridian);
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
