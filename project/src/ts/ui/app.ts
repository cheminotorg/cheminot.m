import m = require('mithril');
import mdl = require('mithril-mdl');
import Toolkit = require('../toolkit');

import { component as Layout } from './layout';
import { component as Home } from './home';
import { component as Search } from './search';

const onReady = function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
  if (!isUpdate) {
    componentHandler.upgradeAllRegistered();
    window.parent.postMessage({ event: 'cheminot:ready' }, window.location.origin);
    Toolkit.Event.trigger('cheminot:ready')
  }
}

export type Ctrl = {
}

export const component: m.Component<Ctrl> = {

  controller(): Ctrl {
    m.redraw.strategy("diff");

    return {
    };
  },

  view(ctrl: Ctrl) {
    return [m('section#app', { config: onReady }, [m(Home), m(Search)])];
  }
}
