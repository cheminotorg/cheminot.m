const ENDPOINT = 'http://10.0.3.2:8080/api';

function buildQueryString(params) {
  return Object.keys(params).reduce((acc, key) => {
    const newparam = `${key}=${params[key]}`;
    return acc ? `${acc}&${newparam}` : newparam;
  }, '');
}

function searchTrips(vs, ve, _at, limit = 10) {
  const at = _at.toISOString();
  const qs = buildQueryString({ vs, ve, at, limit });
  return fetch(`${ENDPOINT}/trips/search.json?${qs}`).then((response) => response.json());
}

function searchDepartures(vs, ve, _week) {
  const week = _week || {};
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
