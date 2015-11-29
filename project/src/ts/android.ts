import m = require('mithril');
import mdl = require('mithril-mdl');
import Toolkit = require('./toolkit');

export type Ctrl = {
}

export const component = {
  controller(): Ctrl {
    return {
    };
  },

  view(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
    const attributes = {
      fixedHeader: true,
      fixedTabs: true,
      config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
        if (!isUpdate) {
          var tabs = document.querySelectorAll('.mdl-layout__tab-ripple-container');
          for (let index = 0; index <= tabs.length; index++) {
            const tab = tabs.item(index);
            if(tab) componentHandler.upgradeElement(tab, 'MaterialRipple');
          }

          setTimeout(() => {
            window.setTimeout(() => {
              window.parent.postMessage({ event: 'cheminot:ready' }, window.location.origin);
              Toolkit.Event.trigger('cheminot:ready')
            }, 1000)
          }, 500);
        }
      }
    }

    return [m('div', attributes, [m(mdl.Layout, attributes, [
      m(mdl.Header, {}, [
        m(mdl.HeaderRow, {}, [
          m(mdl.Title, {}, "Cheminot")]),
        m(mdl.Tabs, { ripple: true }, [
          m(mdl.Tab, { href: "#today", active: true }, 'Aujourd\'hui'),
          m(mdl.Tab, { href: "#tomorrow" }, 'Demain'),
          m(mdl.Tab, { href: "#other" }, 'Autre')])]),
      m(mdl.Drawer, {},
        [m(mdl.Title, {}, "Settings")]),
      m(mdl.Content, {}, [
        m(mdl.TabPanel, { id: 'today', active: true }, 'today'),
        m(mdl.TabPanel, { id: 'tomorrow' }, 'tomorrow'),
        m(mdl.TabPanel, { id: 'other' }, 'other')])])])];

    //m(mdl.Button, {ripple: true, accent: true, raised: true}, "I'm a button!")
  }
}
