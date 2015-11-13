import m = require('mithril');
import Q = require('q');
import Zanimo = require('Zanimo');
import _ = require('lodash');
import IScroll = require('IScroll');
import moment = require('moment');
import Toolkit = require('toolkit');
import Suggestions = require('suggestions');
import Routes = require('routes');
import i18n = require('i18n');
import native = require('native');
import DatePicker = require('datepicker');
import TimePicker = require('timepicker');
import Touch = require('touch');
import mdl = require('mdl');

export type Ctrl = {
  scope: () => HTMLElement;
  displayed: () => boolean;
  onTabTouched: (ctrl: Ctrl, e: Event) => void;
  onInputStationTouched: (ctrl: Ctrl, e: Event) => void;
  onResetStationTouched: (ctrl: Ctrl, e: Event) => void;
  onInputStationSubmit: (ctrl: Ctrl, e: Event) => void;
  onSubmitTouched: (ctrl: Ctrl, e: Event) => void;
  onDateTouched: (ctrl: Ctrl, e: Event) => void;
  onTimeTouched: (ctrl: Ctrl, e: Event) => void;
  onInputStationKeyUp: (ctrl: Ctrl, e: Event) => void;
  onScrollStations: (ctrl: Ctrl, e: Event) => void;
  inputStationStartTerm: (value?: string) => string;
  inputStationEndTerm: (value?: string) => string;
  inputStationStartSelected: (value?: string) => string;
  inputStationEndSelected: (value?: string) => string;
  isInputStationStartDisabled: (value?: boolean) => boolean;
  isInputStationEndDisabled: (value?: boolean) => boolean;
  currentTab: (value?: string) => string;
  isTodayTabSelected: (value?: boolean) => boolean;
  isTomorrowTabSelected: (value?: boolean) => boolean;
  isOtherTabSelected: (value?: boolean) => boolean;
  stations: (value?: Array<SuggestedStation>) => Array<SuggestedStation>;
  onStationSelected: (ctrl: Ctrl, e: Event) => void;
  inputDateSelected: (value?: Date) => Date;
  inputTimeSelected: (value?: Date) => Date;
  iscroll: () => IScroll;
  adaptWrapperTop: (ctrl: Ctrl) => void;
  isViewportUp: (value?: boolean) => boolean;
}

function formatDate(date: Date) {
  return date ? moment(date).format('YYYY-MM-DD') : '';
}

function formatTime(date: Date) {
  return date ? moment(date).format('HH:mm') : '';
}

/// RENDER TABS

function renderTabs(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const config = Touch.m.ontap(_.partial(ctrl.onTabTouched, ctrl));

  const todayAttrs = Toolkit.m.attributes
  ({ 'class:selected': ctrl.isTodayTabSelected() })
  ({ class: 'today selected'}, config);

  const tomorrowAttrs = Toolkit.m.attributes
  ({ 'class:selected': ctrl.isTomorrowTabSelected() })
  ({ class: 'tomorrow selected'}, config);

  const otherAttrs = Toolkit.m.attributes
  ({ 'class:selected': ctrl.isOtherTabSelected() })
  ({ class: 'other selected'}, config);

  const hint = m("div", { class: "hint" });

  return m('ul', { class: 'top-bar tabs'}, [
    m('li', todayAttrs, [m('span.label', {}, i18n.get('today')), hint]),
    m('li', tomorrowAttrs, [m('span.label', {}, i18n.get('tomorrow')), hint]),
    m('li', otherAttrs, [m('span.label', {}, i18n.get('other')), hint])
  ])
}

/// RENDER INPUTS STATION

