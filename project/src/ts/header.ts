import m = require('mithril');

export interface Ctrl {
}

export class Header implements m.Module<Ctrl> {

  controller(): Ctrl {
    return {
    };
  }

  view(ctrl: Ctrl) {
    var info = m('span.info', {});
    var loader = m('div.holo', {}, [
      m('div.outer', {}),
      m('div.inner', {})
    ]);
    return [
      m("h1", {}, "Cheminot"),
      loader
    ];
  }
}

var header = new Header();

export function get(): Header {
  return header;
}
