import Touch = require('ui/touch');
import m = require('mithril');
import Toolkit = require('toolkit');

export type Button = {}

function btn(label: string, config: (el: HTMLElement, isUpdate: boolean, context: m.Context) => void): m.VirtualElement<Button> {

  const classList = ['button', 'mdl-button', 'mdl-js-button', 'mdl-button--raised', 'mdl-js-ripple-effect', 'mdl-button--accent'].join('.');

  return m(classList, { config: (el: HTMLElement, isUpdate: boolean, context: m.Context) => {

    if(!isUpdate) componentHandler.upgradeElement(el);

    config && config(el, isUpdate, context);

  }}, label);
}

export function button(label: string, tapHandler: (e: TouchEvent) => void, holdHandler: () => void = Toolkit.noop): m.VirtualElement<Button> {

  return btn(label, Touch.m.ontap(tapHandler, holdHandler));

}
