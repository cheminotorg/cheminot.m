import _ = require('lodash');
import moment = require('moment');
import Toolkit = require('./toolkit');

const CHARTRES = 'StopPoint:OCETrain TER-87394007';

export function gitVersion(success: (sha: string) => void, error: (err: string) => void): void {
  success('xxxxxxx');
}

export function init(success: (meta: Meta) => void, error: (err: string) => void): void {
  success({
    version: 'xxxxxxx',
    createdAt: Toolkit.DateTime.now()
  });
}
export function getStop(stopId: string, success: (station: Station) => void, error: (err: string) => void): void {
  success({
    id: stopId,
    name: 'Paris',
    lat: 0.22312312,
    lng: 44.9213123
  });
}

export function getTrip(at: Date = Toolkit.DateTime.now()): ArrivalTimes {
  return {
    id: 'xxxxx',
    arrivalTimes: getArrivalTimes(at),
    isDirect: true
  };
}

export function getArrivalTimes(at: Date): ArrivalTime[] {
  let last: Date;
  const time = () => {
    if(last) {
      last = Toolkit.DateTime.addHours(last, 1);
    } else {
      last = Toolkit.DateTime.addHours(at, 1);
    }
    return last;
  }

  const leMansParis = [
    {
      stopId: 'StopPoint:OCETrain TER-87396002',
      stopName: 'Le Mans',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 0,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396309',
      stopName: 'Connerré-Beillé',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 1,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396325',
      stopName: 'La Ferté-Bernard',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 2,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394296',
      stopName: 'Nogent-le-Rotrou',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 3,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394254',
      stopName: 'La Loupe',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 4,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394221',
      stopName: 'Courville-sur-Eure',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 5,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394007',
      stopName: 'Chartres',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 6,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394130',
      stopName: 'Maintenon',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 7,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394114',
      stopName: 'Epernon',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 8,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393314',
      stopName: 'Rambouillet',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 9,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393009',
      stopName: 'Versailles-Chantiers',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 10,
      lat: 48.79556635,
      lng: 2.13546496
    },
    {
      stopId: 'StopPoint:OCETrain TER-87391003',
      stopName: 'Paris-Montparnasse 1-2',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 11,
      lat: 48.79556635,
      lng: 2.13546496
    }
  ];
  return leMansParis;
}

export function lookForBestTrip(vsId: string, veId: string, at: Date, te: Date, max: number, success: (stopTimes: ArrivalTime[]) => void, error: (err: string) => void): void {
  const timeout = (vsId != CHARTRES) ? 500 : 250;
  window.setTimeout(function() {
    success(getArrivalTimes(at));
  }, timeout);
}

export function lookForBestDirectTrip (vsId: string, veId: string, at: Date, te: Date, success: (result: [boolean, ArrivalTime[]]) => void, error: (err: string) => void): void {
  return lookForBestTrip(vsId, veId, at, te, 0, (stopTimes) => {
    success && success([vsId === CHARTRES, stopTimes]);
  }, error);
}
