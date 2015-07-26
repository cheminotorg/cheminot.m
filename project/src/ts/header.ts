import m = require('mithril');
import _ = require('lodash');
import Routes = require('routes');
import Utils = require('utils');
import Cache = require('cache');
import Preferences = require('preferences');

export type Ctrl = {
  starred: (value?: boolean) => boolean;
  onStarred: (ctrl: Ctrl, e: Event) => void;
  isTripView: () => boolean;
  tripId: (id?: string) => string;
}

var header = {
  controller(): Ctrl {

    let isStarred = false;
    let tripId: string = null;

    if(Routes.matchTrip(m.route())) {
      tripId = m.route.param("id");
      let [vs, ve] = Cache.decomposeKey(tripId);
      isStarred = Preferences.isStarred(vs, ve);
    }

    return {
      isTripView: () => Routes.matchTrip(m.route()),
      starred: m.prop(isStarred),
      tripId: m.prop(tripId),
      onStarred: (ctrl: Ctrl, e: Event) => {
        let [vs, ve] = Cache.decomposeKey(ctrl.tripId());
        if(ctrl.starred()) {
          ctrl.starred(false);
          Preferences.unstars(vs, ve);
        } else {
          ctrl.starred(true);
          Preferences.stars(vs, ve);
        }
        m.redraw();
      }
    };
  },

  view(ctrl: Ctrl) {

    var loader = m('div.holo', {}, [
      m('div.outer', {}),
      m('div.inner', {})
    ]);

    let v = [
      m("h1", {}, "Cheminot"),
      loader
    ];

    if(ctrl.isTripView()) {

      var attrs: Attributes = {
        config: (el: HTMLElement, isUpdate: boolean, context: Object) => {
          if(!isUpdate) {
            Utils.$.touchend(el, _.partial(ctrl.onStarred, ctrl));
          }
        }
      };
      v.push(m('button.stars' + (ctrl.starred() ? '.starred' : ''), attrs));
    }

    return v;
  }
}

export function get(): m.Module<Ctrl> {
  return header;
}
