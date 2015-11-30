import m = require('mithril');
import mdl = require('mithril-mdl');
import Toolkit = require('./toolkit');
import Zanimo = require('zanimo');

export type Ctrl = {
}

export const component = {
  controller(): Ctrl {
    return {
    };
  },

  view(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
    const attributes = {
      config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
        if (!isUpdate) {
          componentHandler.upgradeAllRegistered();
          window.parent.postMessage({ event: 'cheminot:ready' }, window.location.origin);
          Toolkit.Event.trigger('cheminot:ready')
        }
      }
    }

    return [m('section#search', attributes, [m(mdl.Layout, { fixedHeader: true, fixedTabs: true }, [
      m(mdl.Header, {  }, [
        m(mdl.HeaderRow, {}, [
          m(mdl.Title, {}, "Cheminot")]),
        m(mdl.Tabs, { ripple: true }, [
          m(mdl.Tab, { href: "#today", active: true }, 'Aujourd\'hui'),
          m(mdl.Tab, { href: "#tomorrow" }, 'Demain'),
          m(mdl.Tab, { href: "#other" }, 'Autre')])]),
      m(mdl.Drawer, {},
        [m(mdl.Title, {}, "Settings")]),
      m(mdl.Content, {}, [
        m(mdl.TabPanel, { id: 'today', active: true }, [
          m(mdl.Grid, {}, [
            m(mdl.Cell, { width: 4 }, [
              m(mdl.TextInput, { value: '', label: 'Départ', id: 'departure' }, []),
              m(mdl.TextInput, { value: '', label: 'Arrivé', id: 'arrival' }, [])])]),
          m(mdl.Grid, {}, [
            m(mdl.Cell, { width: 2 }, m('span', {}, 'Heure de départ')),
            m(mdl.Cell, { width: 2 }, m('span', {}, '09:21'))])]),
        m(mdl.TabPanel, { id: 'tomorrow' }, 'tomorrow'),
        m(mdl.TabPanel, { id: 'other' }, 'other')])])])];

    //m(mdl.Button, {ripple: true, accent: true, raised: true}, "I'm a button!")
  }
}
