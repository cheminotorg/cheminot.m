import Q = require('q');
import _ = require('lodash');

function scheduleGarbage(key: string) {
  setTimeout(() => sessionStorage.removeItem(key), 60 * 1000 * 15);
}

export function tripKey(vs: string, ve: string, at: Date, te: Date, max: number = 0): string {
  at.setMilliseconds(0);
  te.setMilliseconds(0);
  return [vs, ve, at.getTime(), te.getTime(), max].join('|');
}

export function decomposeTripKey(id: string): [string, string, number, number, number] {
  const [vs, ve, at, te, max] = id.split('|');
  return [vs, ve, parseInt(at, 10), parseInt(te, 10), parseInt(max, 10)];
}

export function removeByKeys(keys: string[]): void {
  keys.forEach(key => sessionStorage.removeItem(key));
}

export function setTrip(key: string, trip: ArrivalTimes): void {
  sessionStorage.setItem(key, JSON.stringify(trip));
  scheduleGarbage(key);
}

export function getTrip(key: string): ArrivalTimes {
  const trip = sessionStorage.getItem(key);
  if(trip) {
    const t:any = JSON.parse(trip);
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
  const trip = getTrip(key);
  if(trip) {
    return Q(trip);
  } else {
    return f().then((arrivalTimes) => {
      setTrip(key, arrivalTimes);
      return arrivalTimes;
    });
  }
}

export function getAllTripsFrom(vs:string, ve: string, at: Date, max: number, nextDeparture: (d: Date) => Date, departureBound: (d: Date) => Date): ArrivalTimes[] {
  const trips: ArrivalTimes[] = [];
  let lastDeparture: Date;
  let te: Date;
  let trip: ArrivalTimes;
  do {
    if(lastDeparture) {
      lastDeparture = nextDeparture(lastDeparture);
      te = departureBound(lastDeparture);
    } else {
      lastDeparture = at;
      te = departureBound(at);
    }

    const k = tripKey(vs, ve, lastDeparture, te, max);
    trip = getTrip(k);
    if(trip && trip.arrivalTimes.length) {
      let stopTime = _.head(trip.arrivalTimes);
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

export function getOrSetNextDepartures(f: () => Q.Promise<Departure[]>): Q.Promise<Departure[]> {
  const json = sessionStorage.getItem('now');
  if(json) {
    const departures = <Departure[]> JSON.parse(json);
    return Q(departures);
  } else {
    return f().then((departures) => {
      setNextDepartures(departures);
      return departures;
    });
  }
}

export function setNextDepartures(departures: Departure[]) {
  const key = 'now';
  sessionStorage.setItem(key, JSON.stringify(departures));
  scheduleGarbage(key);
}

export function clearNextDepartures() {
  sessionStorage.removeItem('now');
}

export function setNowTimerId(id: number) {
  sessionStorage.setItem('now-timer', id.toString());
}

export function getNowTimerId(): number {
  const timerId = sessionStorage.getItem('now-timer');
  return parseInt(timerId, 10);
}

export function clearNowTimerId() {
  sessionStorage.removeItem('now-timer');
}
