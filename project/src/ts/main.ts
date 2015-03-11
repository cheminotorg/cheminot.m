/// <reference path='dts/mithril.d.ts'/>
/// <reference path='dts/Q.d.ts'/>
/// <reference path='dts/IScroll.d.ts'/>
/// <reference path='dts/moment.d.ts'/>
/// <reference path='dts/Zanimo.d.ts'/>
/// <reference path='dts/lodash.d.ts'/>
/// <reference path='dts/qstart.d.ts'/>
/// <reference path='dts/cheminot.d.ts'/>

'use strict';

import Q = require('q');
import m = require('mithril');
import qstart = require('qstart');
import App = require('app');
import Routes = require('routes');
import Suggestions = require('suggestions');
import native = require('native');
import Utils = require('utils');
import moment = require('moment');
import Locale = require('locale');
import i18n = require('i18n');
import Alert = require('alert');

function handleError(event: any, source?: string, fileno?: number, columnNumber?: number) {
  var description = `${event} at ${source} [${fileno}, ${columnNumber}]`;
  console.error(event.stack ? event.stack : event);
  native.GoogleAnalytics.trackException(description, true);
  Alert.error(i18n.fr('unexpected-error')).fin(() => {
    window.location.hash="#";
    window.location.reload();
  });
}

window.onerror = handleError;

Q.all([native.Cheminot.init(), qstart, Suggestions.init()]).spread((meta: Meta) => {
  Locale.init();
  return native.GoogleAnalytics.startTrackerWithId(Settings.ga_id).fin(() => {
    Settings.db = meta;
    m.route.mode = 'hash';
    m.route(document.body, "/", {
      "/": App.get(),
      "/query/:tab/:start/:end/:at": App.get(),
      "/departures/:start/:end/:at": App.get(),
      "/trip/:id": App.get()
    });
  });
}).catch((e) => handleError(e));

var now = Date.now();
Utils.$.bind('cheminot:ready', () => {
  var min = 2000;
  var spent = now - Date.now();
  var t = spent < min ? (min - spent) : 0;
  window.setTimeout(() => navigator.splashscreen.hide(), t);
});
