/// <reference path='dts/mithril.d.ts'/>
/// <reference path='dts/Q.d.ts'/>
/// <reference path='dts/IScroll.d.ts'/>
/// <reference path='dts/moment.d.ts'/>
/// <reference path='dts/Zanimo.d.ts'/>
/// <reference path='dts/lodash.d.ts'/>
/// <reference path='dts/qstart.d.ts'/>
/// <reference path='dts/qajax.d.ts'/>
/// <reference path='dts/cheminot.d.ts'/>
/// <reference path='dts/mithril-mdl.d.ts'/>
/// <reference path='dts/mdl-ripple.d.ts'/>
/// <reference path='dts/promise.d.ts'/>
/// <reference path='dts/fetch.d.ts'/>

'use strict';

import Q = require('q');
import m = require('mithril');
import moment = require('moment');
import qstart = require('qstart');
import Routes = require('./routes');
import Suggestions = require('./suggestions');
import native = require('./native');
import Toolkit = require('./toolkit');
import Locale = require('./locale');
import Responsive = require('./responsive');
import { component as App } from './ui/app';

window.onerror = Toolkit.handleError;

native.ready().then(() => {

  Q.all([native.Cheminot.init(), native.Cheminot.gitVersion(), qstart, Suggestions.init(), Responsive.init()]).spread((meta: Meta, cheminotcVersion: string) => {
    Locale.init();
    return native.GoogleAnalytics.startTrackerWithId(Settings.ga_id).fin(() => {

      Settings.db = meta;
      Settings.cheminotcVersion = cheminotcVersion;

      const viewport = document.querySelector('#viewport');

      m.route.mode = 'hash';

      m.route(viewport, '/', {
        "/": App,
        "/search": App,
      });

    });
  }).catch((e) => {
    Toolkit.handleError(e);
  });

  Toolkit.Event.bind('cheminot:ready', () => {
    document.querySelector('#viewport').classList.add('ready');
    navigator.splashscreen.hide();
  });

});
