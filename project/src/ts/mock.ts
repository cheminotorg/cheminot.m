import _ = require('lodash');
import Utils = require('utils');
import moment = require('moment');

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
  var departureTime = () => {
    if(last) {
      last = Utils.DateTime.addHours(last, 1);
    } else {
      last = at;
    }
    return last;
  }

  var arrivalTime = () => {
    if(last) {
      return Utils.DateTime.addHours(last, 1);
    } else {
      return Utils.DateTime.addHours(at, 1);
    }
    return last;
  }

  var leMansParis = [
    {
      stopId: 'StopPoint:OCETrain TER-87396002',
      stopName: 'Le Mans',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 0
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396309',
      stopName: 'Connerré-Beillé',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 1
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396325',
      stopName: 'La Ferté-Bernard',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 2
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394296',
      stopName: 'Nogent-le-Rotrou',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 3
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394254',
      stopName: 'La Loupe',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 4
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394221',
      stopName: 'Courville-sur-Eure',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 5
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394007',
      stopName: 'Chartres',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 6
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394130',
      stopName: 'Maintenon',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 7
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394114',
      stopName: 'Epernon',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 8
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393314',
      stopName: 'Rambouillet',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 9
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393009',
      stopName: 'Versailles-Chantiers',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 10
    },
    {
      stopId: 'StopPoint:OCETrain TER-87391003',
      stopName: 'Paris-Montparnasse 1-2',
      arrival: arrivalTime(),
      departure: departureTime(),
      tripId: 'OCESN016756F0100230477',
      pos: 11
    }
  ];
  return leMansParis;
}

export function lookForBestTrip(vsId: string, veId: string, at: Date, te: Date, max: number, success: (stopTimes: ArrivalTime[]) => void, error: (err: string) => void): void {
  window.setTimeout(function() {
    success(getArrivalTimes(at));
  }, 500);
}

export function lookForBestDirectTrip (vsId: string, veId: string, at: Date, te: Date, max: number, success: (result: [boolean, ArrivalTime[]]) => void, error: (err: string) => void): void {
  return lookForBestTrip(vsId, veId, at, te, 0, (stopTimes) => {
    success && success([true, stopTimes]);
  }, error);
}
