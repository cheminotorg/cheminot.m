interface Departure {
  startId: string;
  endId: string;
  startTime: Date;
  endTime: Date;
  nbSteps: number;
  id: string;
}

interface StopTime {
  stopId: string;
  stopName: string;
  arrivalTime: Date;
  departureTime: Date;
  tripId: string;
  pos: number;
}

declare module cordova {

  var isMock: boolean;

  module plugins {
    module SoftKeyboard {
      function show(success: () => void, error: () => void): void;
      function hide(success: () => void, error: () => void): void;
    }

    module Cheminot {
      function init(success: (version: string) => void, error: () => void): void;
      function lookForBestTrip(start: string, end: string, at: number, success: (stopsTime: StopTime[]) => void, error: () => void): void;
    }
  }
}
