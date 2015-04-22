import _ = require('lodash');
import Utils = require('utils');
import moment = require('moment');

var CHARTRES = 'StopPoint:OCETrain TER-87394007';

export function init(success: (meta: Meta) => void, error: (err: string) => void): void {
  success({
    version: 'xxxxxxx',
    createdAt: new Date(),
    expiredAt: new Date()
  });
}

export function getTrip(at: Date = new Date()): ArrivalTimes {
  return {
    id: 'xxxxx',
    arrivalTimes: getArrivalTimes(at),
    isDirect: true
  };
}

export function getArrivalTimes(at: Date): ArrivalTime[] {
  var last: Date;

  var time = () => {
    if(last) {
      last = Utils.DateTime.addHours(last, 1);
    } else {
      last = Utils.DateTime.addHours(at, 1);
    }
    return last;
  }

  var leMansParis = [
    {
      stopId: 'StopPoint:OCETrain TER-87396002',
      stopName: 'Le Mans',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 0
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396309',
      stopName: 'Connerré-Beillé',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 1
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396325',
      stopName: 'La Ferté-Bernard',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 2
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394296',
      stopName: 'Nogent-le-Rotrou',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 3
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394254',
      stopName: 'La Loupe',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 4
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394221',
      stopName: 'Courville-sur-Eure',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 5
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394007',
      stopName: 'Chartres',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 6
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394130',
      stopName: 'Maintenon',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 7
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394114',
      stopName: 'Epernon',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 8
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393314',
      stopName: 'Rambouillet',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 9
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393009',
      stopName: 'Versailles-Chantiers',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 10
    },
    {
      stopId: 'StopPoint:OCETrain TER-87391003',
      stopName: 'Paris-Montparnasse 1-2',
      arrival: time(),
      departure: time(),
      tripId: 'OCESN016756F0100230477',
      pos: 11
    }
  ];
  return leMansParis;
}

export function lookForBestTrip(vsId: string, veId: string, at: Date, te: Date, max: number, success: (stopTimes: ArrivalTime[]) => void, error: (err: string) => void): void {
  var timeout = (vsId != CHARTRES) ? 1000 : 500;
  window.setTimeout(function() {
    success(getArrivalTimes(at));
  }, timeout);
}

export function lookForBestDirectTrip (vsId: string, veId: string, at: Date, te: Date, success: (result: [boolean, ArrivalTime[]]) => void, error: (err: string) => void): void {
  return lookForBestTrip(vsId, veId, at, te, 0, (stopTimes) => {
    success && success([vsId === CHARTRES, vsId == CHARTRES ? stopTimes : []]);
  }, error);
}
