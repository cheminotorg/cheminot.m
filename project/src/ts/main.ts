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
import locale = require('locale');

Q.all([qstart, Suggestions.init(), native.Cheminot.init()]).spread((a: any, b: any, meta: Meta) => {
  locale.init();
  Settings.db = meta;
  m.route.mode = 'hash';
  m.route(document.querySelector('body'), "/", {
    "/": App.get(),
    "/query/:tab/:start/:end/:at": App.get(),
    "/departures/:start/:end/:at": App.get(),
    "/trip/:id": App.get()
  });
}).catch((e) => {
  alert(e);
});

var now = Date.now();
Utils.$.bind('cheminot:ready', () => {
  var min = 2000;
  var spent = now - Date.now();
  var t = spent < min ? (min - spent) : 0;
  window.setTimeout(() => navigator.splashscreen.hide(), t);
});
