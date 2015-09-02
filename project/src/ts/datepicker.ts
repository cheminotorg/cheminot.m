import m = require('mithril');
import moment = require('moment');
import i18n = require('i18n');
import _ = require('lodash');
import Q = require('q');
import Utils = require('utils');

let deferred: Q.Deferred<Date>;

export type Ctrl = {
  dateSelected: (value?: Date) => Date;
  onDayChange: (ctrl: Ctrl, e: Event) => void;
  onMonthChange: (ctrl: Ctrl, e: Event) => void;
  onYearChange: (ctrl: Ctrl, e: Event) => void;
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
  return m('div.title', {}, "Définir la date");
}

function renderDay(ctrl: Ctrl): m.VirtualElement {
  const attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.touchend(el, _.partial(ctrl.onDayChange, ctrl));
      }
    }
  };

  return m('div.day', {} , [
    m('div.up', attrs, m('button')),
    m('span.value', {}, moment(ctrl.dateSelected()).format('DD')),
    m('div.down', attrs, m('button'))
  ]);
}

function renderMonth(ctrl: Ctrl): m.VirtualElement {
  const attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.touchend(el, _.partial(ctrl.onMonthChange, ctrl));
      }
    }
  };

  return m('div.month', {}, [
    m('div.up', attrs, m('button')),
    m('span.value', {}, moment(ctrl.dateSelected()).format('MM')),
    m('div.down', attrs, m('button'))
  ]);
}

function renderYear(ctrl: Ctrl): m.VirtualElement {
  const attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.touchend(el, _.partial(ctrl.onYearChange, ctrl));
      }
    }
  };

  return m('div.year', {}, [
    m('div.up', attrs, m('button', {}, '')),
    m('span.value', {}, moment(ctrl.dateSelected()).format('YYYY')),
    m('div.down', attrs,  m('button', {}, ''))
  ]);
}

function renderButtons(ctrl: Ctrl): m.VirtualElement {
  const getAttrs = (handler: (ctrl: Ctrl, e: Event) => void) => {
    return {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if(!isUpdate) {
          Utils.$.touchend(el, _.partial(handler, ctrl));
        }
      }
    }
  };

  const onok = getAttrs(ctrl.onOkTouched);
  const onclear = getAttrs(ctrl.onClearTouched);
  const oncancel = getAttrs(ctrl.onCancelTouched);

  return m('div.actions', {}, [
    m('button.ok', onok, 'ok'),
    m('button.clear', onclear, i18n.get('clear')),
    m('button.cancel', oncancel, i18n.get('cancel'))
  ]);
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  const attrs = Utils.m.handleAttributes({ class: 'fade-in'}, (name, value) => {
    if((name + ':' + value) == 'class:fade-in') {
      return ctrl.displayed();
    }
    return true;
  });

  const eventAttrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.bindOnce('cheminot:datepicker', _.partial(ctrl.onDisplay, ctrl));
      }
    }
  };

  return [
    m('div.modal.date-picker', _.merge(attrs, eventAttrs), [
      renderTitle(ctrl),
      m('div.controls', {}, [
        renderDay(ctrl),
        renderMonth(ctrl),
        renderYear(ctrl)
      ]),
      renderButtons(ctrl)])];
}

const datePicker: m.Module<Ctrl> = {
  controller(): Ctrl {
    return {
      displayed: m.prop(false),

      onDisplay: (ctrl: Ctrl, e: any) => {
        const date: Date = e.detail.date || new Date();
        ctrl.dateSelected(date);
        ctrl.displayed(true);
        m.redraw();
      },

      dateSelected: m.prop(new Date()),

      onOkTouched: (ctrl: Ctrl, e: Event) => {
        vibrate();
        ctrl.displayed(false);
        deferred && deferred.resolve(ctrl.dateSelected());
        m.redraw();
      },

      onClearTouched: (ctrl: Ctrl, e: Event) => {
        vibrate();
        ctrl.displayed(false);
        deferred && deferred.resolve(null);
        m.redraw();
      },

      onCancelTouched: (ctrl: Ctrl, e: Event) => {
        ctrl.displayed(false);
        deferred && deferred.reject('cancel');
        m.redraw();
      },

      onDayChange: (ctrl: Ctrl, e: Event) => {
        vibrate();
        const button = <HTMLElement> e.currentTarget;
        const date = ctrl.dateSelected();
        if(button.classList.contains('up')) {
          ctrl.dateSelected(moment(date).add(1, 'day').toDate());
        } else {
          ctrl.dateSelected(moment(date).subtract(1, 'day').toDate());
        }
        m.redraw();
      },

      onMonthChange: (ctrl: Ctrl, e: Event) => {
        vibrate();
        const button = <HTMLElement> e.currentTarget;
        const date = ctrl.dateSelected();
        if(button.classList.contains('up')) {
          ctrl.dateSelected(moment(date).add(1, 'month').toDate());
        } else {
          ctrl.dateSelected(moment(date).subtract(1, 'month').toDate());
        }
        m.redraw();
      },

      onYearChange: (ctrl: Ctrl, e: Event) => {
        vibrate();
        const button = <HTMLElement> e.currentTarget;
        const date = ctrl.dateSelected();
        if(button.classList.contains('up')) {
          ctrl.dateSelected(moment(date).add(1, 'year').toDate());
        } else {
          ctrl.dateSelected(moment(date).subtract(1, 'year').toDate());
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
  return datePicker;
}

export function show(date?: Date): Q.Promise<Date> {
  deferred = Q.defer<Date>();
  Utils.$.trigger('cheminot:datepicker', { date: date });
  return deferred.promise;
}
