import Touch = require('ui/touch');
import m = require('mithril');
import Toolkit = require('toolkit');

function mergeClassList(attributes: m.Attributes, classList: string[]): m.Attributes {

  const cl = classList.join(' ');

  attributes.class = attributes.class ? attributes.class + ' ' + cl : cl;

  return attributes;

}

function component<T, U, V>(tag: string, classList: string[], attributes: m.Attributes, ...children: Array<string | m.VirtualElement<T> | m.Component<T>>): m.VirtualElement<V> {

  attributes = mergeClassList(attributes, classList);

  const mdlConfig = (el: HTMLElement, isUpdate: boolean, context: m.Context, vdom: m.VirtualElement<V>) => {

    if(!isUpdate) componentHandler.upgradeElement(el);

  }

  if(attributes.config) {

    const originalConfig: m.ElementConfig = attributes.config;

    attributes.config = (el: HTMLElement, isUpdate: boolean, context: m.Context, vdom: m.VirtualElement<ListItem>) => {

      originalConfig(el, isUpdate, context, vdom);

      mdlConfig(el, isUpdate, context, vdom);

    }
  } else {

    attributes.config = mdlConfig;

  }

  return m(tag, attributes, children);
}

export type Button = {}

export function button<T>(attributes: m.Attributes, ...children: Array<string | m.VirtualElement<T> | m.Component<T>>): m.VirtualElement<Button> {

  const classList = ['button', 'mdl-button', 'mdl-js-button', 'mdl-button--raised', 'mdl-js-ripple-effect', 'mdl-button--accent'];

  return component('button', classList, attributes, children);
}

export module Button {

  export function apply(icon: string, attributes: m.Attributes): m.VirtualElement<Button> {

    const classList = ['mdl-button', 'mdl-js-button', 'mdl-button--icon'];

    return component('button', classList, attributes, m('i.material-icons', {}, icon));
  }

  export function search(attributes: m.Attributes): m.VirtualElement<Button> {

    return apply('search', attributes);
  }

  export function favorite(attributes: m.Attributes): m.VirtualElement<Button> {

    return apply('favorite', attributes);
  }

  export function favoriteBorder(attributes: m.Attributes): m.VirtualElement<Button> {

    return apply('favorite_border', attributes);
  }
}


export type ListItem = {}

export function listItem<T>(attributes: m.Attributes, ...children: Array<string | m.VirtualElement<T> | m.Component<T>>): m.VirtualElement<ListItem> {

  const classList = ['mdl-list__item', 'mdl-js-list__item', 'mdl-js-ripple-effect'];

  return component('li', classList, attributes, children);
}
