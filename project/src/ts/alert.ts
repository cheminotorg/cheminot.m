import m = require('mithril');
import Q = require('q');
import Utils = require('utils');
import _ = require('lodash');
import moment = require('moment');

var deferred: Q.Deferred<void>;

export type Ctrl = {
  onOkTouched: (ctrl: Ctrl, e: Event) => void;
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
  var attrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        Utils.$.bind('cheminot:alert', _.partial(ctrl.onDisplay, ctrl));
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
    m(`div.modal.alert${'.' + ctrl.classList().join('.')}`, attrs, [
      renderTitle(ctrl),
      ctrl.body(),
      renderButtons(ctrl)])];
}

var alert: m.Module<Ctrl> = {
  controller(): Ctrl {
    return {
      title: m.prop('Cheminot'),
      classList: m.prop([]),
      body: m.prop(m('div.body')),
      displayed: m.prop(false),
      onOkTouched: (ctrl: Ctrl, e: Event) => {
        ctrl.displayed(false);
        deferred.resolve(null);
        m.redraw();
      },
      onDisplay: (ctrl: Ctrl, e: any) => {
        ctrl.displayed(true);
        if(e.detail.title) ctrl.title(e.detail.title);
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

export function about(classList: string[] = []): Q.Promise<void> {
  var formatDay = (dateTime: Date) => moment(dateTime).format('dddd D MMMM YYYY');
  var body = m('table', {}, [
    m('tr', {}, [m('td', {}, 'bundleId'), m('td', Settings.bundleId)]),
    m('tr', {}, [m('td', {}, 'version'), m('td', {}, Settings.version)]),
    m('tr', {}, [m('td', {}, 'git'), m('td', {}, Settings.gitVersion)]),
    m('tr', {}, [m('td', {}, 'db creation'), m('td', {}, formatDay(Settings.db.createdAt))]),
    m('tr', {}, [m('td', {}, 'db expiration'), m('td', {}, formatDay(Settings.db.expiredAt))]),
    m('tr', {}, [m('td', {}, 'db version'), m('td', {}, Settings.db.version)])]);

  return info(body, classList.concat(['about']));
}

function bodyElement(text: string): m.VirtualElement {
  return m('p.body', {}, text);
}

export function info(content: string | m.VirtualElement, classList: string[] = []): Q.Promise<void> {
  deferred = Q.defer<void>();
  var body = (typeof content === "string") ? bodyElement(content) : content;
  Utils.$.trigger('cheminot:alert', { body: body, classList: classList });
  return deferred.promise;
}

export function error(content: string | m.VirtualElement, classList: string[] = []): Q.Promise<void> {
  deferred = Q.defer<void>();
  var body = (typeof content === "string") ? bodyElement(content) : content;
  Utils.$.trigger('cheminot:alert', { body: body, classList: classList.concat(['error']) });
  return deferred.promise;
}
