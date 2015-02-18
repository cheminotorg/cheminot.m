import m = require('mithril');
import Modals = require('modals');
import moment = require('moment');
import _ = require('lodash');
import Q = require('q');

var deferred: Q.Deferred<void>;

export type Ctrl = {
  onOkTouched: (ctrl: Ctrl, e: Event) => void;
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  var formatDay = (dateTime: Date) => {
    return moment(dateTime).format('dddd D MMMM YYYY');
  }

  var buttonAttrs: Attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if(!isUpdate) {
        el.addEventListener('touchend', _.partial(ctrl.onOkTouched, ctrl));
      }
    }
  }

  return [m('div.about.modal', {}, [
    m('table', {}, [
      m('tr', {}, [m('td', {}, 'bundleId'), m('td', Settings.bundleId)]),
      m('tr', {}, [m('td', {}, 'version'), m('td', {}, Settings.version)]),
      m('tr', {}, [m('td', {}, 'git'), m('td', {}, Settings.gitVersion)]),
      m('tr', {}, [m('td', {}, 'db creation'), m('td', {}, formatDay(Settings.db.createdAt))]),
      m('tr', {}, [m('td', {}, 'db expiration'), m('td', {}, formatDay(Settings.db.expiredAt))]),
      m('tr', {}, [m('td', {}, 'db version'), m('td', {}, Settings.db.version)])]),
    m('button.ok', buttonAttrs, "OK")
  ])];
}

var about: m.Module<Ctrl> = {
  controller(): Ctrl {
    return {
      onOkTouched: (ctrl: Ctrl, e: Event) => {
        deferred.resolve(null);
        Modals.hide('.about');
      },
    };
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

export function get(): m.Module<Ctrl> {
  return about;
}

export function show(): Q.Promise<void> {
  deferred = Q.defer<void>();
  Modals.show('.about');
  return deferred.promise;
}
