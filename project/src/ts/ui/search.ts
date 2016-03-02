import m = require('mithril');
import mdl = require('mithril-mdl');
import { component as Layout } from './layout';

export type Ctrl = {
  vm: VM;
}

type VM = {
  displayed(): boolean;
}

function vm(): VM {
  return {
    displayed() {
      return /\/search/.test(m.route());
    }
  }
}

export const component: m.Component<Ctrl> = {

  controller(): Ctrl {
    return {
      vm: vm()
    };
  },

  view(ctrl: Ctrl) {
    return m(Layout, { id: 'search', fadein: ctrl.vm.displayed(), title: 'Ajouter un trajet' }, [
      m(mdl.Grid, {}, [
        m(mdl.Cell, { width: 4 }, [
          m(mdl.TextInput, { value: '', label: "Station de départ", id: 'departure' }, []),
          m(mdl.TextInput, { value: '', label: "Station d'arrivée", id: 'arrival' }, [])]),
        m(mdl.Cell, { width: 4 }, [
          InputDate(ctrl),
          InputTime(ctrl)]),
        m(mdl.Cell, { width: 4 }, Submit(ctrl))])]);
  }
}

function InputDate(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  return m('input', { type: 'date' });
}

function InputTime(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  return m('input', { type: 'time' });
}

function Submit(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  return m('button', { type: 'submit' }, 'Rechercher');
}
