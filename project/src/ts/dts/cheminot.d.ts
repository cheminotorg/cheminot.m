interface Attributes {
  [index: string]: any;
}

interface Meta {
  version: string;
  createdAt: Date;
  expiredAt: Date;
}

interface Station {
  name: string;
  id: string;
}

interface ArrivalTimes {
  id: string;
  arrivalTimes: ArrivalTime[];
  isDirect: boolean;
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
      function init(success: (meta: Meta) => void, error: (e: string) => void): void;
      function lookForBestTrip(start: string, end: string, at: Date, te: Date, max: number, success: (arrivalTime: ArrivalTime[]) => void, error: (e: string) => void): void;
      function lookForBestDirectTrip(start: string, end: string, at: Date, te: Date, success: (result: [boolean, ArrivalTime[]]) => void, error: (e: string) => void): void;
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

interface Settings {
  bundleId: string;
  version: string;
  appName: string;
  gitVersion: string;
}

declare var Settings: Settings;
