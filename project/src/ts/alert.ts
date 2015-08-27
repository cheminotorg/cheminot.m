import m = require('mithril');
import Q = require('q');
import Utils = require('utils');
import _ = require('lodash');
import moment = require('moment');

export enum Response {
  OK, CANCEL
}

let deferred: Q.Deferred<Response>;

export type Ctrl = {
  onOkTouched: (ctrl: Ctrl, e: Event) => void;
  onCancelTouched: (ctrl: Ctrl, e: Event) => void;
  isPromptAlert: (value?: boolean) => boolean;
  body: (value?: m.VirtualElement) => m.VirtualElement;
  title: (value?: string) => string;
  onDisplay: (ctrl: Ctrl, e: Event) => void;
  displayed: (value?: boolean) => boolean;
  classList: (value?: string[]) => string[];
}

function renderTitle(ctrl: Ctrl): m.VirtualElement {
  return m('div.title', {}, ctrl.title());
}

function renderButtons(ctrl: Ctrl): m.VirtualElement {
  const okAttrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.bind('cheminot:alert', _.partial(ctrl.onDisplay, ctrl));
        Utils.$.touchend(el, _.partial(ctrl.onOkTouched, ctrl));
      }
    }
  }

  const buttons = [m('button.ok', okAttrs, "OK")];

  if(ctrl.isPromptAlert()) {
    const cancelAttrs: Attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if(!isUpdate) {
          Utils.$.touchend(el, _.partial(ctrl.onCancelTouched, ctrl));
        }
      }
    }
    buttons.push(m('button.cancel', cancelAttrs, "ANNULER"));
  }

  return m('div.actions', {}, buttons);
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  const attrs = Utils.m.handleAttributes({ class: 'fade-in'}, (name, value) => {
    if((name + ':' + value) == 'class:fade-in') {
      return ctrl.displayed();
    }
    return true;
  });

  return [
    m(`div.modal.alert${'.' + ctrl.classList().join('.')}`, attrs, [
      renderTitle(ctrl),
      ctrl.body(),
      renderButtons(ctrl)])];
}

const alert: m.Module<Ctrl> = {
  controller(): Ctrl {
    return {
      title: m.prop('Cheminot'),
      classList: m.prop([]),
      body: m.prop(m('div.body')),
      displayed: m.prop(false),
      onOkTouched: (ctrl: Ctrl, e: Event) => {
        ctrl.displayed(false);
        deferred.resolve(Response.OK);
        m.redraw();
      },
      onCancelTouched: (ctrl: Ctrl, e: Event) => {
        ctrl.displayed(false);
        deferred.resolve(Response.CANCEL);
        m.redraw();
      },
      isPromptAlert: m.prop(false),
      onDisplay: (ctrl: Ctrl, e: any) => {
        ctrl.displayed(true);
        if(e.detail.title) ctrl.title(e.detail.title);
        ctrl.isPromptAlert(e.detail.isPromptAlert);
        ctrl.body(e.detail.body);
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

export function get(): m.Module<Ctrl> {
  return alert;
}

export function about(classList: string[] = []): Q.Promise<Response> {
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

function bodyElement(text: string): m.VirtualElement {
  return m('p.body', {}, text);
}

export function info(content: string | m.VirtualElement, classList: string[] = []): Q.Promise<Response> {
  deferred = Q.defer<Response>();
  const body = (typeof content === "string") ? bodyElement(content) : content;
  Utils.$.trigger('cheminot:alert', { body: body, classList: classList });
  return deferred.promise;
}

export function error(content: string | m.VirtualElement, classList: string[] = []): Q.Promise<Response> {
  deferred = Q.defer<Response>();
  const body = (typeof content === "string") ? bodyElement(content) : content;
  Utils.$.trigger('cheminot:alert', { body: body, classList: classList.concat(['error']) });
  return deferred.promise;
}

export function prompt(content: string | m.VirtualElement, classList: string[] = []): Q.Promise<Response> {
  deferred = Q.defer<Response>();
  const body = (typeof content === "string") ? bodyElement(content) : content;
  Utils.$.trigger('cheminot:alert', { body: body, classList: classList, isPromptAlert: true });
  return deferred.promise;
}
