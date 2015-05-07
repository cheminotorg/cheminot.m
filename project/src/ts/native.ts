import Mock = require('mock');
import Demo = require('demo');
import Q = require('q');
import Cache = require('cache');
import _ = require('lodash');
import Utils = require('utils');

type BackButtonHandlers = {
  [index: string]: (e: Event) => void;
}

var handlers: BackButtonHandlers = {};

export function onBackButton(key: string, f: (e: Event) => void) {
  var h = handlers[key];
  if(!h) {
    handlers[key] = f;
    document.addEventListener('backbutton', f, false);
  }
};

window.addEventListener("message", (message: MessageEvent) => {
  if(message.data && message.data.event == "cheminot:back" && message.origin == window.location.origin) {
    if(window.location.hash != '#/') history.back();
  }
}, false);

export module Keyboard {

  var timeout = 2000;

  export function show(): Q.Promise<void> {
    var d = Q.defer<void>();
    cordova.plugins.Keyboard.show();
    var start = Date.now();
    var intervalId = setInterval(() => {
      if(cordova.plugins.Keyboard.isVisible || Cheminot.isMocked()) {
        clearInterval(intervalId);
        d.resolve(null);
      } else if((Date.now() > start + timeout) || Cheminot.isMocked()) {
        clearInterval(intervalId);
        throw new Error("Unable to show keyboard");
      }
    }, 75);
    return d.promise;
  }

  export function isVisible(): boolean {
    return cordova.plugins.Keyboard.isVisible;
  }

  export function close(): Q.Promise<void> {
    var d = Q.defer<void>();
    cordova.plugins.Keyboard.close();
    var start = Date.now();
    var intervalId = setInterval(() => {
      if(!cordova.plugins.Keyboard.isVisible) {
        clearInterval(intervalId);
        d.resolve(null);
      } else if(Date.now() > start + timeout) {
        clearInterval(intervalId);
        throw new Error("Unable to close keyboard");
      }
    }, 75);
    return d.promise;
  }
}

export module Cheminot {

  export function isMocked(): boolean {
    return document.querySelector('body').hasAttribute('data-mocked') || isDemo();
  }

  export function isDemo(): boolean {
    return document.querySelector('body').hasAttribute('data-demo');
  }

  export function isProd(): boolean {
    return Settings.bundleId.indexOf('prod') > -1;
  }

  export function init(): Q.Promise<Meta> {
    var d = Q.defer<Meta>();
    var success = (meta: Meta) => d.resolve(meta);
    var error = (e: string) => d.reject(e);
    if(isDemo()) {
      Demo.init(success, error);
    } else if(isMocked()) {
      Mock.init(success, error);
    } else  {
      cordova.plugins.Cheminot.init(success, error);
    }
    return d.promise;
  }

  export function lookForBestDirectTrip(vsId: string, veId: string, at: Date, te: Date): Q.Promise<ArrivalTimes> {
    var key = Cache.key(vsId, veId, at, te);
    return Cache.getOrSetTrip(key, () => {
      var d = Q.defer<ArrivalTimes>();
      var success = (result: [boolean, ArrivalTime[]]) => {
        var arrivalTimes = result[1], hasDirect = result[0];
        var trip = { id: key, arrivalTimes: arrivalTimes, isDirect: hasDirect };
        d.resolve(trip);
      }
      var error = (e: string) => d.reject(e);
      if(isDemo()) {
        Demo.lookForBestDirectTrip(vsId, veId, at, te, success, error);
      } else if(isMocked()) {
        Mock.lookForBestDirectTrip(vsId, veId, at, te, success, error);
      } else {
        cordova.plugins.Cheminot.lookForBestDirectTrip(vsId, veId, at, te, success, error);
      }
      return d.promise;
    });
  }

  export function lookForBestTrip(vsId: string, veId: string, at: Date, te: Date, max: number): Q.Promise<ArrivalTimes> {
    var key = Cache.key(vsId, veId, at, te, max);
    return Cache.getOrSetTrip(key, () => {
      var d = Q.defer<ArrivalTimes>();
      var success = (arrivalTimes: ArrivalTime[]) => {
        var trip = { id: key, arrivalTimes: arrivalTimes, isDirect: false };
        d.resolve(trip);
      }
      var error = (e: string) => d.reject(e);
      if(isDemo()) {
        Demo.lookForBestTrip(vsId, veId, at, te, max, success, error);
      } else if(isMocked()) {
        Mock.lookForBestTrip(vsId, veId, at, te, max, success, error);
      } else {
        cordova.plugins.Cheminot.lookForBestTrip(vsId, veId, at, te, max, success, error);
      }
      return d.promise;
    });
  }

  export function abort(): Q.Promise<void> {
    var d = Q.defer<void>();
    var error = (e: string) => d.reject(e);
    if(isDemo()) {
      Demo.abort(() => d.resolve(null), error);
    } else {
      cordova.plugins.Cheminot.abort(() => d.resolve(null), error);
    }
    return d.promise;
  }

  export function trace(): Q.Promise<Station[]> {
    var d = Q.defer<Station[]>();
    var error = (e: string) => d.reject(e);
    if(isDemo()) {
      Demo.trace(trace => d.resolve(trace), error);
    } else {
      cordova.plugins.Cheminot.trace(trace => d.resolve(trace), error);
    }
    return d.promise;
  }
}

export module GoogleAnalytics {

  export function debugMode(): Q.Promise<void> {
    var d = Q.defer<void>();
    analytics.debugMode(() => d.resolve(null), (e) => d.reject(e));
    return d.promise;
  }

  export function startTrackerWithId(id: string): Q.Promise<void> {
    var d = Q.defer<void>();
    if(!Cheminot.isMocked()) {
      var debug = (!Cheminot.isProd()) ? debugMode() : Utils.Promise.done();
      debug.fin(() => analytics.startTrackerWithId(id, () => d.resolve(null), (e) => d.reject(e)));
    } else {
      d.resolve(null);
    }
    return d.promise;
  }

  export function trackView(screen: string): Q.Promise<void> {
    var d = Q.defer<void>();
    analytics.trackView(screen, () => d.resolve(null), (e) => d.reject(e));
    return d.promise;
  }

  export function trackException(description: string, fatal: boolean): Q.Promise<void> {
    var d = Q.defer<void>();
    analytics.trackException(description, fatal, () => d.resolve(null), (e) => d.reject(e));
    return d.promise;
  }

  export function trackEvent(category: string, action: string, label: string, value: number): Q.Promise<void> {
    var d = Q.defer<void>();
    analytics.trackEvent(category, action, label, value, () => d.resolve(null), (e) => d.reject(e));
    return d.promise;
  }

  export function trackTiming(category: string, interval: number, name: string, label: string): Q.Promise<void> {
    var d = Q.defer<void>();
    analytics.trackTiming(category, interval, name, label, () => d.resolve(null), (e) => d.reject(e));
    return d.promise;
  }
}
