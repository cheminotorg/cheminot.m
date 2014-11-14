import Mock = require('mock');
import Q = require('q');

export module Keyboard {

  export function show(): Q.Promise<void> {
    var d = Q.defer<void>();
    cordova.plugins.Keyboard.show();
    var start = Date.now();
    var intervalId = setInterval(() => {
      if(cordova.plugins.Keyboard.isVisible) {
        clearInterval(intervalId);
        d.resolve(null);
      } else if(Date.now() > start + 2000) {
        d.reject(null);
      }
    }, 75);
    return d.promise;
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

  export function lookForBestTrip (vsId: string, veId: string, at: Date): Q.Promise<StopTime[]> {
    var timestamp = at.getTime() / 1000;
    var d = Q.defer<StopTime[]>();
    var success = (stopTimes: StopTime[]) => d.resolve(stopTimes);
    var error = (e: string) => d.reject(e);
    if(isMocked()) {
      Mock.lookForBestTrip(vsId, veId, timestamp, success, error);
    } else {
      cordova.plugins.Cheminot.lookForBestTrip(vsId, veId, timestamp, success, error);
    }
    return d.promise;
  }
}
