interface Station {
  name: string;
  id: string;
}

interface ArrivalTimes {
  id: string;
  arrivalTimes: ArrivalTime[];
}

interface Departure {
  startId: string;
  endId: string;
  startTime: Date;
  endTime: Date;
  nbSteps: number;
  id: string;
}

interface ArrivalTime {
  stopId: string;
  stopName: string;
  arrival: Date;
  departure: Date;
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
      function init(success: (version: string) => void, error: (e: string) => void): void;
      function lookForBestTrip(start: string, end: string, at: Date, te: Date, max: number, success: (arrivalTime: ArrivalTime[]) => void, error: (e: string) => void): void;
      function abort(success: () => void, error: (e: string) => void): void;
    }
  }
}

interface Splashscreen {
  hide(): void;
  show(): void;
}

interface Navigator {
  splashscreen: Splashscreen;
}
