import Mock = require('mock');

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