function renderInputsStation(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const inputStationWrapperAttrs = {
    config: Touch.m.ontap(_.partial(ctrl.onInputStationTouched, ctrl))
  };

  const initInputStationAttrs = (isStartStation: boolean) => {
    const term = isStartStation ? ctrl.inputStationStartTerm() : ctrl.inputStationEndTerm();
    const disabled = isStartStation ? ctrl.isInputStationStartDisabled() : ctrl.isInputStationEndDisabled();

    const attrs = Toolkit.m.attributes
    ({ 'disabled:true': disabled })
    ({ disabled: "true", type: "text", value: term }, (el: HTMLElement, isUpdate: boolean) => {
      if(!disabled) {
        window.setTimeout(() => {
          el.focus();
          if(!native.Keyboard.isVisible()) native.Keyboard.show();
        }, 100)
      }
      if(!isUpdate) {
        el.addEventListener('input', _.partial(ctrl.onInputStationKeyUp, ctrl))
      }
    });

    return attrs;
  };

  const initResetStationAttrs = (isStartStation: boolean) => {
    const isSelected = isStartStation ? ctrl.inputStationStartSelected() !='' : ctrl.inputStationEndSelected() != '';
    const isEnabled = isStartStation ? !ctrl.isInputStationStartDisabled() : !ctrl.isInputStationEndDisabled();

    const attrs = Toolkit.m.attributes
    ({ 'class:focus': isSelected || isEnabled })
    ({ class: 'font reset focus', type: 'button' }, Touch.m.ontap(_.partial(ctrl.onResetStationTouched, ctrl)));

    return attrs;
  };

  const formAttrs = {
    config: (el: HTMLElement, isUpdate: boolean, context: m.Context) => {
      if(!isUpdate) {
        el.addEventListener('submit', _.partial(ctrl.onInputStationSubmit, ctrl));
      }
    }
  };

  return m("div", { class: "start-end" },
           m("form", formAttrs, [
             m("div", { class: "input start" }, [
               m("div.above", inputStationWrapperAttrs),
               m("input", _.merge({ name: "start", autocomplete: "off", placeholder: i18n.get('departure') }, initInputStationAttrs(true))),
               m("button", initResetStationAttrs(true))
             ]),
             m("input.submit", { type: 'submit' }, []),
             m("div", { class: "input end"}, [
               m("div.above", inputStationWrapperAttrs),
               m("input", _.merge({ name: "end", autocomplete: "off", placeholder: i18n.get('arrival') }, initInputStationAttrs(false))),
               m("button", initResetStationAttrs(false))])]));
}

/// RENDER STATION SUGGESTIONS

function renderStations(ctrl: Ctrl): m.VirtualElement<Ctrl> {
  const term = (ctrl.isInputStationEndDisabled() ? ctrl.inputStationStartTerm() : ctrl.inputStationEndTerm()).toLowerCase();
  const stationAttrs = function(index: number) {
    return {
      config: function(el: HTMLElement, isUpdate: boolean, context: m.Context) {
        if(!isUpdate) {
          Touch.ontap(el, _.partial(ctrl.onStationSelected, ctrl))(context)
        }
        if((index + 1) === ctrl.stations().length) {
          ctrl.adaptWrapperTop(ctrl);
          ctrl.iscroll().refresh();
        }
      }
    }
  }

  const stopsList = ctrl.stations().map((station, index) => {
    const name = Suggestions.adaptSaintWord(term, station) || Suggestions.adaptCompoundWord(term, station) || station.name;
    const matchedAt = name.toLowerCase().indexOf(term.toLowerCase());
    const left = name.substring(0, matchedAt);
    const match = name.substring(matchedAt, matchedAt + term.length)
    const right = name.substring(matchedAt + term.length)
    return mdl.listItem(_.merge({ "data-id": station.id, "data-name": name }, stationAttrs(index)),
             m('div', {},
               m('span', {}, [
                 left,
                 m('span', { class: 'match' }, match),
                 right])))
  });

  const emptyResult = m('li.empty', {}, m('div', {}, i18n.get('no-result')));

  const inputDisabled = ctrl.isInputStationStartDisabled() && ctrl.isInputStationEndDisabled();

  const items = (!stopsList.length && term && !inputDisabled) ? emptyResult : stopsList;

  return m("div", { class: "stations" },
           m("div", { id: "wrapper" },
             m("ul", { class: "suggestions" }, items)));
}

/// RENDER DATETIME SELECTOR

