import m = require('mithril');
import _ = require('lodash');
import Routes = require('routes');
import Utils = require('utils');
import Cache = require('cache');
import Preferences = require('preferences');
import Alert = require('alert');
import i18n = require('i18n');

export type Ctrl = {
  starred: (value?: boolean) => boolean;
  vs: (value?: string) => string;
  ve: (value?: string) => string;
  onStarred: (ctrl: Ctrl, e: Event) => void;
  onNow: (ctrl: Ctrl, e: Event) => void;
  onSearch: (ctrl: Ctrl, e: Event) => void;
  isTripView: () => boolean;
  isDepartureView: () => boolean;
  isNowView: () => boolean;
}

var header = {
  controller(): Ctrl {

    const vs = m.route.param('start');
    const ve = m.route.param('end');

    let isStarred = false;
    if(Routes.matchDepartures(m.route())) {
      isStarred = Preferences.isStarred(vs, ve);
    }

    return {
      isDepartureView: () => Routes.matchDepartures(m.route()),
      isTripView: () => Routes.matchTrip(m.route()),
      isNowView: () => Routes.matchNow(m.route()),
      starred: m.prop(isStarred),
      vs: m.prop(vs),
      ve: m.prop(ve),
      onSearch: (ctrl: Ctrl, e: Event) => {
        m.route('/');
      },
      onNow: (ctrl: Ctrl, e: Event) => {
        m.route('/now');
      },
      onStarred: (ctrl: Ctrl, e: Event) => {
        if(ctrl.starred()) {
          ctrl.starred(false);
          Preferences.unstars(vs, ve);
          if(Preferences.isStarred(ve, vs)) {
            Alert.prompt(i18n.get('unstar-trip-back')).then((response) => {
              if(response == Alert.Result.YES) {
                Preferences.unstars(ve, vs);
                Cache.clearNextDepartures();
              }
            });
          }
        } else {
          ctrl.starred(true);
          Preferences.stars(vs, ve);
          if(!Preferences.isStarred(ve, vs)) {
            Alert.prompt(i18n.get('star-trip-back')).then((response) => {
              if(response == Alert.Result.NO) {
                Preferences.stars(ve, vs);
                Cache.clearNextDepartures();
              }
            });
          }
        }
        m.redraw();
      }
    };
  },

  view(ctrl: Ctrl) {

    const loader = m('div.holo', {}, [
      m('div.outer', {}),
      m('div.inner', {})
    ]);

    const v = [
      m("h1", {}, "Cheminot"),
      loader
    ];

    if(ctrl.isNowView() && Preferences.hasStars()) {
      var attrs: Attributes = {
        config: (el: HTMLElement, isUpdate: boolean, context: Object) => {
          if(!isUpdate) {
            Utils.$.touchend(el, _.partial(ctrl.onSearch, ctrl));
          }
        }
      };
      v.push(m('button.search', attrs));
    }

    if(ctrl.isDepartureView()) {
      const starsAttrs: Attributes = {
        config: (el: HTMLElement, isUpdate: boolean, context: Object) => {
          if(!isUpdate) {
            Utils.$.touchend(el, _.partial(ctrl.onStarred, ctrl));
          }
        }
      };
      v.push(m('button.stars' + (ctrl.starred() ? '.starred' : ''), starsAttrs));
    }

    return v;
  }
}

export function get(): m.Module<Ctrl> {
  return header;
}
