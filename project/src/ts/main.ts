/// <reference path='dts/mithril.d.ts'/>
/// <reference path='dts/Q.d.ts'/>
/// <reference path='dts/IScroll.d.ts'/>
/// <reference path='dts/moment.d.ts'/>
/// <reference path='dts/Zanimo.d.ts'/>
/// <reference path='dts/lodash.d.ts'/>
/// <reference path='dts/qstart.d.ts'/>
/// <reference path='dts/qajax.d.ts'/>
/// <reference path='dts/cheminot.d.ts'/>
/// <reference path='dts/mdlripple.d.ts'/>

'use strict';

import Q = require('q');
import m = require('mithril');
import moment = require('moment');
import qstart = require('qstart');
import App = require('./app');
import Routes = require('./routes');
import Suggestions = require('./suggestions');
import native = require('./native');
import Toolkit = require('./toolkit');
import Locale = require('./locale');
import Responsive = require('./responsive');

window.onerror = Toolkit.handleError;

Q.all([native.Cheminot.init(), native.Cheminot.gitVersion(), qstart, Suggestions.init(), Responsive.init()]).spread((meta: Meta, cheminotcVersion: string) => {
  Locale.init();
  return native.GoogleAnalytics.startTrackerWithId(Settings.ga_id).fin(() => {
    Settings.db = meta;
    Settings.cheminotcVersion = cheminotcVersion;
    m.route.mode = 'hash';
    m.route(document.querySelector('#viewport'), '/', {
      "/": App.component,
      "/search": App.component,
      "/search/:tab/:start/:end/:at": App.component,
      "/departures/:start/:end/:at": App.component,
      "/trip/:id": App.component
    });
  });
}).catch((e) => {
  Toolkit.handleError(e);
});

Toolkit.Event.bind('cheminot:ready', () => {
  document.querySelector('#viewport').classList.add('ready');
  navigator.splashscreen.hide();
});
