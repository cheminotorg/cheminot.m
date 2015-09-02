export function now() {
  return '/';
}

export function search(tab?: string, start?: string, end?: string, at?: Date) {
  const params = [tab, start, end, at ? at.getTime() : 0].filter((x) => !!x);
  return params.length ? '/search/' + params.join('/') : '/search';
}

export function departures(startId: string, endId: string, at: Date) {
  return '/departures/' + startId + '/' + endId + '/' + at.getTime();
}

export function trip(id: string) {
  return '/trip/' + id;
}

export function matchSearch(tab: string, route: string, start: string, end: string, at: Date) {
  const reg = new RegExp('^(/search/.*?/' + start + '/' + end + '/' + at.getTime() + ')|(/search)$');
  return reg.test(route);
}

export function matchDepartures(route: string) {
  return /\/departures\/.+/.test(route);
}

export function matchTrip(route: string) {
  return /\/trip\/.+/.test(route);
}

export function matchNow(route: string) {
  return '/' == route;
}
