import m = require('mithril');
import moment = require('moment');
import i18n = require('i18n');
import _ = require('lodash');
import Utils = require('utils');

export type Ctrl = {
  timeSelected: (value?: Date) => Date;
  onHourChange: (ctrl: Ctrl, e: Event) => void;
  onMinuteChange: (ctrl: Ctrl, e: Event) => void;
  onMeridiemChange: (ctrl: Ctrl, e: Event) => void;
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
    m('span.value', {}, moment(ctrl.timeSelected()).format('hh')),
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

function renderMeridiem(ctrl: Ctrl): m.VirtualElement {
  var attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        el.addEventListener('touchend', _.partial(ctrl.onMeridiemChange, ctrl));
      }
    }
  };

  return m('div.meridiem', {}, [
    m('div.up', attrs, m('button', {}, '')),
    m('span.value', {}, moment(ctrl.timeSelected()).format('A')),
    m('div.down', attrs,  m('button', {}, ''))
  ]);
}

function renderButtons(ctrl: Ctrl): m.VirtualElement {
  return m('div.actions', {}, [
    m('button.ok', {}, 'ok'),
    m('button.clear', {}, i18n.fr('clear')),
    m('button.cancel', {}, i18n.fr('cancel'))
  ]);
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  return [
    renderTitle(ctrl),
    m('div.controls', {}, [
      renderHour(ctrl),
      renderMinute(ctrl),
      renderMeridiem(ctrl)
    ]),
    renderButtons(ctrl)
  ];
}

var timePicker: m.Module<Ctrl> = {
  controller(date?: Date): Ctrl {
    return {
      timeSelected: m.prop(date || new Date()),

      onHourChange: (ctrl: Ctrl, e: Event) => {
        var button = <HTMLElement> e.currentTarget;
        var time = ctrl.timeSelected();
        if(button.classList.contains('up')) {
          ctrl.timeSelected(moment(time).add(1, 'hour').toDate());
        } else {
          ctrl.timeSelected(moment(time).subtract(1, 'hour').toDate());
        }
        m.redraw();
      },

      onMinuteChange: (ctrl: Ctrl, e: Event) => {
        var button = <HTMLElement> e.currentTarget;
        var time = ctrl.timeSelected();
        if(button.classList.contains('up')) {
          ctrl.timeSelected(moment(time).add(1, 'minute').toDate());
        } else {
          ctrl.timeSelected(moment(time).subtract(1, 'minute').toDate());
        }
        m.redraw();
      },

      onMeridiemChange: (ctrl: Ctrl, e: Event) => {
        var button = <HTMLElement> e.currentTarget;
        var time = ctrl.timeSelected();
        if(button.classList.contains('up')) {
          //ctrl.timeSelected(moment(date).add(1, 'year').toDate());
        } else {
          //ctrl.timeSelected(moment(date).subtract(1, 'year').toDate());
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
