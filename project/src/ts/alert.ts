import m = require('mithril');
import Q = require('q');
import Utils = require('utils');
import _ = require('lodash');
import moment = require('moment');
//import mm = require('mmithril');

let deferred: Q.Deferred<string>;

export type Ctrl = {
  onButtonTouched: (ctrl: Ctrl, key: string, e: Event) => void;
  body: (value?: m.VirtualElement<Ctrl>) => m.VirtualElement<Ctrl>;
  buttons: (value?: F<m.VirtualElement<Ctrl>>[]) => F<m.VirtualElement<Ctrl>>[];
  title: (value?: string) => string;
  onDisplay: (ctrl: Ctrl, e: Event) => void;
  displayed: (value?: boolean) => boolean;
  classList: (value?: string[]) => string[];
}

function renderTitle(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  return m('div.title', {}, ctrl.title());
}

function renderButtons(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  return m('div.actions', {}, ctrl.buttons().map((b) => b()));
}

function render(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
  const attrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.bindOnce('cheminot:alert:display', _.partial(ctrl.onDisplay, ctrl));
        Utils.$.bindOnce('cheminot:alert:button', (e: any) => {
          ctrl.onButtonTouched(ctrl, e.detail.key, e.detail.event);
        });
      }
    }
  }

  const fadeInClass = (ctrl.displayed() ? '.fade-in' : '');
  const classList = ctrl.classList().length ? ('.' + ctrl.classList().join('.') + fadeInClass) : fadeInClass;

  return [
    m('div.modal.alert' + classList, attrs, [
      renderTitle(ctrl),
      ctrl.body(),
      renderButtons(ctrl)])];
}

export const component: m.Component<Ctrl> = {
  controller(): Ctrl {
    return {
      title: m.prop('Cheminot'),
      classList: m.prop([]),
      body: m.prop(m('div.body')),
      buttons: m.prop([]),
      displayed: m.prop(false),
      onButtonTouched: (ctrl: Ctrl, key: string, e: Event) => {
        ctrl.displayed(false);
        deferred.resolve(key);
        m.redraw();
      },
      onDisplay: (ctrl: Ctrl, e: any) => {
        ctrl.displayed(true);
        if(e.detail.title) ctrl.title(e.detail.title);
        ctrl.body(e.detail.body);
        ctrl.buttons(e.detail.buttons);
        ctrl.classList(e.detail.classList);
        m.redraw.strategy("diff");
        m.redraw();
      }
    };
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

export function about(classList: string[] = []): Q.Promise<string> {
  const formatDay = (dateTime: Date) => moment(dateTime).format('dddd D MMMM YYYY');
  const body = m('table', {}, [
    m('tr', {}, [m('td', {}, 'bundleId'), m('td', Settings.bundleId)]),
    m('tr', {}, [m('td', {}, 'version'), m('td', {}, Settings.version)]),
    m('tr', {}, [m('td', {}, 'cheminotc'), m('td', {}, Settings.cheminotcVersion)]),
    m('tr', {}, [m('td', {}, 'cheminotm'), m('td', {}, Settings.gitVersion)]),
    m('tr', {}, [m('td', {}, 'db creation'), m('td', {}, formatDay(Settings.db.createdAt))]),
    m('tr', {}, [m('td', {}, 'db version'), m('td', {}, Settings.db.version)])]);

  return info(body, classList.concat(['about']));
}

function bodyElement(text: string): m.VirtualElement<Ctrl> {
  return m('p.body', {}, text);
}

export function info(content: string | m.VirtualElement<Ctrl>, classList: string[] = []): Q.Promise<string> {
  deferred = Q.defer<string>();
  const body = (typeof content === "string") ? bodyElement(content) : content;
  Utils.$.trigger('cheminot:alert:display', { body: body, classList: classList });
  return deferred.promise;
}

export function error(content: string | m.VirtualElement<Ctrl>, classList: string[] = []): Q.Promise<string> {
  deferred = Q.defer<string>();
  const body = (typeof content === "string") ? bodyElement(content) : content;
  Utils.$.trigger('cheminot:alert:display', { body: body, classList: classList.concat(['error']) });
  return deferred.promise;
}

export function prompt(content: string | m.VirtualElement<Ctrl>, buttons: m.VirtualElement<Ctrl>[] = [], classList: string[] = []): Q.Promise<string> {
  deferred = Q.defer<string>();
  const body = (typeof content === "string") ? bodyElement(content) : content;
  const btns = buttons.length ? buttons : [Buttons.YES, Buttons.NO];
  Utils.$.trigger('cheminot:alert:display', { body: body, classList: classList, buttons: btns});
  return deferred.promise;
}

/// BUTTONS

export function createButton(key: string, label: string, classList: string[] = []): F<m.VirtualElement<Ctrl>> {
  return () => {
    const attrs: Attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if(!isUpdate) {
          Utils.$.touchend(el, (e) => {
            Utils.$.trigger('cheminot:alert:button', { key: key, event: e });
          });
        }
      }
    }
    return m(`button.${classList.join('.')}`, attrs, label)
  }
}

export module Result {
  export const OK = 'ok';
  export const CANCEL = 'cancel';
  export const YES = 'yes';
  export const NO = 'no';
}

export module Buttons {
  export const OK = createButton(Result.OK, 'OK', ['ok']);
  export const CANCEL = createButton(Result.CANCEL, 'ANNULER', ['cancel']);
  export const YES = createButton(Result.YES, 'YES', ['yes']);
  export const NO = createButton(Result.NO, 'NO', ['no']);
}
