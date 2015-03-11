import m = require('mithril');
import DatePicker = require('datepicker');
import TimePicker = require('timepicker');
import Alert = require('alert');
import Utils = require('utils');

export type Ctrl = {
  alert: Alert.Ctrl;
  timePicker: TimePicker.Ctrl;
  datePicker: DatePicker.Ctrl;
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  var attrs = Utils.m.handleAttributes({ class: 'fade-in'}, (name, value) => {
    if((name + ':' + value) == 'class:fade-in') {
      return ctrl.alert.displayed() || ctrl.timePicker.displayed() || ctrl.datePicker.displayed();
    }
    return true;
  });

  return [m('div.modals', attrs,[
    Alert.get().view(ctrl.alert),
    DatePicker.get().view(ctrl.datePicker),
    TimePicker.get().view(ctrl.timePicker)
  ])];
}

var modals: m.Module<Ctrl> = {
  controller(): Ctrl {
    return {
      alert: Alert.get().controller(),
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
