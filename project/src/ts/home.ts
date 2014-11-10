import m = require('mithril');
import Q = require('q');
import Zanimo = require('Zanimo');
import _ = require('lodash');
import IScroll = require('IScroll');
import moment = require('moment');
import Utils = require('utils');
import Suggestions = require('suggestions');
import Routes = require('routes');
import View = require('view');

export interface Ctrl {
  scope: () => HTMLElement;
  shouldBeHidden: () => boolean;
  onTabTouched: (ctrl: Ctrl, e: Event) => void;
  onInputStationTouched :(ctrl: Ctrl, e: Event) => void;
  onResetStationTouched: (ctrl: Ctrl, e: Event) => void;
  onSubmitTouched: (ctrl: Ctrl, e: Event) => void;
  onDateTimeChange: (ctrl: Ctrl, e: Event) => void;
  onInputStationKeyUp: (ctrl: Ctrl, e: Event) => void;
  onScrollStations: (ctrl: Ctrl, e: Event) => void;
  isScrollingStations: (value?: boolean) => boolean;
  inputStationStartTerm: (value?: string) => string;
  inputStationEndTerm: (value?: string) => string;
  inputStationStartSelected: (value?: string) => string;
  inputStationEndSelected: (value?: string) => string;
  isInputStationStartDisabled: (value?: boolean) => boolean;
  isInputStationEndDisabled: (value?: boolean) => boolean;
  isTodayTabSelected: (value?: boolean) => boolean;
  isTomorrowTabSelected: (value?: boolean) => boolean;
  isOtherTabSelected: (value?: boolean) => boolean;
  stations: (value?: Array<Suggestions.Station>) => Array<Suggestions.Station>;
  onStationSelected: (ctrl: Ctrl, e: Event) => void;
  inputDateSelected: (value?: string) => string;
  inputTimeSelected: (value?: string) => string;
  isSubmitDisabled: (value?: boolean) => boolean;
  iscroll: () => IScroll;
  adaptWrapperTop: (ctrl: Ctrl) => void;
  isViewportUp: (value?: boolean) => boolean;
}

/// RENDER TABS

function renderTabs(ctrl: Ctrl) {
  var attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if (!isUpdate) {
        el.addEventListener('touchend', _.partial(ctrl.onTabTouched, ctrl));
      }
    }
  }

  var todayAttrs = View.handleAttributes({ class: 'today selected'}, (name, value) => {
    if((name + ':' + value) == 'class:selected') {
      return ctrl.isTodayTabSelected();
    }
    return true;
  });

  var tomorrowAttrs = View.handleAttributes({ class: 'tomorrow selected'}, (name, value) => {
    if((name + ':' + value) == 'class:selected') {
      return ctrl.isTomorrowTabSelected();
    }
    return true;
  });

  var otherAttrs = View.handleAttributes({ class: 'other selected'}, (name, value) => {
    if((name + ':' + value) == 'class:selected') {
      return ctrl.isOtherTabSelected();
    }
    return true;
  });

  var hint = m("div", { class: "hint" });

  return m("ul", { class: "top-bar tabs"}, [
    m("li", _.merge(todayAttrs, attributes), ["Aujourd'hui", hint]),
    m("li", _.merge(tomorrowAttrs, attributes), ["Demain", hint]),
    m("li", _.merge(otherAttrs, attributes), ["Autre", hint])
  ])
}

/// RENDER INPUTS STATION

function renderInputsStation(ctrl: Ctrl) {
  var inputStationWrapperAttrs = {
    config: (el: HTMLElement, isUpdate: boolean, context: Object) => {
      if (!isUpdate) {
        Utils.DOM.Event.one(el, 'touchend', _.partial(ctrl.onInputStationTouched, ctrl));
      }
    }
  };

  var inputStationAttrs = (isStartStation: boolean) => {
    var attrs: View.Attributes = {
      disabled: "true",
      type: "text",
      onkeyup: _.partial(ctrl.onInputStationKeyUp, ctrl),
      value: isStartStation ? ctrl.inputStationStartTerm() : ctrl.inputStationEndTerm(),
      config: (el: HTMLElement, isUpdate: boolean, context: Object) => {
        if(!el.getAttribute('disabled')) el.focus();
      }
    };

    return View.handleAttributes(attrs, (name, value) => {
      if(name == 'disabled') {
        return isStartStation ? ctrl.isInputStationStartDisabled() : ctrl.isInputStationEndDisabled();
      } else return true;
    });
  };

  var resetStationAttrs = (isStartStation: boolean) => {
    return View.handleAttributes({
      class: 'font reset focus',
      type: 'button',
      config: (el: HTMLElement, isUpdate: boolean, context: any) => {
        if (!isUpdate) {
          el.addEventListener('touchend', _.partial(ctrl.onResetStationTouched, ctrl));
        }
      }
    }, (name, value) => {
      if((name + ':' + value) == 'class:focus') {
        var isSelected = isStartStation ? ctrl.inputStationStartSelected()!='' : ctrl.inputStationEndSelected()!='';
        var isEnabled = isStartStation ? !ctrl.isInputStationStartDisabled() : !ctrl.isInputStationEndDisabled();
        return isSelected || isEnabled;
      }
      return true;
    });
  };

  return m("div", { class: "start-end" },
           m("form", {}, [
             m("div", _.merge({ class: "input start" }, inputStationWrapperAttrs), [
               m("input", _.merge({ name: "start", placeholder: "Départ" }, inputStationAttrs(true))),
               m("button", resetStationAttrs(true))
             ]),
             m("div", _.merge({ class: "input end"}, inputStationWrapperAttrs), [
               m("input", _.merge({ name: "end", placeholder: "Arrivée" }, inputStationAttrs(false))),
               m("button", resetStationAttrs(false))
             ])
           ]));
}

