import { AsyncStorage } from 'react-native';

const KEYS = {
  trips: 'trips',
  departureTimes: 'departures',
};

function getItem(key) {
  return AsyncStorage.getItem(key).then((item) => JSON.parse(item));
}

function setItem(key, value) {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}

function setDepartureTimes(departureTimes) {
  setItem(KEYS.departureTimes, departureTimes);
}

function getDepartureTimes() {
  return getItem(KEYS.departureTimes);
}

export default {
  getItem,
  setItem,
  setDepartureTimes,
  getDepartureTimes,
};
