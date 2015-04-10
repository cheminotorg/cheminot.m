import moment = require('moment');
import Q = require('q');
import _ = require('lodash');
import native = require('native');
import Alert = require('alert');
import i18n = require('i18n');

export function viewportSize(): [number, number] {
  return [
    Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  ];
}

export function handleError(event: any, source?: string, fileno?: number, columnNumber?: number) {
  const description = `${event} at ${source} [${fileno}, ${columnNumber}]`;
  console.error(event.stack ? event.stack : event);
  native.GoogleAnalytics.trackException(description, true);
  Alert.error(i18n.fr('unexpected-error')).fin(() => {
    window.location.hash="#";
    window.location.reload();
  });
}

export function pad(n: number, width: number): string {
  var sn = n + '';
  return sn.length >= width ? sn : new Array(width - sn.length + 1).join('0') + sn;
}

export module DateTime {

  export function diff(from: Date, to: Date): number {
    return moment(to).diff(moment(from));
  }

  export function setSameTime(reference: Date, time: Date): Date {
    var h = time.getHours();
    var m = time.getMinutes();
    var s = time.getSeconds();
    return moment(reference).hours(h).minutes(m).seconds(s).toDate()
  }

  export function setSameDay(reference: Date, date: Date): Date {
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    return moment(reference).date(d).month(m).year(y).toDate()
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

  export function handleAttributes(attributes: Attributes, validate: (name: string, value: string) => boolean): Attributes {
    for(var key in attributes) {
      var attributeValue = attributes[key];
      if(_.isString(attributeValue)) {
        var values = attributes[key].split(' ');
        attributes[key] = values.filter((value:any) => validate(key, value)).join(' ');
      } else {
        attributes[key] = validate(key, attributeValue) ? attributeValue : null;
      }
    }
    return attributes;
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

  export function withMinimumDelay<T>(promise: Q.Promise<T>, delay: number): Q.Promise<T> {
    var timeout = Q.defer<T>();
    setTimeout(() => timeout.resolve(null), delay);
    return Q.spread([promise, timeout.promise], (result: T) => {
      return result;
    }, () => { return promise });
  }

  export function pure<T>(t: T): Q.Promise<T> {
    return Q<T>(t);
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

  export function trigger(event: string, data?: any): void {
    document.body.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  export function one(el: HTMLElement, event: string, handler: (e: Event) => void): HTMLElement {
    el.addEventListener(event, function h(e) {
      handler(e);
      el.removeEventListener(event, h);
    });
    return el;
  }

  export function longtouch(el: HTMLElement, ms: number, handler: (e: Event) => void): Element {
    var t: number;
    el.addEventListener('touchstart', (e) => {
      if(!el.classList.contains('press')) {
        el.classList.add('press');
        t = setTimeout(() => {
          el.classList.add('press-done');
          if(el.classList.contains('press')) {
            navigator.vibrate(300);
          }
        }, ms);
      }
    });

    el.addEventListener('touchend', (e) =>{
      if(el.classList.contains('press-done')) {
        handler(e);
      }
      clearTimeout(t);
      el.classList.remove('press');
      el.classList.remove('press-done');
    });

    return el;
  }
}
