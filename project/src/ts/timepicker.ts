import m = require('mithril');
import moment = require('moment');
import i18n = require('i18n');
import _ = require('lodash');
import Q = require('q');
import Toolkit = require('toolkit');

let deferred: Q.Deferred<Date>;

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

function renderTitle(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  return m('div.title', {}, "Définir l'heure");
}

function renderHour(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Toolkit.$.touchend(el, _.partial(ctrl.onHourChange, ctrl));
      }
    }
  };

  return m('div.hour', {} , [
    m('div.up', attrs, m('button')),
    m('span.value', {}, moment(ctrl.timeSelected()).format('HH')),
    m('div.down', attrs, m('button'))
  ]);
}

function renderMinute(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Toolkit.$.touchend(el, _.partial(ctrl.onMinuteChange, ctrl));
      }
    }
  };

  return m('div.minute', {}, [
    m('div.up', attrs, m('button')),
    m('span.value', moment(ctrl.timeSelected()).format('mm')),
    m('div.down', attrs, m('button'))
  ]);
}

function renderButtons(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const getAttrs = (handler: (ctrl: Ctrl, e: Event) => void) => {
    return {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if(!isUpdate) {
          Toolkit.$.touchend(el, _.partial(handler, ctrl));
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

function render(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {

  const attrs = Toolkit.m.attributes
  ({ 'class:fade-in': ctrl.displayed()})
  ({ 'class': 'fade-in' }, (el: HTMLElement, isUpdate: boolean) => {
    if(!isUpdate) {
      Toolkit.$.bindonce('cheminot:timepicker', _.partial(ctrl.onDisplay, ctrl));
    }
  });

  return [
    m('div.modal.time-picker', attrs, [
      renderTitle(ctrl),
      m('div.controls', {}, [
        renderHour(ctrl),
        renderMinute(ctrl)
      ]),
      renderButtons(ctrl)])];
}

export const component: m.Component<Ctrl> = {
  controller(): Ctrl {

    return {
      displayed: m.prop(false),

      onDisplay: (ctrl: Ctrl, e: any) => {
        const time: Date = e.detail.time || new Date();
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
        deferred && deferred.reject('cancel');
        ctrl.displayed(false);
        m.redraw();
      },

      onHourChange: (ctrl: Ctrl, e: Event) => {
        vibrate();
        const button = <HTMLElement> e.currentTarget;
        const date = ctrl.timeSelected();
        if(button.classList.contains('up')) {
          ctrl.timeSelected(moment(date).add(1, 'hour').toDate());
        } else {
          ctrl.timeSelected(moment(date).subtract(1, 'hour').toDate());
        }
        m.redraw();
      },

      onMinuteChange: (ctrl: Ctrl, e: Event) => {
        vibrate();
        const button = <HTMLElement> e.currentTarget;
        const time = ctrl.timeSelected();
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

export function show(time?: Date): Q.Promise<Date> {
  deferred = Q.defer<Date>();
  Toolkit.$.trigger('cheminot:timepicker', { time: time });
  return deferred.promise;
}