/// RENDER STATION SUGGESTIONS

function renderStations(ctrl: Ctrl) {
  var term = ctrl.inputStationStartTerm() || ctrl.inputStationEndTerm();
  var stationAttrs = function(index: number) {
    return {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if (!isUpdate) {
          el.addEventListener('touchend', _.partial(ctrl.onStationSelected, ctrl));
        }
        if((index + 1) === ctrl.stations().length) {
          ctrl.adaptWrapperTop(ctrl);
          ctrl.iscroll().refresh();
        }
      }
    }
  }

  var suggestionsAttrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if (!isUpdate) {
        el.addEventListener('touchstart', _.partial(ctrl.onScrollStations, ctrl));
      }
    }
  }

  return m("div", { class: "stations" },
           m("div", { id: "wrapper" },
             m("ul", _.merge({ class: "suggestions list" }, suggestionsAttrs),
               ctrl.stations().map((station, index) => {
                 return m('li', _.merge({ "data-id": station.id, "data-name": station.name }, stationAttrs(index)),
                          m('div', {}, [
                            m('span', { class: 'match' }, _.take(station.name, term.length).join('')),
                            m('span', {}, _.drop(station.name, term.length).join(''))
                          ]));
               }))));
}

/// RENDER DATETIME SELECTOR

function renderDateTime(ctrl: Ctrl) {
  var inputDateTimeAttrs = {
    onchange: _.partial(ctrl.onDateTimeChange, ctrl),
  };

  var dateSelectorAttrs = View.handleAttributes({ class: 'date other' }, (name, value) => {
    if((name + ':' + value) == 'class:other') {
      return ctrl.isOtherTabSelected();
    }
    return true;
  });

  var submitAttrs: any = (() => {
    var attrs = View.handleAttributes({ class: 'submit enabled disabled' }, (name, value) => {
      if((name + ':' + value) == 'class:disabled') {
        return !canBeSubmitted(ctrl);
      } else if((name + ':' + value) == 'class:enabled'){
        return canBeSubmitted(ctrl);
      }
      return true;
    });

    return _.merge(attrs, {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if (!isUpdate) {
          el.addEventListener('touchend', _.partial(ctrl.onSubmitTouched, ctrl));
        }
      }
    });
  })();

  return m("ul", { class: 'list datetime'}, [
    m("li", dateSelectorAttrs, [
      m("span", { class: "label" }, "Date de départ"),
      m("span", { class: "value" }, ctrl.inputDateSelected()),
      m("input", _.merge({ type: "date" }, inputDateTimeAttrs))
    ]),
    m("li", { class: "time" }, [
      m("span", { class: "label" }, "Heure de départ"),
      m("span", { class: "value" }, ctrl.inputTimeSelected()),
      m("input", _.merge({ type: "time" }, inputDateTimeAttrs))
    ]),
    m("li", submitAttrs, [
      m("span", {}, "Rechercher"),
      m("button", { class: "font go" })
    ])
  ]);
}

function render(ctrl: Ctrl) {
  return [
    renderTabs(ctrl),
    renderInputsStation(ctrl),
    renderStations(ctrl),
    renderDateTime(ctrl)
  ];
}

export class Home implements m.Module<Ctrl> {

