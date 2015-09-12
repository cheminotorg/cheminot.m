import Mock = require('mock');
import Demo = require('demo');
import Q = require('q');
import Cache = require('cache');
import _ = require('lodash');
import Toolkit = require('toolkit');

type BackButtonHandlers = {
  [index: string]: () => void;
}

const handlers: BackButtonHandlers = {};

export function onBackButton(key: string, f: () => void) {
  const h = handlers[key];
  if(!h) {
    handlers[key] = f;
    document.addEventListener('backbutton', f, false);
  }
};

window.addEventListener("message", (message: MessageEvent) => {
  if(message.data && message.data.event == "cheminot:back" && message.origin == window.location.origin) {
    if(window.location.hash != '#/') {
      Object.keys(handlers).forEach(key => {
        const h = handlers[key];
        h && h();
      });
    }
  }
}, false);

export module Keyboard {

  const timeout = 2000;

  export function show(): Q.Promise<void> {
    const d = Q.defer<void>();
    cordova.plugins.Keyboard.show();
    const start = Date.now();
    const intervalId = setInterval(() => {
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
    const d = Q.defer<void>();
    cordova.plugins.Keyboard.close();
    const start = Date.now();
    const intervalId = setInterval(() => {
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

  export function gitVersion(): Q.Promise<string> {
    const d = Q.defer<string>();
    const success = (sha: string) => d.resolve(sha);
    const error = (e: string) => d.reject(e);
    if(isDemo()) {
      Demo.gitVersion(success, error);
    } else if(isMocked()) {
      Mock.gitVersion(success, error);
    } else {
      cordova.plugins.Cheminot.gitVersion(success, error);
    }
    return d.promise
  }

  export function init(): Q.Promise<Meta> {
    const d = Q.defer<Meta>();
    const success = (meta: Meta) => d.resolve(meta);
    const error = (e: string) => d.reject(e);
    if(isDemo()) {
      Demo.init(success, error);
    } else if(isMocked()) {
      Mock.init(success, error);
    } else  {
      cordova.plugins.Cheminot.init(success, error);
    }
    return d.promise;
  }

  export function getStop(stopId: string): Q.Promise<Station> {
    const d = Q.defer<Station>();
    const success = (station: Station) => d.resolve(station);
    const error = (e: string) => d.reject(e);
    if(isMocked()) {
      Mock.getStop(stopId, success, error);
    } else  {
      cordova.plugins.Cheminot.getStop(stopId, success, error);
    }
    return d.promise;
  }

  function fetchBestDirectTrip(vsId: string, veId: string, at: Date, te: Date): F<Q.Promise<ArrivalTimes>> {
    return () => {
      const d = Q.defer<ArrivalTimes>();
      const id = Cache.tripKey(vsId, veId, at, te);
      const success = (result: [boolean, ArrivalTime[]]) => {
        const arrivalTimes = result[1], hasDirect = result[0];
        const trip = { id: id, arrivalTimes: arrivalTimes, isDirect: hasDirect };
        d.resolve(trip);
      }
      const error = (e: string) => d.reject(e);
      if(isDemo()) {
        Demo.lookForBestDirectTrip(vsId, veId, at, te, success, error);
      } else if(isMocked()) {
        Mock.lookForBestDirectTrip(vsId, veId, at, te, success, error);
      } else {
        cordova.plugins.Cheminot.lookForBestDirectTrip(vsId, veId, at, te, success, error);
      }
      return d.promise;
    }
  }

  export function lookForBestDirectTrip(vsId: string, veId: string, at: Date, te: Date, useCache: boolean = true): Q.Promise<ArrivalTimes> {
    const key = Cache.tripKey(vsId, veId, at, te);
    if(useCache) {
      return Cache.getOrSetTrip(key, fetchBestDirectTrip(vsId, veId, at, te));
    } else {
      return fetchBestDirectTrip(vsId, veId, at, te)();
    }
  }

  export function lookForBestTrip(vsId: string, veId: string, at: Date, te: Date, max: number): Q.Promise<ArrivalTimes> {
    const key = Cache.tripKey(vsId, veId, at, te, max);
    return Cache.getOrSetTrip(key, () => {
      const d = Q.defer<ArrivalTimes>();
      const success = (arrivalTimes: ArrivalTime[]) => {
        const trip = { id: key, arrivalTimes: arrivalTimes, isDirect: false };
        d.resolve(trip);
      }
      const error = (e: string) => d.reject(e);
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
    const d = Q.defer<void>();
    const error = (e: string) => d.reject(e);
    if(isDemo()) {
      Demo.abort(() => d.resolve(null), error);
    } else {
      cordova.plugins.Cheminot.abort(() => d.resolve(null), error);
    }
    return d.promise;
  }

  export function trace(): Q.Promise<Station[]> {
    const d = Q.defer<Station[]>();
    const error = (e: string) => d.reject(e);
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
    const d = Q.defer<void>();
    analytics.debugMode(() => d.resolve(null), (e) => d.reject(e));
    return d.promise;
  }

  export function startTrackerWithId(id: string): Q.Promise<void> {
    const d = Q.defer<void>();
    if(!Cheminot.isMocked()) {
      const debug = (!Cheminot.isProd()) ? debugMode() : Toolkit.Promise.done();
      debug.fin(() => analytics.startTrackerWithId(id, () => d.resolve(null), (e) => d.reject(e)));
    } else {
      d.resolve(null);
    }
    return d.promise;
  }

  export function trackView(screen: string): Q.Promise<void> {
    const d = Q.defer<void>();
    if(!Cheminot.isMocked()) {
      analytics.trackView(screen, () => d.resolve(null), (e) => d.reject(e));
    } else {
      d.resolve(null);
    }
    return d.promise;
  }

  export function trackException(description: string, fatal: boolean): Q.Promise<void> {
    const d = Q.defer<void>();
    if(!Cheminot.isMocked()) {
      analytics.trackException(description, fatal, () => d.resolve(null), (e) => d.reject(e));
    } else {
      d.resolve(null);
    }
    return d.promise;
  }

  export function trackEvent(category: string, action: string, label: string, value: number): Q.Promise<void> {
    const d = Q.defer<void>();
    if(!Cheminot.isMocked()) {
      analytics.trackEvent(category, action, label, value, () => d.resolve(null), (e) => d.reject(e));
    } else {
      d.resolve(null);
    }
    return d.promise;
  }

  export function trackTiming(category: string, interval: number, name: string, label: string): Q.Promise<void> {
    const d = Q.defer<void>();
    if(!Cheminot.isMocked()) {
      analytics.trackTiming(category, interval, name, label, () => d.resolve(null), (e) => d.reject(e));
    } else {
      d.resolve(null);
    }
    return d.promise;
  }
}
