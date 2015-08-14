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
  const description = `[${Settings.gitVersion}] ${event} at ${source} [${fileno}, ${columnNumber}]`;
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

export module Number {

  export function trunc(n: number): number {
    return n < 0 ? Math.ceil(n) : Math.floor(n);
  }
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

  export function addDays(date: Date, n: number): Date {
    return moment(date).add(n, 'days').toDate();
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

  export function isMobile(): boolean {
    return isAndroid() ||
      isIOS() ||
      /webOS/i.test(navigator.userAgent) ||
      /BlackBerry/i.test(navigator.userAgent) ||
      /Windows Phone/i.test(navigator.userAgent);
  }

  export function isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  export function isIOS(): boolean {
    return /iPhone/i.test(navigator.userAgent) ||
        /iPad/i.test(navigator.userAgent) ||
        /iPod/i.test(navigator.userAgent);
  }

  export function isIOS7(): boolean {
    return isIOS() && /OS 7/i.test(navigator.userAgent);
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

  export function touchstart(el: HTMLElement, handler: (e: Event) => void): void {
    if(Detectizr.isMobile()) {
      el.addEventListener('touchstart', handler);
    } else {
      el.addEventListener('click', handler);
    }
  }

  export function touchend(el: HTMLElement, handler: (e: Event) => void): void {
    if(Detectizr.isMobile()) {
      el.addEventListener('touchend', handler);
    } else {
      el.addEventListener('click', handler);
    }
  }

  export function touchendOne(el: HTMLElement, handler: (e: Event) => void): void {
    if(Detectizr.isMobile()) {
      one(el, 'touchend', handler);
    } else {
      one(el, 'click', handler);
    }
  }

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
            navigator.vibrate && navigator.vibrate(300);
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