  controller(): Ctrl {
    return {
      scope: () => {
        return document.querySelector('#home');
      },

      shouldBeHidden: () => {
        return !Routes.matchHome(m.route());
      },

      onTabTouched: (ctrl: Ctrl, e: Event) => {
        var tab = e.currentTarget;

        m.startComputation();
        ctrl.isTodayTabSelected(false);
        ctrl.isTomorrowTabSelected(false);
        ctrl.isOtherTabSelected(false);

        if(isTodayTab(tab)) {
          ctrl.isTodayTabSelected(true)
        } else if(isTomorrowTab(tab)) {
          ctrl.isTomorrowTabSelected(true);
        } else if(isOtherTab(tab)) {
          ctrl.isOtherTabSelected(true);
        }
        m.endComputation();
      },

      onInputStationTouched: (ctrl: Ctrl, e: Event) => {
        var station = e.currentTarget;
        var inputStation = station.querySelector('input');
        var hideInput = isInputStationStart(inputStation) ? hideInputStationEnd : hideInputStationStart;
        m.startComputation();
        setInputStationValue(ctrl, inputStation, '');
        setInputStationSelected(ctrl, inputStation, '');
        Q.all([hideInput(ctrl), hideDateTimePanel(ctrl)]).then(() => {
          return moveUpViewport(ctrl).then(() => {
            enableInputStation(ctrl, inputStation);
            Utils.Keyboard.show().then(() => m.endComputation());
          });
        });
      },

      onInputStationKeyUp: (ctrl: Ctrl, e: Event) => {
        var inputStation = currentInputStation(ctrl);
        setInputStationValue(ctrl, inputStation, inputStation.value);
        ctrl.stations(Suggestions.search(inputStation.value));
      },

      inputStationStartTerm: m.prop('Chartres'),

      inputStationEndTerm: m.prop('Paris-Montparnasse'),

      inputStationStartSelected: m.prop('StopPoint:OCETrain TER-87394007'),

      inputStationEndSelected: m.prop('StopPoint:OCETrain TER-87391003'),

      isInputStationStartDisabled: m.prop(true),

      isInputStationEndDisabled: m.prop(true),

      isTodayTabSelected: m.prop(true),

      isTomorrowTabSelected: m.prop(false),

      isOtherTabSelected: m.prop(false),

      inputDateSelected: m.prop(moment().format('YYYY-MM-DD')),

      inputTimeSelected: m.prop(moment().format('HH:mm')),

      isViewportUp: m.prop(false),

      isSubmitDisabled: m.prop(true),

      isScrollingStations: m.prop(false),

      iscroll: _.once(function() {
        var wrapper = this.scope().querySelector('#wrapper');
        var iscroll = new IScroll(wrapper);
        iscroll.on('scrollStart', () => {
          this.isScrollingStations(true);
        });
        iscroll.on('scrollEnd', () => {
          this.isScrollingStations(false);
        });
        return iscroll;
      }),

      adaptWrapperTop: (ctrl: Ctrl) => {
        var wrapper = ctrl.scope().querySelector('#wrapper');
        var startEndWrapper = ctrl.scope().querySelector('.start-end');
        var top = startEndWrapper.offsetTop + startEndWrapper.offsetHeight + Math.abs(document.body.offsetTop) + 10;
        wrapper.style.top = top + 'px';
      },

      stations: m.prop([]),

      onStationSelected: (ctrl: Ctrl, e: Event) => {
        if(!ctrl.isScrollingStations()) {
          var station = e.currentTarget;
          var id = station.getAttribute('data-id');
          var name = station.getAttribute('data-name');
          var inputStation = currentInputStation(ctrl);
          m.startComputation();
          ctrl.stations([]);
          setInputStationValue(ctrl, inputStation, name);
          setInputStationSelected(ctrl, inputStation, id);
          resetInputStationsPosition(ctrl, inputStation);
          m.endComputation();
        }
      },

      onResetStationTouched: (ctrl: Ctrl, e: Event) => {
        e.stopPropagation();
        var resetButton = e.currentTarget;
        var inputStation = <HTMLInputElement> resetButton.previousElementSibling;
        m.startComputation();
        if(ctrl.isViewportUp()) resetInputStationsPosition(ctrl, inputStation);
        setInputStationValue(ctrl, inputStation, '');
        setInputStationSelected(ctrl, inputStation, '');
        ctrl.stations([]);
        m.endComputation();
      },

      onSubmitTouched: (ctrl: Ctrl, e: Event) => {
        var atDate = moment(ctrl.inputDateSelected()).toDate();
        var atTime = moment(ctrl.inputTimeSelected(), 'hh:mm').toDate();
        var atDateTime = Utils.DateTime.setSameTime(atTime, atDate);
        m.route(Routes.departures(ctrl.inputStationStartSelected(), ctrl.inputStationEndSelected(), atDateTime.getTime()));
      },

      onScrollStations: (ctrl: Ctrl, e: Event) => {
        ctrl.scope().querySelector('.input.start input').blur();
        ctrl.scope().querySelector('.input.end input').blur();
        Utils.Keyboard.hide();
      },

      onDateTimeChange: (ctrl: Ctrl, e: Event) => {
        var input = <HTMLInputElement> e.currentTarget;
        var wrapper = input.parentElement;
        if(wrapper.classList.contains('date')) {
          ctrl.inputDateSelected(input.value);
        } else if(wrapper.classList.contains('time')) {
          ctrl.inputTimeSelected(input.value);
        }
      }
    }
  }

