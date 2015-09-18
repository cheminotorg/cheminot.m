import _ = require('lodash');
import Toolkit = require('toolkit');
import Cache = require('cache');
import Q = require('q');
import moment = require('moment');

export function departureBound(departure: Date): Date {
  return Toolkit.DateTime.addHours(departure, 24);
}

export function tripToDeparture(trip: ArrivalTimes): Departure {
  const start = _.head(trip.arrivalTimes);
  const end = _.last(trip.arrivalTimes);
  const nbSteps = Object.keys(_.groupBy(trip.arrivalTimes, arrivalTime => arrivalTime.tripId)).length;

  return {
    startId: start.stopId,
    startName: start.stopName,
    endId: end.stopId,
    startTime: start.departure,
    endName: end.stopName,
    endTime: end.arrival,
    nbSteps: nbSteps,
    id: trip.id
  };
}

export module Departure {

  export function formatDay(dateTime: Date): string {
    return moment(dateTime).format('dddd D MMMM YYYY');
  }

  export function formatDateTime(dateTime: Date): string {
    return moment(dateTime).format('d/MM/YYYY HH:mm');
  }

  export function formatTime(dateTime: Date): string {
    return moment(dateTime).format('HH:mm');
  }

  export function formatDuration(duration: number, f?: (hours: number, minutes: number) => string): string {
    const hours = Toolkit.Number.trunc(duration / 3600000);
    const minutes = Toolkit.Number.trunc((duration - (hours * 3600000)) / 1000 / 60);
    if(!f) {
      return Toolkit.pad(hours, 2) + ':' + Toolkit.pad(minutes, 2);
    } else {
      return f(hours, minutes);
    }
  }
}
