import Q = require('q');
import Qajax = require('qajax');

type DemoArrivalTime = {
  stopId: string;
  stopName: string;
  arrival: number;
  departure: number;
  tripId: string;
  pos: number;
}

const baseURL = 'http://cheminot.org';

export function init(success: (meta: Meta) => void, error: (err: string) => void): void {
  const endpoint = baseURL + '/cheminotm/init';
  Qajax(endpoint)
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
      if(trip) {
      success(trip.map(function(arrivalTime) {
        return {
          stopId: arrivalTime.stopId,
          stopName: arrivalTime.stopName,
          tripId: arrivalTime.tripId,
          pos: arrivalTime.pos,
          arrival: new Date(arrivalTime.arrival * 1000),
          departure: new Date(arrivalTime.departure * 1000)
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
      success([result.hasDirect, result.arrivalTimes.map(function(arrivalTime) {
        return {
          stopId: arrivalTime.stopId,
          stopName: arrivalTime.stopName,
          tripId: arrivalTime.tripId,
          pos: arrivalTime.pos,
          arrival: new Date(arrivalTime.arrival * 1000),
          departure: new Date(arrivalTime.departure * 1000)
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
var queue: string[] = [];

function Stream(): EventSource {
  const endpoint = baseURL + '/cheminotm/trace';

  var stream = new EventSource(baseURL + '/cheminotm/trace');

  stream.onmessage = (msg) => {
    var data: string[] = JSON.parse(msg.data);
    queue = queue.concat(data);
  };

  stream.onerror = (event: any) => {
    console.log(event);
  };

  return stream;
}

export function trace(success: (trace: string[]) => void, error: (err: string) => void): void {
  if(!stream) stream = Stream();
  console.log(queue.length);
  success(queue);
  queue = [];
}