function renderDateTime(ctrl: Ctrl): m.VirtualElement<Ctrl> {

  const inputTimeAttrs = {
    config: Touch.m.ontap(_.partial(ctrl.onTimeTouched, ctrl))
  };

  const dateSelectorAttrs = Toolkit.m.attributes
  ({ 'class:other':  ctrl.isOtherTabSelected() })
  ({ 'class': 'date other' }, Touch.m.ontap(_.partial(ctrl.onDateTouched, ctrl)));

  const submitAttrs = Toolkit.m.attributes
  ({ 'class:enabled': canBeSubmitted(ctrl), 'class:disabled': !canBeSubmitted(ctrl)})
  ({ 'class': 'submit enabled disabled'}, Touch.m.ontap(_.partial(ctrl.onSubmitTouched, ctrl)));

  return m("ul", { class: 'datetime'}, [
    m("li", dateSelectorAttrs, [
      m('div', {}, [
        m("span", { class: "label" }, i18n.get('departure-date')),
        m("span", { class: "value" }, formatDate(ctrl.inputDateSelected()))
      ])]),
    m("li", _.merge({ class: "time" }, inputTimeAttrs), [
      m('div', {}, [
        m("span", { class: "label" }, i18n.get('departure-time')),
        m("span", { class: "value" }, formatTime(ctrl.inputTimeSelected()))
      ])]),
    m("li", submitAttrs, [
      m('div', {}, [
      m("span", {}, i18n.get('search')),
        m("button", { class: "font go" })])])]);
}

function render(ctrl: Ctrl): m.VirtualElement<Ctrl>[] {
  return [
    renderTabs(ctrl),
    renderInputsStation(ctrl),
    renderStations(ctrl),
    renderDateTime(ctrl)
  ];
}

