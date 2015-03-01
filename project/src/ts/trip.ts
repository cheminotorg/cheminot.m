import m = require('mithril');
import Routes = require('routes');
import _ = require('lodash');
import IScroll = require('IScroll');
import moment = require('moment');
import native = require('native');
import Cache = require('cache');

export type Ctrl = {
  scope: () => HTMLElement;
  displayed: () => boolean;
  id: string;
  trip: () => ArrivalTime[];
  iscroll: () => IScroll;
  adaptWrapperTop: (ctrl: Ctrl) => void;
}

function formatTime(dateTime: Date): string {
  return moment(dateTime).format('HH:mm');
}

function renderStopTimes(ctrl: Ctrl): m.VirtualElement[] {
  if(!ctrl.displayed()) {
    return new Array<m.VirtualElement>();
  } else {
    return ctrl.trip().map((arrivalTime, index) => {
      var waiting = moment(arrivalTime.departure).diff(moment(arrivalTime.arrival));
      var hasChangement = (() => {
        var next = ctrl.trip()[index + 1];
        if(next) {
          return next.tripId !== arrivalTime.tripId;
        } else {
          return false;
        }
      })();

      var attrs: Attributes = {
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
        m('div.left', {},
          m('div.time', {}, [
            m('span.alarm-clock'),
            m('span.at', {}, formatTime(arrivalTime.departure))
          ])),
        m('div.right', {},
          m('div.stop', {}, [
            m('span.name', {}, arrivalTime.stopName),
            m('span.waiting', {}, waiting > 0 ? moment.duration(waiting).asMinutes() + ' min': '')
          ]))
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
        m('span.to'),
        m('span.end', {}, endStopTime ? endStopTime.stopName : '')
      ])
    ]),
    m('div#wrapper', {}, m('ul.stops', {}, stopTimesList))
  ];
}

var trip: m.Module<Ctrl> = {
  controller(): Ctrl {
    var id = m.route.param("id");
    var scope = () => <HTMLElement> document.querySelector('#trip');
    var trip = Cache.getTrip(id);
    var arrivalTimes = trip ? trip.arrivalTimes : [];

    var ctrl = {
      scope: scope,

      displayed: () => {
        return Routes.matchTrip(m.route());
      },

      id: id,

      trip: () => {
        return arrivalTimes;
      },

      iscroll: _.once(function() {
        var wrapper = <HTMLElement> scope().querySelector('#wrapper');
        return new IScroll(wrapper, { bounce: false });
      }),

      adaptWrapperTop: (ctrl: Ctrl) => {
        var wrapper = <HTMLElement> ctrl.scope().querySelector('#wrapper');
        var title = <HTMLElement> scope().querySelector('.title');
        var top = title.offsetTop + title.offsetHeight;
        wrapper.style.top = top + 'px';
      }
    };

    native.onBackButton('trip', () => {
      if(ctrl.displayed()) {
        history.back();
      }
    });

    return ctrl;
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
};

export function get(): m.Module<Ctrl> {
  return trip;
}