  view(ctrl: Ctrl) {
    return render(ctrl);
  }
}

var home = new Home();

export function get(): Home {
  return home;
}

/** BACK STAGE */

function isInputStationStart(el: Element): boolean {
  return el.getAttribute('name') == "start";
}

function hideInputStationEnd(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var inputStationEnd = ctrl.scope().querySelector('.input.end');
  var inputStationStart = ctrl.scope().querySelector('.input.start');
  inputStationStart.classList.remove('animating');
  inputStationEnd.classList.add('animating');
  var translateY = inputStationStart.offsetTop - inputStationEnd.offsetTop;
  return Zanimo(inputStationEnd, 'transform', 'translate3d(0,'+ translateY + 'px,0)', 10);
}

function showInputStationEnd(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var inputStationEnd = ctrl.scope().querySelector('.input.end');
  return Zanimo(inputStationEnd, 'transform', 'translate3d(0,0,0)', 10).then(() => {
    inputStationEnd.classList.remove('animating');
    inputStationEnd.classList.remove('above');
    return inputStationEnd;
  });
}

function hideInputStationStart(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var stationStart = ctrl.scope().querySelector('.input.start');
  stationStart.style.display = 'none';
  return Utils.Promise.pure(stationStart);
}

function showInputStationStart(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var stationStart = ctrl.scope().querySelector('.input.start');
  stationStart.style.display = 'block';
  return Utils.Promise.pure(stationStart);
}

function moveUpViewport(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var viewport = document.querySelector('#viewport');
  var headerHeight = document.querySelector('#header').offsetHeight;
  var tabsHeight = ctrl.scope().querySelector('.tabs').offsetHeight;
  var translateY = tabsHeight + headerHeight;
  return Zanimo(viewport, 'transform', 'translate3d(0,-'+ translateY + 'px,0)', 200).then(() => {
    viewport.style.bottom = '-' + translateY + 'px';
    ctrl.isViewportUp(true);
    return viewport;
  });
}

function moveDownViewport(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var viewport = document.querySelector('#viewport');
  return Zanimo(viewport, 'transform', 'translate3d(0,0,0)', 200).then(() => {
    viewport.style.bottom = '0';
    ctrl.isViewportUp(false);
    return viewport;
  });
}

function hideDateTimePanel(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var datetime = ctrl.scope().querySelector('.datetime');
  datetime.style.display = 'none';
  return Utils.Promise.pure(datetime);
}

function showDateTimePanel(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var datetime = ctrl.scope().querySelector('.datetime');
  datetime.style.display = 'block';
  return Utils.Promise.pure(datetime);
}

function resetInputStationsPosition(ctrl: Ctrl, inputStation: HTMLInputElement): Q.Promise<void> {
  var showInput = isInputStationStart(inputStation) ? showInputStationEnd : showInputStationStart;
  var resetButton = <HTMLElement> inputStation.nextElementSibling;
  m.startComputation();
  disableInputStation(ctrl, inputStation);
  m.endComputation();
  return Utils.Keyboard.hide().then(() => {
    moveDownViewport(ctrl).then(() => {
      showInput(ctrl).then(() => {
        showDateTimePanel(ctrl).then(() => {
          Utils.DOM.Event.one(resetButton.parentElement, 'touchend', _.partial(ctrl.onInputStationTouched, ctrl));
        });
      });
    });
  });
}

function currentInputStation(ctrl: Ctrl): HTMLInputElement {
  var inputStation = <HTMLInputElement> ctrl.scope().querySelector('.input input:not([disabled])');
  return inputStation;
}

function canBeSubmitted(ctrl: Ctrl): boolean {
  var selectedStart = ctrl.inputStationStartSelected();
  var selectedEnd = ctrl.inputStationEndSelected();

  if(selectedStart && selectedEnd) {
    if(ctrl.isOtherTabSelected()) {
      return ctrl.inputDateSelected() != '' && ctrl.inputTimeSelected() != '';
    } else {
      return ctrl.inputTimeSelected() != '';
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
