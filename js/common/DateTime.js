import moment from 'moment';

export default {
  formatMinutes(minutes) {
    const time = moment.duration(minutes, 'minutes');
    return moment.utc(time.asMilliseconds()).format('HH:mm');
  },
};
