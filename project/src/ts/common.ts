import _ = require('lodash');
import Utils = require('utils');
import Cache = require('cache');
import Q = require('q');
import moment = require('moment');

export function departureBound(departure: Date): Date {
  return Utils.DateTime.addHours(departure, 12);
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
    const hours = Utils.Number.trunc(duration / 3600000);
    const minutes = Utils.Number.trunc((duration - (hours * 3600000)) / 1000 / 60);
    if(!f) {
      return Utils.pad(hours, 2) + ':' + Utils.pad(minutes, 2);
    } else {
      return f(hours, minutes);
    }
  }
}
