import _ = require('lodash');
import m = require('mithril');
import mdl = require('mithril-mdl');
import Toolkit = require('../toolkit');
import Touch = require('../touch');

import { component as Layout } from './layout';

export type Ctrl = {
  onNewTripTouched: (ctrl: Ctrl, e: Event) => void;
}

function NewTripButton(ctrl: Ctrl): m.Component<Ctrl> {
  const config = Touch.m.ontap(_.partial(ctrl.onNewTripTouched, ctrl));
  return m(mdl.Fab, { icon: 'add', colored: true, ripple: true, config: config })
}

export const component: m.Component<Ctrl> = {

  controller(): Ctrl {
    return {
      onNewTripTouched: (ctrl: Ctrl, e: Event) => {
        m.route('/search');
      }
    };
  },

  view(ctrl: Ctrl) {
    return m(Layout, { id: 'home', fadein: true, title: 'Cheminot' }, NewTripButton(ctrl));
  }
}
