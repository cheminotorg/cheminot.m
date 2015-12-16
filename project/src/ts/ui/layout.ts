import m = require('mithril');
import mdl = require('mithril-mdl');
import Toolkit = require('../toolkit');

export type Ctrl = {
}

interface LayoutArgs extends m.Attributes {
  fadein?: boolean,
  title?: string
}

export const component: m.Component<Ctrl> = {
  controller(): Ctrl {
    return {
    };
  },

  view<T>(ctrl: Ctrl, args: LayoutArgs, ...children: m.Children<T>): m.VirtualElement<Ctrl> {

    const { id, fadein, title, class: classArg } = args;

    const classList = classArg ? classArg.split(' ') : [];

    classList.push('view');

    const attributes = {
      id: id,
      class: classList.join(' '),
      config: (el: HTMLElement, isUpdate: boolean, context: m.Context) => {
        fadein ? el.classList.add('fadein') : el.classList.remove('fadein');
      }
    };

    return m('section', attributes, [
      m(mdl.Layout, { fixedHeader: true }, [
        m(mdl.Header, {}, [
          m(mdl.HeaderRow, {}, [
            m(mdl.Title, {}, title)],
            m(mdl.Spacer),
            m(mdl.Button, { id: 'menu', icon: true }, m(mdl.Icon, {}, 'more_vert')),
            m(mdl.Menu, { for: 'menu', bottomRight: true }, [
              m(mdl.MenuItem, {}, 'Menu item #1'),
              m(mdl.MenuItem, {}, 'Menu item #2')])
           )]),
        m(mdl.Drawer, {},
          [m(mdl.Title, {}, "Settings")]),
        m(mdl.Content, {}, children)])]);
  }
}
