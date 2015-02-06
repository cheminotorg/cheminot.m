import Q = require('q');
import Utils = require('utils');

export function key(vs: string, ve: string, at: Date, te: Date, max: number = 0): string {
  return [vs, ve, at.getTime(), te.getTime(), max].join('|');
}

export function setTrip(key: string, trip: ArrivalTimes): void {
  sessionStorage.setItem(key, JSON.stringify(trip));
}

export function getTrip(key: string): ArrivalTimes {
  var trip = sessionStorage.getItem(key);
  if(trip) {
    return JSON.parse(trip);
  } else {
    return null;
  }
}

export function getOrSetTrip(key: string, f: () => Q.Promise<ArrivalTimes>): Q.Promise<ArrivalTimes> {
  var trip = getTrip(key);
  if(trip) {
    return Utils.Promise.pure(trip);
  } else {
    return f().then((arrivalTimes) => {
      setTrip(key, arrivalTimes);
      return arrivalTimes;
    });
  }
}
