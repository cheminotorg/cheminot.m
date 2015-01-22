import m = require('mithril');
import Routes = require('routes');
import _ = require('lodash');
import IScroll = require('IScroll');
import moment = require('moment');
import View = require('view');

export interface Ctrl {
  scope: () => HTMLElement;
  shouldBeHidden: () => boolean;
  id: string;
  trip: () => ArrivalTime[];
  iscroll: () => IScroll;
  adaptWrapperTop: (ctrl: Ctrl) => void;
}

function formatTime(dateTime: Date): string {
  return moment(dateTime).format('HH:mm');
}

function renderStopTimes(ctrl: Ctrl): m.VirtualElement[] {
  if(ctrl.shouldBeHidden()) {
    return new Array<m.VirtualElement>();
  } else {
    return ctrl.trip().map((arrivalTime, index) => {

      var waiting = moment(arrivalTime.departure).diff(moment(arrivalTime.arrival));
      var hasChangement = (() => {
        var prev = ctrl.trip()[index - 1];
        if(prev) {
          return prev.tripId !== arrivalTime.tripId;
        } else {
          return false;
        }
      })();

      var attrs: View.Attributes = {
        config: function(el: HTMLElement, isUpdate: boolean, context: any) {
          if((index + 1) === ctrl.trip().length) {
            ctrl.adaptWrapperTop(ctrl);
            ctrl.iscroll().refresh();
          }
        },
        key: arrivalTime.stopId,
        class: hasChangement ? 'changement' : ''
      };

      return m('li', attrs, [
        m('div.time', {}, [
          m('span.alarm-clock'),
          m('span.at', {}, formatTime(new Date(arrivalTime.departure)))
        ]),
        m('span.line'),
        m('div.stop', {}, [
          m('span.name', {}, arrivalTime.stopName),
          m('span.waiting', {}, waiting > 0 ? moment.duration(waiting).minutes() + ' min': '')
        ])
      ])
    });
  }
}

function render(ctrl: Ctrl) {

  var stopTimesList = renderStopTimes(ctrl);
  var startStopTime = _.head(ctrl.trip());
  var endStopTime = _.last(ctrl.trip());

  return [
    m('div.top-bar.title', {}, [
      m('div', {}, [
        m('span.start', {}, startStopTime ? startStopTime.stopName : ''),
        m('span.to', {}, endStopTime ? endStopTime.stopName : ''),
        m('span.end')
      ])
    ]),
    m('div#wrapper', {}, m('ul.stops', {}, stopTimesList))
  ];
}

export class Trip implements m.Module<Ctrl> {
  controller(): Ctrl {
    var id = m.route.param("id");
    var scope = () => <HTMLElement> document.querySelector('#trip');
    return {
      scope: scope,

      shouldBeHidden: () => {
        return !Routes.matchTrip(m.route());
      },

      id: id,

      trip: () => {
        return JSON.parse(sessionStorage.getItem(id));
      },

      iscroll: _.once(function() {
        var wrapper = <HTMLElement> scope().querySelector('#wrapper');
        return new IScroll(wrapper);
      }),

      adaptWrapperTop: (ctrl: Ctrl) => {
        var wrapper = <HTMLElement> ctrl.scope().querySelector('#wrapper');
        var title = <HTMLElement> scope().querySelector('.title');
        var top = title.offsetTop + title.offsetHeight;
        wrapper.style.top = top + 'px';
      }
    };
  }

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

var trip = new Trip();

export function get(): Trip {
  return trip;
}