export const component: m.Component<Ctrl> = {

  controller(): Ctrl {
    const startTerm = m.route.param('start') || '';
    const endTerm = m.route.param('end') || '';
    const startStation = startTerm ? Suggestions.getStationByTerm(startTerm) : null;
    const endStation = endTerm ? Suggestions.getStationByTerm(endTerm) : null;
    const tab = m.route.param('tab') || 'today';
    const currentTab = m.prop(tab);
    const at = (() => {
      const x = parseInt(m.route.param('at'), 10);
      return (x ? new Date(x) : Toolkit.DateTime.now());
    })();
    const displayed = () => Routes.matchSearch(currentTab(), m.route(), startTerm, endTerm, at);

    if(displayed()) native.GoogleAnalytics.trackView('Search');

    const ctrl = {
      scope: () => {
        return <HTMLElement> document.querySelector('#search');
      },

      displayed: displayed,

      onTabTouched: (ctrl: Ctrl, e: Event) => {
        const tab = <HTMLElement> e.currentTarget;

        ctrl.isTodayTabSelected(false);
        ctrl.isTomorrowTabSelected(false);
        ctrl.isOtherTabSelected(false);

        if(isTodayTab(tab)) {
          ctrl.isTodayTabSelected(true)
          ctrl.inputDateSelected(Toolkit.DateTime.now());
        } else if(isTomorrowTab(tab)) {
          ctrl.isTomorrowTabSelected(true);
          ctrl.inputDateSelected(Toolkit.DateTime.addDays(Toolkit.DateTime.now(), 1));
        } else if(isOtherTab(tab)) {
          ctrl.isOtherTabSelected(true);
        }
        m.redraw();
      },

      onInputStationTouched: (ctrl: Ctrl, e: Event) => {
        const station = <HTMLElement> e.currentTarget;
        const inputStation = <HTMLInputElement> station.nextElementSibling;
        const hideInput = isInputStationStart(inputStation) ? hideInputStationEnd : hideInputStationStart;
        m.startComputation();
        const selected = isInputStationStart(inputStation) ? ctrl.inputStationStartSelected() : ctrl.inputStationEndSelected();
        window.parent.postMessage({
          event: 'cheminot:resetstop',
          stopId: selected
        }, window.location.origin);
        setInputStationSelected(ctrl, inputStation, '');
        ctrl.stations(Suggestions.search(inputStation.value));
        Q.all([hideInput(ctrl), hideDateTimePanel(ctrl), Q.delay(80)]).then(() => {
          return moveUpViewport(ctrl).then(() => {
            enableInputStation(ctrl, inputStation);
            native.Keyboard.show().fin(() => m.endComputation())
          });
        });
      },

      onInputStationKeyUp: (ctrl: Ctrl, e: Event) => {
        const inputStation = <HTMLInputElement> e.currentTarget;
        const value = isInputStationStart(inputStation) ? ctrl.inputStationStartTerm() : ctrl.inputStationEndTerm();
        if(value != inputStation.value) {
          setInputStationValue(ctrl, inputStation, inputStation.value);
          ctrl.stations(Suggestions.search(inputStation.value));
          m.redraw();
        }
      },

      inputStationStartTerm: m.prop(startTerm),

      inputStationEndTerm: m.prop(endTerm),

      inputStationStartSelected: m.prop(startStation ? startStation.id : ''),

      inputStationEndSelected: m.prop(endStation ? endStation.id : ''),

      isInputStationStartDisabled: m.prop(true),

      isInputStationEndDisabled: m.prop(true),

      currentTab: currentTab,

      isTodayTabSelected: Toolkit.m.prop(tab == 'today', (active) => {
        if(active) currentTab('today');
      }),

      isTomorrowTabSelected: Toolkit.m.prop(tab == 'tomorrow', (active) => {
        if(active) currentTab('tomorrow');
      }),

      isOtherTabSelected: Toolkit.m.prop(tab == 'other', (active) => {
        if(active) currentTab('other');
      }),

      onDateTouched: (ctrl: Ctrl, e: Event) => {
        DatePicker.show(ctrl.inputDateSelected()).then((date) => {
          ctrl.inputDateSelected(date);
          m.redraw();
        });
      },

      onTimeTouched: (ctrl: Ctrl, e: Event) => {
        TimePicker.show(ctrl.inputTimeSelected()).then((date) => {
          ctrl.inputTimeSelected(date);
          m.redraw();
        });
      },

      inputDateSelected: m.prop(at),

      inputTimeSelected: m.prop(at),

      isViewportUp: m.prop(false),

      iscroll: _.once(function() {
        const wrapper = this.scope().querySelector('#wrapper');
        const iscroll = new IScroll(wrapper);
        return iscroll;
      }),

      adaptWrapperTop: (ctrl: Ctrl) => {
        const wrapper = <HTMLElement> ctrl.scope().querySelector('#wrapper');
        const startEndWrapper = <HTMLElement> ctrl.scope().querySelector('.start-end');
        const top = startEndWrapper.offsetTop + startEndWrapper.offsetHeight + Math.abs(document.body.offsetTop) + 10;
        wrapper.style.top = top + 'px';
      },

      stations: m.prop([]),

      onStationSelected: (ctrl: Ctrl, e: Event) => {
        const station = <HTMLElement> e.currentTarget;
        const id = station.getAttribute('data-id');
        const name = station.getAttribute('data-name');
        const inputStation = currentInputStation(ctrl);
        ctrl.stations([]);
        setInputStationValue(ctrl, inputStation, name);
        setInputStationSelected(ctrl, inputStation, id);
        resetInputStationsPosition(ctrl, inputStation);
        window.parent.postMessage({
          event: 'cheminot:selectstop',
          stopId: id
        }, window.location.origin);
        m.redraw();
      },

      onInputStationSubmit: (ctrl: Ctrl, e: Event) => {
        e.preventDefault();
        const station = ctrl.stations()[0];
        if(station) {
          const inputStation = currentInputStation(ctrl);
          ctrl.stations([]);
          setInputStationValue(ctrl, inputStation, station.name);
          setInputStationSelected(ctrl, inputStation, station.id);
          resetInputStationsPosition(ctrl, inputStation);
          window.parent.postMessage({
            event: 'cheminot:selectstop',
            stopId: station.id
          }, window.location.origin);
        }
      },

      onResetStationTouched: (ctrl: Ctrl, e: Event) => {
        e.stopPropagation();
        const resetButton = <HTMLElement> e.currentTarget;
        const inputStation = <HTMLInputElement> resetButton.previousElementSibling;
        const term = inputStation.value;
        if(ctrl.isViewportUp() && !term) resetInputStationsPosition(ctrl, inputStation);
        const selected = isInputStationStart(inputStation) ? ctrl.inputStationStartSelected() : ctrl.inputStationEndSelected();
        window.parent.postMessage({
          event: 'cheminot:resetstop',
          stopId: selected
        }, window.location.origin);
        setInputStationValue(ctrl, inputStation, '');
        setInputStationSelected(ctrl, inputStation, '');
        ctrl.stations([]);
        m.redraw();
      },

      onSubmitTouched: (ctrl: Ctrl, e: Event) => {
        if(canBeSubmitted(ctrl)) {
          const atDateTime = Toolkit.DateTime.setSameTime(ctrl.inputDateSelected(), ctrl.inputTimeSelected());
          const uri = Routes.search(ctrl.currentTab(), ctrl.inputStationStartTerm(), ctrl.inputStationEndTerm(), atDateTime);
          window.history.pushState({}, '', '#' + uri);
          m.route(Routes.departures(ctrl.inputStationStartSelected(), ctrl.inputStationEndSelected(), atDateTime));
        }
      },

      onScrollStations: (ctrl: Ctrl, e: Event) => {
        const inputStationStart = <HTMLElement> ctrl.scope().querySelector('.input.start input');
        const inputStationEnd = <HTMLElement> ctrl.scope().querySelector('.input.end input');
        inputStationStart.blur();
        inputStationEnd.blur();
        native.Keyboard.close();
      }
    }

    native.onBackButton('search', () => {
      if(ctrl.displayed()) {
        if(ctrl.isViewportUp()) {
          m.startComputation();
          const inputStation = ctrl.isInputStationStartDisabled() ? getInputStationEnd(ctrl) : getInputStationStart(ctrl);
          resetInputStationsPosition(ctrl, inputStation);
          setInputStationValue(ctrl, inputStation, '');
          setInputStationSelected(ctrl, inputStation, '');
          ctrl.stations([]);
          m.endComputation();
        } else {
          m.route(Routes.now());
        }
      }
    });

    return ctrl;
  },

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
};

