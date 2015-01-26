export function home(tab: string, start: string, end: string, at: Date) {
  var when = (start && end) ? at.getTime() : null;
  return '/query/' + [tab, start, end, when].filter(x => !!x).join('/');
}

export function departures(startId: string, endId: string, at: Date) {
  return '/departures/' + startId + '/' + endId + '/' + at.getTime();
}

export function trip(id: string) {
  return '/trip/' + id;
}

export function matchHome(tab: string, route: string, start: string, end: string, at: Date) {
  return route == home(tab, start, end, at);
}

export function matchDepartures(route: string) {
  return /\/departures\/.+/.test(route);
}

export function matchTrip(route: string) {
  return /\/trip\/.+/.test(route);
}
