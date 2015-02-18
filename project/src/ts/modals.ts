import m = require('mithril');
import DatePicker = require('datepicker');
import TimePicker = require('timepicker');
import About = require('about');
import Message = require('message');
import Utils = require('utils');

export type Ctrl = {
  message: Message.Ctrl;
  about: About.Ctrl;
  timePicker: TimePicker.Ctrl;
  datePicker: DatePicker.Ctrl;
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  var attrs = Utils.m.handleAttributes({ class: 'fade-in'}, (name, value) => {
    if((name + ':' + value) == 'class:fade-in') {
      return ctrl.message.displayed() || ctrl.timePicker.displayed() || ctrl.datePicker.displayed() || ctrl.about.displayed();
    }
    return true;
  });

  return [m('div.modals', attrs,[
    Message.get().view(ctrl.message),
    About.get().view(ctrl.about),
    DatePicker.get().view(ctrl.datePicker),
    TimePicker.get().view(ctrl.timePicker)
  ])];
}

var modals: m.Module<Ctrl> = {
  controller(): Ctrl {
    return {
      message: Message.get().controller(),
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
