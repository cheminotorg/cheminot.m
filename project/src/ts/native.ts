import Mock = require('mock');
import Q = require('q');

export interface BackButtonHandlers {
  [index: string]: (e: Event) => void;
}

var handlers: BackButtonHandlers = {};
export function onBackButton(key: string, f: (e: Event) => void) {
  var h = handlers[key];
  if(h) document.removeEventListener('backbutton', h);
  handlers[key] = f;
  document.addEventListener('backbutton', f, false);
};

export module Splashscreen {

  // interface Splashscreen {
  //   hide(): void;
  //   show(): void;
  // }

  // export function show(): void {
  //   var splashscreen: Splashscreen = <Splashscreen> navigator['splashscreen'];
  //   splashscreen.show();
  // }

  // export function hide(): void {
  //   var splashscreen = <Splashscreen> navigator['splashscreen'];
  //   splashscreen.hide();
  // }
}

export module Keyboard {

  export function show(): Q.Promise<void> {
    var d = Q.defer<void>();
    cordova.plugins.Keyboard.show();
    var start = Date.now();
    var intervalId = setInterval(() => {
      if(cordova.plugins.Keyboard.isVisible) {
        clearInterval(intervalId);
        d.resolve(null);
      } else if((Date.now() > start + 2000) || Cheminot.isMocked()) {
        d.reject(null);
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
      } else if(Date.now() > start + 2000) {
        d.reject(null);
      }
    }, 75);
    return d.promise;
  }
}

export module Cheminot {

  export function isMocked(): boolean {
    return document.querySelector('body').hasAttribute('data-mocked');
  }

  export function init(): Q.Promise<string> {
    var d = Q.defer<string>();
    var success = (version: string) => d.resolve(version);
    var error = (e: string) => d.reject(e);
    if(isMocked()) {
      Mock.init(success, error);
    } else  {
      cordova.plugins.Cheminot.init(success, error);
    }
    return d.promise;
  }

  export function lookForBestTrip (vsId: string, veId: string, at: Date, te: Date, max: number): Q.Promise<ArrivalTimes> {
    var d = Q.defer<ArrivalTimes>();
    var id = hashTdspQuery(vsId, veId, at, te, max);
    var tripFromCache = sessionStorage.getItem(id);

    if(tripFromCache) {
      d.resolve(JSON.parse(tripFromCache));
    } else {
      var success = (arrivalTimes: ArrivalTime[]) => {
        var trip = { id: id, arrivalTimes: arrivalTimes };
        sessionStorage.setItem(id, JSON.stringify(trip));
        d.resolve(trip);
      }

      var error = (e: string) => d.reject(e);

      if(isMocked()) {
        Mock.lookForBestTrip(vsId, veId, at, te, max, success, error);
      } else {
        cordova.plugins.Cheminot.lookForBestTrip(vsId, veId, at, te, max, success, error);
      }
    }

    return d.promise;
  }

  function hashTdspQuery(vs: string, ve: string, at: Date, te: Date, max: number): string {
    var seed = isMocked() ? Date.now() : '';
    return [vs, ve, at.getTime(), te.getTime(), max, seed].join('|');
  }
}
