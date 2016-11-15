import R from 'ramda';

const ENDPOINT = 'http://10.0.3.2:8080/api';

function buildQueryString(params) {
  return Object.keys(params).reduce((acc, key) => {
    const newparam = `${key}=${params[key]}`;
    return acc ? `${acc}&${newparam}` : newparam;
  }, '');
}

function fetchTrips(vs, ve, week = {}) {
  const qs = buildQueryString(Object.assign({ vs, ve }, week));
  return fetch(`${ENDPOINT}/trips.json?${qs}`).then((response) => (
    response.json()
  ));
}

function fetchTripsByDepartureTime(vs, ve, week = {}) {
  return fetchTrips(vs, ve, week).then((response) => (
    R.groupBy((trip) => trip.stopTimes[0].departure)(response.results)
  ));
}

function searchTrips(vs, ve, at, limit = 10) {
  const qs = buildQueryString({ vs, ve, at: at.toISOString(), limit });
  return fetch(`${ENDPOINT}/trips/search.json?${qs}`).then((response) => response.json());
}

export default {
  searchTrips,
  fetchTripsByDepartureTime,
};
