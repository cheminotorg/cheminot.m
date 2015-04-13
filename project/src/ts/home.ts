import m = require('mithril');
import Q = require('q');
import Zanimo = require('Zanimo');
import _ = require('lodash');
import IScroll = require('IScroll');
import moment = require('moment');
import Utils = require('utils');
import Suggestions = require('suggestions');
import Routes = require('routes');
import i18n = require('i18n');
import native = require('native');
import DatePicker = require('datepicker');
import TimePicker = require('timepicker');

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
  isScrollingStations: (value?: boolean) => boolean;
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
  stations: (value?: Array<Station>) => Array<Station>;
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

function renderTabs(ctrl: Ctrl): m.VirtualElement {
  var attributes = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if (!isUpdate) {
        el.addEventListener('touchend', _.partial(ctrl.onTabTouched, ctrl));
      }
    }
  }

  var todayAttrs = Utils.m.handleAttributes({ class: 'today selected'}, (name, value) => {
    if((name + ':' + value) == 'class:selected') {
      return ctrl.isTodayTabSelected();
    }
    return true;
  });

  var tomorrowAttrs = Utils.m.handleAttributes({ class: 'tomorrow selected'}, (name, value) => {
    if((name + ':' + value) == 'class:selected') {
      return ctrl.isTomorrowTabSelected();
    }
    return true;
  });

  var otherAttrs = Utils.m.handleAttributes({ class: 'other selected'}, (name, value) => {
    if((name + ':' + value) == 'class:selected') {
      return ctrl.isOtherTabSelected();
    }
    return true;
  });

  var hint = m("div", { class: "hint" });

  return m('ul', { class: 'top-bar tabs'}, [
    m('li', _.merge(todayAttrs, attributes), [m('span.label', {}, i18n.fr('today')), hint]),
    m('li', _.merge(tomorrowAttrs, attributes), [m('span.label', {}, i18n.fr('tomorrow')), hint]),
    m('li', _.merge(otherAttrs, attributes), [m('span.label', {}, i18n.fr('other')), hint])
  ])
}

/// RENDER INPUTS STATION

function renderInputsStation(ctrl: Ctrl): m.VirtualElement {
  var inputStationWrapperAttrs = {
    config: (el: HTMLElement, isUpdate: boolean, context: Object) => {
      if (!isUpdate) {
        Utils.$.one(el, 'touchend', _.partial(ctrl.onInputStationTouched, ctrl));
      }
    }
  };

  var inputStationAttrs = (isStartStation: boolean) => {
    var value = isStartStation ? ctrl.inputStationStartTerm() : ctrl.inputStationEndTerm();
    var attrs: Attributes = {
      disabled: "true",
      type: "text",
      value: value,
      config: (el: HTMLElement, isUpdate: boolean, context: Object) => {
        var disabled = isStartStation ? ctrl.isInputStationStartDisabled() : ctrl.isInputStationEndDisabled();
        if(!disabled) {
          window.setTimeout(() => {
            el.focus();
            if(!native.Keyboard.isVisible()) native.Keyboard.show();
          }, 100)
        }
        if (!isUpdate) {
          el.addEventListener('input', _.partial(ctrl.onInputStationKeyUp, ctrl))
        }
      }
    };
    return Utils.m.handleAttributes(attrs, (name, value) => {
      if(name == 'disabled') {
        return isStartStation ? ctrl.isInputStationStartDisabled() : ctrl.isInputStationEndDisabled();
      } else return true;
    });
  };

  var resetStationAttrs = (isStartStation: boolean) => {
    return Utils.m.handleAttributes({
      class: 'font reset focus',
      type: 'button',
      config: (el: HTMLElement, isUpdate: boolean, context: any) => {
        if (!isUpdate) {
          el.addEventListener('touchend', _.partial(ctrl.onResetStationTouched, ctrl));
        }
      }
    }, (name, value) => {
      if((name + ':' + value) == 'class:focus') {
        var isSelected = isStartStation ? ctrl.inputStationStartSelected() !='' : ctrl.inputStationEndSelected() != '';
        var isEnabled = isStartStation ? !ctrl.isInputStationStartDisabled() : !ctrl.isInputStationEndDisabled();
        return isSelected || isEnabled;
      }
      return true;
    });
  };

  var formAttrs = {
    config: (el: HTMLElement, isUpdate: boolean, context: Object) => {
      if (!isUpdate) {
        el.addEventListener('submit', _.partial(ctrl.onInputStationSubmit, ctrl));
      }
    }
  };

  return m("div", { class: "start-end" },
           m("form", formAttrs, [
             m("div", _.merge({ class: "input start" }, inputStationWrapperAttrs), [
               m("input", _.merge({ name: "start", autocomplete: "off", placeholder: i18n.fr('departure') }, inputStationAttrs(true))),
               m("button", resetStationAttrs(true))
             ]),
             m('input.submit', { type: 'submit' }),
             m("div", _.merge({ class: "input end"}, inputStationWrapperAttrs), [
               m("input", _.merge({ name: "end", autocomplete: "off", placeholder: i18n.fr('arrival') }, inputStationAttrs(false))),
               m("button", resetStationAttrs(false))])]));
}

