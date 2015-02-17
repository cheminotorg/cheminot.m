declare type Attributes = {
  [index: string]: any;
}

declare type Station = {
  name: string;
  id: string;
}

declare type ArrivalTimes = {
  id: string;
  arrivalTimes: ArrivalTime[];
  isDirect: boolean;
}

declare type Departure = {
  startId: string;
  endId: string;
  startTime: Date;
  endTime: Date;
  nbSteps: number;
  id: string;
}

declare type ArrivalTime = {
  stopId: string;
  stopName: string;
  arrival: Date;
  departure: Date;
  tripId: string;
  pos: number;
}

declare type Meta = {
  version: string;
  createdAt: Date;
  expiredAt: Date;
}

declare type Settings = {
  bundleId: string;
  version: string;
  appName: string;
  gitVersion: string;
  db: Meta;
}

declare var Settings: Settings;

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

declare type Splashscreen = {
  hide(): void;
  show(): void;
}

interface Navigator {
  splashscreen: Splashscreen;
  vibrate(ms: number): boolean;
}

interface CHTMLElement {
  remove(): void
}
