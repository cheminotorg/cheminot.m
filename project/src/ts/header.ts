import m = require('mithril');

export interface Ctrl {
}

export class Header implements m.Module<Ctrl> {

  controller(): Ctrl {
    return {
    };
  }

  view(ctrl: Ctrl) {
    return [
      m("h1", {}, "Cheminot")
    ];
  }
}

var header = new Header();

export function get(): Header {
  return header;
}