/** BACK STAGE */

function isInputStationStart(el: Element): boolean {
  return el.getAttribute('name') == "start";
}

function getInputStationStart(ctrl: Ctrl): HTMLInputElement {
  return <HTMLInputElement> ctrl.scope().querySelector('.input.start input');
}

function getInputStationEnd(ctrl: Ctrl): HTMLInputElement {
  return <HTMLInputElement> ctrl.scope().querySelector('.input.end input');
}

function hideInputStationEnd(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const inputStationEnd = <HTMLInputElement> ctrl.scope().querySelector('.input.end');
  const inputStationStart = <HTMLInputElement> ctrl.scope().querySelector('.input.start');
  inputStationStart.classList.remove('animating');
  inputStationEnd.classList.add('animating');
  const translateY = inputStationStart.offsetTop - inputStationEnd.offsetTop;
  return Zanimo(inputStationEnd, 'transform', 'translate3d(0,'+ translateY + 'px,0)', 10);
}

function showInputStationEnd(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const inputStationEnd = <HTMLElement> ctrl.scope().querySelector('.input.end');
  return Zanimo(inputStationEnd, 'transform', 'translate3d(0,0,0)', 10).then(() => {
    inputStationEnd.classList.remove('animating');
    inputStationEnd.classList.remove('above');
    return inputStationEnd;
  });
}

function hideInputStationStart(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const stationStart = <HTMLElement> ctrl.scope().querySelector('.input.start');
  stationStart.style.display = 'none';
  return Q(stationStart);
}

