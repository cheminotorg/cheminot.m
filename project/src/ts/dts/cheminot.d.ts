declare type Attributes = {
  [index: string]: any;
}

declare type SuggestedStation = {
  id: string;
  name: string;
}

declare type Station = {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

declare type ArrivalTimes = {
  id: string;
  arrivalTimes: ArrivalTime[];
  isDirect: boolean;
}

declare type Departure = {
  startId: string;
  startName: string;
  endId: string;
  startTime: Date;
  endTime: Date;
  endName: string;
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
  lat: number;
  lng: number;
}

declare type Meta = {
  version: string;
  createdAt: Date;
}

declare type Settings = {
  bundleId: string;
  version: string;
  appName: string;
  gitVersion: string;
  cheminotcVersion: string;
  ga_id: string;
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
      function gitVersion(success: (sha: string) => void, error: (e: string) => void): void;
      function init(success: (meta: Meta) => void, error: (e: string) => void): void;
      function getStop(stopId: string, success: (station: Station) => void, error: (e: string) => void): void;
      function lookForBestTrip(start: string, end: string, at: Date, te: Date, max: number, success: (arrivalTime: ArrivalTime[]) => void, error: (e: string) => void): void;
      function lookForBestDirectTrip(start: string, end: string, at: Date, te: Date, success: (result: [boolean, ArrivalTime[]]) => void, error: (e: string) => void): void;
      function abort(success: () => void, error: (e: string) => void): void;
      function trace(success: (trace: Station[]) => void, error: (e: string) => void): void;
    }
  }
}

declare type Splashscreen = {
  hide(): void;
  show(): void;
}

declare type Analytics = {
  debugMode(success: () => void, error: (e: string) => void): void;
  startTrackerWithId(id: string, success: () => void, error: (e: string) => void): void;
  trackView(screen: string, success: () => void, error: (e: string) => void): void;
  trackException(description: string, fatal: boolean, success: () => void, error: (e: string) => void): void;
  trackEvent(category: string, action: string, label: string, value: number, success: () => void, error: (e: string) => void): void;
  trackTiming(category: string, interval: number, name: string, label: string, success: () => void, error: (e: string) => void): void;
}

declare var analytics: Analytics


interface Navigator {
  splashscreen: Splashscreen;
  vibrate(ms: number): boolean;
}

/** BROWSER API **/

interface CHTMLElement {
  remove(): void
}

declare type EventSource = {
  onmessage: (e: MessageEvent) => void;
  onerror: ErrorEventHandler;
}

declare var EventSource: {
  new(uri: string): EventSource;
}
