/// <reference path='dts/mithril.d.ts'/>
/// <reference path='dts/Q.d.ts'/>
/// <reference path='dts/IScroll.d.ts'/>
/// <reference path='dts/moment.d.ts'/>
/// <reference path='dts/Zanimo.d.ts'/>
/// <reference path='dts/lodash.d.ts'/>
/// <reference path='dts/qstart.d.ts'/>
/// <reference path='dts/qajax.d.ts'/>
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

window.onerror = Utils.handleError;

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
}).catch((e) => Utils.handleError(e));

Utils.$.bind('cheminot:ready', () => {
  navigator.splashscreen.hide()
});
