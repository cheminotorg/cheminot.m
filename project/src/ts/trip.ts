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

function renderStopTimes(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
  if(!ctrl.displayed()) {
    return [];
  } else {
    return ctrl.trip().map((arrivalTime, index) => {
      const waiting = moment(arrivalTime.departure).diff(moment(arrivalTime.arrival));
      const hasChangement = (() => {
        const next = ctrl.trip()[index + 1];
        if(next) {
          return next.tripId !== arrivalTime.tripId;
        } else {
          return false;
        }
      })();

      const attrs: Attributes = {
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

  const stopTimesList = renderStopTimes(ctrl);
  const startStopTime = _.head(ctrl.trip());
  const endStopTime = _.last(ctrl.trip());

  return [
    m('div.top-bar', {}, [
      m('div', {}, [
        m('span.start', {}, startStopTime ? startStopTime.stopName : ''),
        m('span.to'),
        m('span.end', {}, endStopTime ? endStopTime.stopName : '')
      ])
    ]),
    m('div#wrapper', {}, m('ul.stops', {}, stopTimesList))
  ];
}

export const component: m.Component<Ctrl> = {

  controller(): Ctrl {

    const id = m.route.param("id");
    const scope = () => <HTMLElement> document.querySelector('#trip');
    const trip = Cache.getTrip(id);
    const arrivalTimes = trip ? trip.arrivalTimes : [];
    const displayed = () => Routes.matchTrip(m.route());

    if(displayed()) {
      native.GoogleAnalytics.trackView('Trip');
      window.parent.postMessage({
        event: 'cheminot:selecttrip',
        trip: arrivalTimes,
        tdsp: id
      }, window.location.origin);
    }

    const ctrl = {
      scope: scope,

      displayed: displayed,

      id: id,

      trip: () => arrivalTimes,

      iscroll: _.once(function() {
        const wrapper = <HTMLElement> scope().querySelector('#wrapper');
        return new IScroll(wrapper, { bounce: false });
      }),

      adaptWrapperTop: (ctrl: Ctrl) => {
        const wrapper = <HTMLElement> ctrl.scope().querySelector('#wrapper');
        const topBar = <HTMLElement> scope().querySelector('.top-bar');
        const top = topBar.offsetTop + topBar.offsetHeight;
        wrapper.style.top = top + 'px';
      }
    };

    native.onBackButton('trip', () => {
      if(ctrl.displayed()) {
        window.parent.postMessage({
          event: 'cheminot:unselecttrip'
        }, window.location.origin);
        history.back();
      }
    });

    return ctrl;
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
};
