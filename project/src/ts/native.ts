import Mock = require('mock');
import Q = require('q');

export module Keyboard {

  export function show(): Q.Promise<void> {
    var d = Q.defer<void>();
    cordova.plugins.Keyboard.show();
    var start = Date.now();
    var intervalId = setInterval(() => {
      console.log('interval show > ' + Date.now());
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
      console.log('interval close < ' + Date.now());
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

  export function init(success: (version: string) => void, error: (err: string) => void): void {
    Mock.init(success, error);
  }

  export function lookForBestTrip (vsId: string, veId: string, at: number, success: (stopTimes: StopTime[]) => void, error: (err: string) => void): void {
    if(isMocked()) {
      Mock.lookForBestTrip(vsId, veId, at, success, error);
    } else {
      cordova.plugins.Cheminot.lookForBestTrip(vsId, veId, at, success, error);
    }
  }
}
