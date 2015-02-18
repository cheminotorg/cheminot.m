import m = require('mithril');
import DatePicker = require('datepicker');
import TimePicker = require('timepicker');
import About = require('about');

export type Ctrl = {
  about: About.Ctrl;
  timePicker: TimePicker.Ctrl;
  datePicker: DatePicker.Ctrl;
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  return [m('div.modals', {},[
    About.get().view(ctrl.about),
    DatePicker.get().view(ctrl.datePicker),
    TimePicker.get().view(ctrl.timePicker)
  ])];
}

var modals: m.Module<Ctrl> = {
  controller(): Ctrl {
    return {
      about: About.get().controller(),
      timePicker: TimePicker.get().controller(),
      datePicker: DatePicker.get().controller()
    };
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

export function get(): m.Module<Ctrl> {
  return modals;
}

export function show(selector: string)  {
  var picker = <HTMLElement> document.querySelector(selector);
  var modals = <HTMLElement> document.querySelector('.modals');
  picker.classList.add('fade-in');
  modals.classList.add('fade-in');
}

export function hide(selector: string) {
  var picker = <HTMLElement> document.querySelector(selector);
  var modals = <HTMLElement> document.querySelector('.modals');
  modals.classList.remove('fade-in');
  picker.classList.remove('fade-in');
}
