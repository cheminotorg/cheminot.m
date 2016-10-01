const ENDPOINT = 'http://10.0.3.2:8080/api';

function buildQueryString(params) {
  return Object.keys(params).reduce((acc, key) => {
    const newparam = `${key}=${params[key]}`;
    return acc ? `${acc}&${newparam}` : newparam;
  }, '');
}

function fetchTrips(vs, ve, departureTimes) {
  return fetch(`${ENDPOINT}/trips/departure/${vs}/arrival/${ve}`).then((response) => response.json());
}

function searchTrips(vs, ve, at, limit = 10) {
  const qs = buildQueryString({ vs, ve, at: at.toISOString(), limit });
  return fetch(`${ENDPOINT}/trips/search.json?${qs}`).then((response) => response.json());
}

function searchDepartures(vs, ve, week = {}) {
  const qs = buildQueryString(Object.assign({ vs, ve }, week));
  console.log(`${ENDPOINT}/departures/search.json?${qs}`);
  return fetch(`${ENDPOINT}/departures/search.json?${qs}`).then((response) => (
    response.json()
  ));
}

export default {
  searchTrips,
  searchDepartures,
};
