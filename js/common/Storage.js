import { AsyncStorage } from 'react-native';

const KEYS = {
  trips: 'trips',
  tripsByDepartureTime(vs, ve) {
    return `${vs}#${ve}`;
  },
};

function removeItem(key) {
  return AsyncStorage.removeItem(key);
}

function getItem(key) {
  return AsyncStorage.getItem(key).then((item) => JSON.parse(item));
}

function setItem(key, value) {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}

function mergeItem(key, value) {
  return AsyncStorage.mergeItem(key, JSON.stringify(value));
}

function getAllTrips() {
  return getItem(KEYS.trips);
}

function getAllTripsOrElse(orElse) {
  return getAllTrips(KEYS.trips).then((trips) => trips || orElse());
}

function getTrips(vs, ve) {
  return getAllTripsOrElse(() => ({})).then((trips) => {
    return trips[KEYS.tripsByDepartureTime(vs, ve)] || { trips: [], week: {} };
  });
}

function setTrips({ vs, ve, trips, week }) {
  return getAllTripsOrElse(() => ({})).then((allTrips) => {
    allTrips[KEYS.tripsByDepartureTime(vs, ve)] = { vs, ve, trips, week };
    return setItem(KEYS.trips, allTrips);
  });
}

export default {
  removeItem,
  mergeItem,
  getItem,
  setItem,
  setTrips,
  getTrips,
  getAllTripsOrElse,
};