/// RENDER STATION SUGGESTIONS

function renderStations(ctrl: Ctrl): m.VirtualElement {
  var term = ctrl.isInputStationEndDisabled() ? ctrl.inputStationStartTerm() : ctrl.inputStationEndTerm();
  term = term.toLowerCase();
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

  var stopsList = ctrl.stations().map((station, index) => {
    var name = Suggestions.adaptSaintWord(term, station) || Suggestions.adaptCompoundWord(term, station) || station.name;
    var matchedAt = name.toLowerCase().indexOf(term.toLowerCase());
    var left = name.substring(0, matchedAt);
    var match = name.substring(matchedAt, matchedAt + term.length)
    var right = name.substring(matchedAt + term.length)
    return m('li', _.merge({ "data-id": station.id, "data-name": name }, stationAttrs(index)),
             m('div', {},
               m('span', {}, [
                 left,
                 m('span', { class: 'match' }, match),
                 right])))
  });

  var emptyResult = m('li.empty', {}, i18n.fr('no-result'));

  var inputDisabled = ctrl.isInputStationStartDisabled() && ctrl.isInputStationEndDisabled();

  var items = (!stopsList.length && term && !inputDisabled) ? emptyResult : stopsList;

  return m("div", { class: "stations" },
           m("div", { id: "wrapper" },
             m("ul", _.merge({ class: "suggestions list" }, suggestionsAttrs), items)));
}

/// RENDER DATETIME SELECTOR

