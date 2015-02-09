import moment = require('moment');
import Q = require('q');

export function viewportSize(): [number, number] {
  return [
    Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  ];
}

export module DateTime {

  export function diff(from: Date, to: Date): number {
    return moment(to).diff(moment(from));
  }

  export function setSameTime(from: Date, reference: Date): Date {
    var h = from.getHours();
    var m = from.getMinutes();
    var s = from.getSeconds();
    return moment(reference).hours(h).minutes(m).seconds(s).toDate()
  }

  export function setSameDay(from: Date, reference: Date): Date {
    var date = from.getDate();
    var month = from.getMonth();
    var year = from.getFullYear();
    return moment(reference).date(date).month(month).year(year).toDate()
  }

  export function addMinutes(date: Date, n: number): Date {
    return moment(date).add(n, 'minutes').toDate();
  }

  export function addHours(date: Date, n: number): Date {
    return moment(date).add(n, 'hours').toDate();
  }
}

export module m {

  export function prop(value?: any, f?: (value: any) => void, scope?: any): (value?: any) => any {
    function _prop(store?: any, f?: (value: any) => void, scope?: any) {
      var prop = function(s?: any) {
        if (s !== undefined) store = s;
        f !== undefined && s !==undefined && f.call(scope, s);
        return store;
      }
      return prop;
    }

    return _prop(value, f, scope);
  }

  export function propMap<T>(values: Array<[string, T]>): (key: string, value?: T) => T {
    var _prop = (map?: Map<string, T>) => {
      var prop = (key: string, value?: T) => {
        if (value !== undefined) map.set(key, value);
        return map.get(key);
      }
      return prop;
    }

    var map = values.reduce((acc, pair) => {
      acc.set(pair[0], pair[1]);
      return acc;
    }, new Map<string, T>());

    return _prop(map);
  }
}

export module Log {

  export function error<A>(message: A) {
    if(self.console) {
      console.error(message);
    } else if(self.alert) {
      alert(message);
    }
  }

  export function info<A>(message: A) {
    if(self.console) {
      console.log(message);
    } else if(self.alert) {
      alert('INFO : ' + message);
    }
  }

  export function debug<A>(message: A): A {
    info(message);
    return message;
  }
}

export module Detectizr {

  export function isMobile() {
    return isAndroid() ||
      isIOS() ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i);
  }

  export function isAndroid() {
    return navigator.userAgent.match(/Android/i);
  }

  export function isIOS() {
    return navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i);
  }

  export function isIOS7() {
    return isIOS() && navigator.userAgent.match(/OS 7/);
  }
}

export module Promise {

  export function done(): Q.Promise<void> {
    return Q<void>(null);
  }

  export function pure<T>(t: T): Q.Promise<T> {
    return Q<T>(t);
  }

  export function par<T>(seq: Array<Q.Promise<T>>): Q.Promise<Array<T>> {
    var d = Q.defer<Array<T>>();
    var fullfilled = new Array<T>();
    var toFullFill = seq.length;

    seq.forEach((f, i) => {
      f.then((t) => {
        fullfilled[i] = t;
      }).catch((reason) => {
        fullfilled[i] = reason;
      }).fin(() => {
        toFullFill -= 1;
        if(toFullFill <= 0) {
          d.resolve(fullfilled);
        }
      });
    });
    return d.promise;
  }

  export function sequence<T>(seq: Array<T>, f: (t: T) => Q.Promise<T>): Q.Promise<Array<T>> {
    if(seq.length === 0) {
      return Q([]);
    } else {
      var h = seq[0];
      var t = seq.slice(1);
      return f(h).then<Array<T>>((t1) => {
        return sequence(t, f).then((t2) => {
          return [t1].concat(t2)
        });
      });
    }
  }
}

export module Transition {

  export function transitionEnd(): string {
    var transitionend = "transitionend"
    if('WebkitTransition' in document.body.style
       && !("OTransition" in document.body.style) ) {
      transitionend = 'webkitTransitionEnd';
    }
    return transitionend;
  }
}

export module $ {

  export function bind(event: string, handler: (e: Event) => void): void {
    document.body.addEventListener(event, handler);
  }

  export function trigger(event: string): void {
    document.body.dispatchEvent(new Event(event));
  }

  export function one(el: HTMLElement, event: string, handler: (e: Event) => void): HTMLElement {
    el.addEventListener(event, function h(e) {
      handler(e);
      el.removeEventListener(event, h);
    });
    return el;
  }
}
