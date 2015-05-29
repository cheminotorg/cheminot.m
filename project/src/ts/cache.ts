import Q = require('q');
import Utils = require('utils');
import _ = require('lodash');

export function key(vs: string, ve: string, at: Date, te: Date, max: number = 0): string {
  at.setMilliseconds(0);
  te.setMilliseconds(0);
  return [vs, ve, at.getTime(), te.getTime(), max].join('|');
}

export function setTrip(key: string, trip: ArrivalTimes): void {
  sessionStorage.setItem(key, JSON.stringify(trip));
}

export function getTrip(key: string): ArrivalTimes {
  var trip = sessionStorage.getItem(key);
  if(trip) {
    var t:any = JSON.parse(trip);
    t.arrivalTimes = t.arrivalTimes.map((arrivalTime:any) => {
      arrivalTime.departure = new Date(arrivalTime.departure);
      arrivalTime.arrival = new Date(arrivalTime.arrival);
      return arrivalTime;
    });
    return t;
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

export function getAllTripsFrom(vs:string, ve: string, at: Date, max: number, nextDeparture: (d: Date) => Date, departureBound: (d: Date) => Date): ArrivalTimes[] {
  var trips: ArrivalTimes[] = [];
  var lastDeparture: Date;
  var te: Date;
  do {
    if(lastDeparture) {
      lastDeparture = nextDeparture(lastDeparture);
      te = departureBound(lastDeparture);
    } else {
      lastDeparture = at;
      te = departureBound(at);
    }

    var k = key(vs, ve, lastDeparture, te, max);
    var trip = getTrip(k);
    if(trip && trip.arrivalTimes.length) {
      var stopTime = _.head(trip.arrivalTimes);
      if(lastDeparture.getTime() > stopTime.departure.getTime()) {
        trip = null;
      } else {
        if(stopTime) {
          lastDeparture = stopTime.departure;
          trips.push(trip);
        } else {
          lastDeparture = te;
        }
      }
    }
  } while(!!trip);
  return trips;
}