function renderDateTime(ctrl: Ctrl): m.VirtualElement {

  var inputTimeAttrs = {
    config: function(el: HTMLElement, isUpdate: boolean, context: any) {
      if (!isUpdate) {
        el.addEventListener('touchend', _.partial(ctrl.onTimeTouched, ctrl));
      }
    }
  };

  var dateSelectorAttrs = () => {
    var inputAttrs = {
      config: function(el: HTMLElement, isUpdate: boolean, context: any) {
        if (!isUpdate) {
          el.addEventListener('touchend', _.partial(ctrl.onDateTouched, ctrl));
        }
      }
    };
    var cssAttrs = Utils.m.handleAttributes({ class: 'date other' }, (name, value) => {
      if((name + ':' + value) == 'class:other') {
        return ctrl.isOtherTabSelected();
      }
      return true;
    });
    return _.merge(inputAttrs, cssAttrs);
  }

  var submitAttrs: any = (() => {
    var attrs = Utils.m.handleAttributes({ class: 'submit enabled disabled' }, (name, value) => {
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
    m("li", dateSelectorAttrs(), [
      m("span", { class: "label" }, i18n.fr('departure-date')),
      m("span", { class: "value" }, formatDate(ctrl.inputDateSelected()))
    ]),
    m("li", _.merge({ class: "time" }, inputTimeAttrs), [
      m("span", { class: "label" }, i18n.fr('departure-time')),
      m("span", { class: "value" }, formatTime(ctrl.inputTimeSelected()))
    ]),
    m("li", submitAttrs, [
      m("span", {}, i18n.fr('search')),
      m("button", { class: "font go" })])]);
}

function render(ctrl: Ctrl): m.VirtualElement[] {
  return [
    renderTabs(ctrl),
    renderInputsStation(ctrl),
    renderStations(ctrl),
    renderDateTime(ctrl)
  ];
}

var home: m.Module<Ctrl> = {

  controller(): Ctrl {
    var startTerm = m.route.param('start') || '';
    var endTerm = m.route.param('end') || '';
    var startStation = startTerm ? Suggestions.getStationByTerm(startTerm) : null;
    var endStation = endTerm ? Suggestions.getStationByTerm(endTerm) : null;
    var tab = m.route.param('tab') || 'today';
    var currentTab = m.prop(tab);
    var at = (() => {
      var x = parseInt(m.route.param('at'), 10);
      return (x ? new Date(x) : new Date());
    })();
    var displayed = () => Routes.matchHome(currentTab(), m.route(), startTerm, endTerm, at);
    if(displayed()) native.GoogleAnalytics.trackView('Home');

    var ctrl = {
      scope: () => {
        return <HTMLElement> document.querySelector('#home');
      },

      displayed: displayed,

      onTabTouched: (ctrl: Ctrl, e: Event) => {
        var tab = <HTMLElement> e.currentTarget;

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
        m.redraw();
      },

      onInputStationTouched: (ctrl: Ctrl, e: Event) => {
        var station = <HTMLElement> e.currentTarget;
        var inputStation = <HTMLInputElement> station.querySelector('input');
        var hideInput = isInputStationStart(inputStation) ? hideInputStationEnd : hideInputStationStart;
        m.startComputation();
        setInputStationSelected(ctrl, inputStation, '');
        ctrl.stations(Suggestions.search(inputStation.value));
        Q.all([hideInput(ctrl), hideDateTimePanel(ctrl)]).then(() => {
          return moveUpViewport(ctrl).then(() => {
            enableInputStation(ctrl, inputStation);
            native.Keyboard.show().fin(() => m.endComputation())
          });
        });
      },

      onInputStationKeyUp: (ctrl: Ctrl, e: Event) => {
        var inputStation = <HTMLInputElement> e.currentTarget;
        var value = isInputStationStart(inputStation) ? ctrl.inputStationStartTerm() : ctrl.inputStationEndTerm();
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

      isTodayTabSelected: Utils.m.prop(tab == 'today', (active) => {
        if(active) currentTab('today');
      }),

      isTomorrowTabSelected: Utils.m.prop(tab == 'tomorrow', (active) => {
        if(active) currentTab('tomorrow');
      }),

      isOtherTabSelected: Utils.m.prop(tab == 'other', (active) => {
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
          ctrl.inputDateSelected(new Date());
          ctrl.inputTimeSelected(date);
          m.redraw();
        });
      },

      inputDateSelected: m.prop(at),

      inputTimeSelected: m.prop(at),

      isViewportUp: m.prop(false),

      isScrollingStations: Utils.m.prop(false, (isScrolling) => {
        if(isScrolling) {
          document.body.classList.add('scrolling');
        } else {
          document.body.classList.remove('scrolling');
        }
      }),

      iscroll: _.once(function() {
        var wrapper = this.scope().querySelector('#wrapper');
        var iscroll = new IScroll(wrapper);

        iscroll.on('scrollStart', () => {
          this.isScrollingStations(true);
          iscroll.options.momentum = !native.Keyboard.isVisible();
        });

        iscroll.on('scrollEnd', () => {
          this.isScrollingStations(false);
          iscroll.options.momentum = !native.Keyboard.isVisible();
        });
        return iscroll;
      }),

      adaptWrapperTop: (ctrl: Ctrl) => {
        var wrapper = <HTMLElement> ctrl.scope().querySelector('#wrapper');
        var startEndWrapper = <HTMLElement> ctrl.scope().querySelector('.start-end');
        var top = startEndWrapper.offsetTop + startEndWrapper.offsetHeight + Math.abs(document.body.offsetTop) + 10;
        wrapper.style.top = top + 'px';
      },

      stations: m.prop([]),

      onStationSelected: (ctrl: Ctrl, e: Event) => {
        if(!ctrl.isScrollingStations()) {
          var station = <HTMLElement> e.currentTarget;
          var id = station.getAttribute('data-id');
          var name = station.getAttribute('data-name');
          var inputStation = currentInputStation(ctrl);
          ctrl.stations([]);
          setInputStationValue(ctrl, inputStation, name);
          setInputStationSelected(ctrl, inputStation, id);
          resetInputStationsPosition(ctrl, inputStation);
          m.redraw();
        }
      },

      onInputStationSubmit: (ctrl: Ctrl, e: Event) => {
        e.preventDefault();
        var station = ctrl.stations()[0];
        if(station) {
          var inputStation = currentInputStation(ctrl);
          ctrl.stations([]);
          setInputStationValue(ctrl, inputStation, station.name);
          setInputStationSelected(ctrl, inputStation, station.id);
          resetInputStationsPosition(ctrl, inputStation);
        }
      },

      onResetStationTouched: (ctrl: Ctrl, e: Event) => {
        e.stopPropagation();
        var resetButton = <HTMLElement> e.currentTarget;
        var inputStation = <HTMLInputElement> resetButton.previousElementSibling;
        var term = inputStation.value;
        if(ctrl.isViewportUp() && !term) resetInputStationsPosition(ctrl, inputStation);
        setInputStationValue(ctrl, inputStation, '');
        setInputStationSelected(ctrl, inputStation, '');
        ctrl.stations([]);
        m.redraw();
      },

      onSubmitTouched: (ctrl: Ctrl, e: Event) => {
        if(canBeSubmitted(ctrl)) {
          var atDateTime = Utils.DateTime.setSameTime(ctrl.inputDateSelected(), ctrl.inputTimeSelected());
          var uri = Routes.home(ctrl.currentTab(), ctrl.inputStationStartTerm(), ctrl.inputStationEndTerm(), atDateTime);
          window.history.pushState({}, '', '#' + uri);
          m.route(Routes.departures(ctrl.inputStationStartSelected(), ctrl.inputStationEndSelected(), atDateTime));
        }
      },

      onScrollStations: (ctrl: Ctrl, e: Event) => {
        var inputStationStart = <HTMLElement> ctrl.scope().querySelector('.input.start input');
        var inputStationEnd = <HTMLElement> ctrl.scope().querySelector('.input.end input');
        inputStationStart.blur();
        inputStationEnd.blur();
        native.Keyboard.close();
      }
    }

    native.onBackButton('home', () => {
      if(ctrl.displayed() && ctrl.isViewportUp()) {
        m.startComputation();
        var inputStation = ctrl.isInputStationStartDisabled() ? getInputStationEnd(ctrl) : getInputStationStart(ctrl);
        resetInputStationsPosition(ctrl, inputStation);
        setInputStationValue(ctrl, inputStation, '');
        setInputStationSelected(ctrl, inputStation, '');
        ctrl.stations([]);
        m.endComputation();
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
  var inputStationEnd = <HTMLInputElement> ctrl.scope().querySelector('.input.end');
  var inputStationStart = <HTMLInputElement> ctrl.scope().querySelector('.input.start');
  inputStationStart.classList.remove('animating');
  inputStationEnd.classList.add('animating');
  var translateY = inputStationStart.offsetTop - inputStationEnd.offsetTop;
  return Zanimo(inputStationEnd, 'transform', 'translate3d(0,'+ translateY + 'px,0)', 10);
}

function showInputStationEnd(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var inputStationEnd = <HTMLElement> ctrl.scope().querySelector('.input.end');
  return Zanimo(inputStationEnd, 'transform', 'translate3d(0,0,0)', 10).then(() => {
    inputStationEnd.classList.remove('animating');
    inputStationEnd.classList.remove('above');
    return inputStationEnd;
  });
}

function hideInputStationStart(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var stationStart = <HTMLElement> ctrl.scope().querySelector('.input.start');
  stationStart.style.display = 'none';
  return Utils.Promise.pure(stationStart);
}

function showInputStationStart(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var stationStart = <HTMLElement> ctrl.scope().querySelector('.input.start');
  stationStart.style.display = 'block';
  return Utils.Promise.pure(stationStart);
}

function moveUpViewport(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var viewport = <HTMLElement> document.querySelector('#viewport');
  var header = <HTMLElement> document.querySelector('#header');
  var headerHeight = header.offsetHeight;
  var tabs = <HTMLElement> ctrl.scope().querySelector('.tabs');
  var tabsHeight = tabs.offsetHeight;
  var translateY = tabsHeight + headerHeight;
  return Zanimo(viewport, 'transform', 'translate3d(0,-'+ translateY + 'px,0)', 200).then(() => {
    viewport.style.bottom = '-' + translateY + 'px';
    ctrl.isViewportUp(true);
    return viewport;
  });
}

function moveDownViewport(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var viewport = <HTMLElement> document.querySelector('#viewport');
  return Zanimo(viewport, 'transform', 'translate3d(0,0,0)', 200).then(() => {
    viewport.style.bottom = '0';
    ctrl.isViewportUp(false);
    return viewport;
  });
}

function hideDateTimePanel(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var datetime = <HTMLElement> ctrl.scope().querySelector('.datetime');
  datetime.style.display = 'none';
  return Utils.Promise.pure(datetime);
}

function showDateTimePanel(ctrl: Ctrl): Q.Promise<HTMLElement> {
  var datetime = <HTMLElement> ctrl.scope().querySelector('.datetime');
  datetime.style.display = 'block';
  return Utils.Promise.pure(datetime);
}

function resetInputStationsPosition(ctrl: Ctrl, inputStation: HTMLInputElement): Q.Promise<void> {
  var showInput = isInputStationStart(inputStation) ? showInputStationEnd : showInputStationStart;
  var resetButton = <HTMLElement> inputStation.nextElementSibling;
  disableInputStation(ctrl, inputStation);
  m.redraw();
  return native.Keyboard.close().then(() => {
    moveDownViewport(ctrl).then(() => {
      showInput(ctrl).then(() => {
        showDateTimePanel(ctrl).then(() => {
          Utils.$.one(resetButton.parentElement, 'touchend', _.partial(ctrl.onInputStationTouched, ctrl));
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

export function get(): m.Module<Ctrl> {
  return home;
}
