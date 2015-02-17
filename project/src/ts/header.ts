import m = require('mithril');

export type Ctrl = {}

var header = {
  controller(): Ctrl {
    return {
    };
  },

  view(ctrl: Ctrl) {
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

export function get(): m.Module<Ctrl> {
  return header;
}
