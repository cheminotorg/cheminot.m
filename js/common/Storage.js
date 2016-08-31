import { AsyncStorage } from 'react-native';

export default {
  getItem(key) {
    return AsyncStorage.getItem(key).then((item) => JSON.parse(item));
  },

  setItem(key, value) {
    return AsyncStorage.setItem(key, JSON.stringify(value));
  },
};