function showInputStationStart(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const stationStart = <HTMLElement> ctrl.scope().querySelector('.input.start');
  stationStart.style.display = 'block';
  return Q(stationStart);
}

function moveUpViewport(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const viewport = <HTMLElement> document.querySelector('#viewport');
  const header = <HTMLElement> document.querySelector('#header');
  const headerHeight = header.offsetHeight;
  const tabs = <HTMLElement> ctrl.scope().querySelector('.tabs');
  const tabsHeight = tabs.offsetHeight;
  const translateY = tabsHeight + headerHeight;
  return Zanimo(viewport, 'transform', 'translate3d(0,-'+ translateY + 'px,0)', 200).then(() => {
    viewport.style.bottom = '-' + translateY + 'px';
    ctrl.isViewportUp(true);
    return viewport;
  });
}

function moveDownViewport(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const viewport = <HTMLElement> document.querySelector('#viewport');
  return Zanimo(viewport, 'transform', 'translate3d(0,0,0)', 200).then(() => {
    viewport.style.bottom = '0';
    ctrl.isViewportUp(false);
    return viewport;
  });
}

function hideDateTimePanel(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const datetime = <HTMLElement> ctrl.scope().querySelector('.datetime');
  datetime.style.display = 'none';
  return Q(datetime);
}

function showDateTimePanel(ctrl: Ctrl): Q.Promise<HTMLElement> {
  const datetime = <HTMLElement> ctrl.scope().querySelector('.datetime');
  datetime.style.display = 'block';
  return Q(datetime);
}

function resetInputStationsPosition(ctrl: Ctrl, inputStation: HTMLInputElement): Q.Promise<void> {
  const showInput = isInputStationStart(inputStation) ? showInputStationEnd : showInputStationStart;
  const resetButton = <HTMLElement> inputStation.nextElementSibling;
  disableInputStation(ctrl, inputStation);
  m.redraw();
  return native.Keyboard.close().then(() => {
    moveDownViewport(ctrl).then(() => {
      showInput(ctrl).then(() => showDateTimePanel(ctrl));
    });
  });
}

function currentInputStation(ctrl: Ctrl): HTMLInputElement {
  const inputStation = <HTMLInputElement> ctrl.scope().querySelector('.input input:not([disabled])');
  return inputStation;
}

function canBeSubmitted(ctrl: Ctrl): boolean {
  const selectedStart = ctrl.inputStationStartSelected();
  const selectedEnd = ctrl.inputStationEndSelected();

  if(selectedStart && selectedEnd && (selectedStart != selectedEnd)) {
    if(ctrl.isOtherTabSelected()) {
      return ctrl.inputDateSelected() != null && ctrl.inputTimeSelected() != null;
    } else {
      return ctrl.inputTimeSelected() != null;
    }
  }
  return false;
}

function disableInputStation(ctrl: Ctrl, input: HTMLElement): void {
  if(isInputStationStart(input)) {
    ctrl.isInputStationStartDisabled(true)
  } else {
    ctrl.isInputStationEndDisabled(true);
  }
}

function enableInputStation(ctrl: Ctrl, input: HTMLElement): void {
  if(isInputStationStart(input)) {
    ctrl.isInputStationStartDisabled(false)
  } else {
    ctrl.isInputStationEndDisabled(false);
  }
}

function setInputStationValue(ctrl: Ctrl, input: HTMLElement, value: string): void {
  if(isInputStationStart(input)) {
    ctrl.inputStationStartTerm(value)
  } else {
    ctrl.inputStationEndTerm(value);
  }
}

function setInputStationSelected(ctrl: Ctrl, input: HTMLElement, id: string): void {
  isInputStationStart(input) ? ctrl.inputStationStartSelected(id) : ctrl.inputStationEndSelected(id);
}

function isTodayTab(el: HTMLElement): boolean {
  return el.classList.contains('today');
}

function isTomorrowTab(el: HTMLElement): boolean {
  return el.classList.contains('tomorrow');
}

function isOtherTab(el: HTMLElement): boolean {
  return el.classList.contains('other');
}
