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

  module plugins {
    module Keyboard {
      var isVisible: boolean;
      function show(): void;
      function close(): void;
    }

    module Cheminot {
      function init(success: (version: string) => void, error: () => void): void;
      function lookForBestTrip(start: string, end: string, at: number, success: (stopsTime: StopTime[]) => void, error: (e: string) => void): void;
    }
  }
}
