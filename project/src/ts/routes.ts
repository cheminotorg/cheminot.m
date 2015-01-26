export function home(tab: string, start: string, end: string, at: Date) {
  if(tab != 'today' && start && end) {
    return '/query/' + [tab, start, end, at.getTime()].join('/');
  } else {
    return '/';
  }
}

export function departures(startId: string, endId: string, at: Date) {
  return '/departures/' + startId + '/' + endId + '/' + at.getTime();
}

export function trip(id: string) {
  return '/trip/' + id;
}

export function matchHome(tab: string, route: string, start: string, end: string, at: Date) {
  var reg = new RegExp('^(/query/.*?/' + start + '/' + end + '/' + at.getTime() + ')|(/)$');
  return reg.test(route);
}

export function matchDepartures(route: string) {
  return /\/departures\/.+/.test(route);
}

export function matchTrip(route: string) {
  return /\/trip\/.+/.test(route);
}
