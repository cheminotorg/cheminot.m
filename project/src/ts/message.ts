import m = require('mithril');
import Q = require('q');
import Utils = require('utils');
import _ = require('lodash');

var deferred: Q.Deferred<void>;

export type Ctrl = {
  onOkTouched: (ctrl: Ctrl, e: Event) => void;
  text: (value?: string) => string;
  onDisplay: (ctrl: Ctrl, e: Event) => void;
  displayed: (value?: boolean) => boolean;
}

function renderText(ctrl: Ctrl): m.VirtualElement {
  return m('p.text', {}, ctrl.text());
}

function renderButtons(ctrl: Ctrl): m.VirtualElement {
  var attrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.bind('cheminot:message', _.partial(ctrl.onDisplay, ctrl));
        el.addEventListener('touchend', _.partial(ctrl.onOkTouched, ctrl));
      }
    }
  }
  return m('div.actions', {}, m('button.ok', attrs, "OK"));
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  var attrs = Utils.m.handleAttributes({ class: 'fade-in'}, (name, value) => {
    if((name + ':' + value) == 'class:fade-in') {
      return ctrl.displayed();
    }
    return true;
  });

  return [
    m('div.modal.message', attrs, [
      renderText(ctrl),
      renderButtons(ctrl)])];
}

var message: m.Module<Ctrl> = {
  controller(): Ctrl {
    return {
      text: m.prop(''),
      displayed: m.prop(false),
      onOkTouched: (ctrl: Ctrl, e: Event) => {
        ctrl.displayed(false);
        deferred.resolve(null);
        m.redraw();
      },
      onDisplay: (ctrl: Ctrl, e: any) => {
        ctrl.displayed(true);
        ctrl.text(e.detail.text);
        m.redraw();
      }
    };
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

export function get(): m.Module<Ctrl> {
  return message;
}

export function info(text: string): Q.Promise<void> {
  deferred = Q.defer<void>();
  Utils.$.trigger('cheminot:message', { text: text });
  return deferred.promise;
}
