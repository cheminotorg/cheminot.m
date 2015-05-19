import Q = require('q');
import Qajax = require('qajax');

type DemoArrivalTime = {
  stopId: string;
  stopName: string;
  arrival: number;
  departure: number;
  tripId: string;
  pos: number;
  lat: number;
  lng: number;
}

const baseURL = '';

export function init(success: (meta: Meta) => void, error: (err: string) => void): void {
  const endpoint = baseURL + '/cheminotm/init';
  Qajax(endpoint)
      .then((response) => {
        var result: any;
        try { result = JSON.parse(response.responseText); } catch(e) {};
        if(response.status == 400 && result && result.error) {
          window.parent.postMessage({
            event: 'cheminot:init',
            error: result.error
          }, window.location.origin);
        }
        return response;
      })
      .then(Qajax.filterSuccess)
      .then(response => Qajax.toJSON<Meta>(response))
      .then(result => success(result))
      .catch(e => error(e));
}

export function lookForBestTrip(vsId: string, veId: string, at: Date, te: Date, max: number, success: (stopTimes: ArrivalTime[]) => void, error: (err: string) => void): void {

  const endpoint = baseURL + '/cheminotm/besttrip';
  const atTimestamp = Math.round(at.getTime() / 1000);
  const teTimestamp = Math.round(te.getTime() / 1000);

  Qajax({
    url: endpoint,
    method: 'POST',
    data: {
      vsId: vsId,
      veId: veId,
      at: atTimestamp,
      te: teTimestamp,
      max: max
    }
  }).then(Qajax.filterSuccess)
    .then(response => {
      let trip: DemoArrivalTime[] = JSON.parse(response.responseText);
      window.parent.postMessage({
        event: 'cheminot:lookforbesttrip',
        trip: trip
      }, window.location.origin);
      if(trip) {
      success(trip.map(function(arrivalTime) {
        return {
          stopId: arrivalTime.stopId,
          stopName: arrivalTime.stopName,
          tripId: arrivalTime.tripId,
          pos: arrivalTime.pos,
          arrival: new Date(arrivalTime.arrival * 1000),
          departure: new Date(arrivalTime.departure * 1000),
          lat: arrivalTime.lat,
          lng: arrivalTime.lng
        };
      }));
      } else {
        error('aborted');
      }
    })
    .catch(e => error(e));
}

export function lookForBestDirectTrip(vsId: string, veId: string, at: Date, te: Date, success: (result: [boolean, ArrivalTime[]]) => void, error: (err: string) => void): void {

  const endpoint = baseURL + '/cheminotm/bestdirecttrip';
  const atTimestamp = Math.round(at.getTime() / 1000);
  const teTimestamp = Math.round(te.getTime() / 1000);

  Qajax({
    url: endpoint,
    method: 'POST',
    data: {
      vsId: vsId,
      veId: veId,
      at: atTimestamp,
      te: teTimestamp
    }
  }).then(Qajax.filterSuccess)
    .then(response => {
      let result: {hasDirect: boolean, arrivalTimes: DemoArrivalTime[]} = JSON.parse(response.responseText);
      window.parent.postMessage({
        event: 'cheminot:lookforbestdirecttrip',
        trip: result.arrivalTimes
      }, window.location.origin);
      success([result.hasDirect, result.arrivalTimes.map(function(arrivalTime) {

        return {
          stopId: arrivalTime.stopId,
          stopName: arrivalTime.stopName,
          tripId: arrivalTime.tripId,
          pos: arrivalTime.pos,
          arrival: new Date(arrivalTime.arrival * 1000),
          departure: new Date(arrivalTime.departure * 1000),
          lat: arrivalTime.lat,
          lng: arrivalTime.lng
        };
      })]);
    })
    .catch(e => error(e));
}

export function abort(success: () => void, error: (err: string) => void): void {
  const endpoint = baseURL + '/cheminotm/abort';
  Qajax({
    url: endpoint,
    method: 'POST'
  }).then(Qajax.filterSuccess)
    .then(response => success())
    .catch(e => error(e));
}

var stream: EventSource;
var queue: Station[] = [];

function Stream(): EventSource {
  const endpoint = baseURL + '/cheminotm/trace';

  var stream = new EventSource(baseURL + '/cheminotm/trace');

  stream.onmessage = (msg) => {
    var data: Station[] = JSON.parse(msg.data);
    queue = queue.concat(data);
  };

  stream.onerror = (event: any) => {
    console.log(event);
  };

  return stream;
}

export function trace(success: (trace: Station[]) => void, error: (err: string) => void): void {
  if(!stream) stream = Stream();
  success(queue);
  queue = [];
}
