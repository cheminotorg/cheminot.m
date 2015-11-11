import moment = require('moment');
import Q = require('q');
import mithril = require('mithril');
import _ = require('lodash');
import native = require('native');
import Alert = require('alert');
import i18n = require('i18n');

export const noop = () => {};

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
}

export function pad(n: number, width: number): string {
  const sn = n + '';
  return sn.length >= width ? sn : new Array(width - sn.length + 1).join('0') + sn;
}

export module Number {

  export function trunc(n: number): number {
    return n < 0 ? Math.ceil(n) : Math.floor(n);
  }
}

export module DateTime {

  if(native.Cheminot.isMocked() || native.Cheminot.isStage()) {
    setInterval(() => {
      if(window.NOW) {
        window.NOW = addSeconds(window.NOW, 1);
      }
    }, 1000);
  }

  export function now(): Date {
    return window.NOW || new Date();
  }

  export function diff(from: Date, to: Date): number {
    return moment(to).diff(moment(from));
  }

  export function setSameTime(reference: Date, time: Date): Date {
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    return moment(reference).hours(h).minutes(m).seconds(s).toDate()
  }

  export function setSameDay(reference: Date, date: Date): Date {
    const d = date.getDate();
    const m = date.getMonth();
    const y = date.getFullYear();
    return moment(reference).date(d).month(m).year(y).toDate()
  }

  export function addMinutes(date: Date, n: number): Date {
    return moment(date).add(n, 'minutes').toDate();
  }

  export function addSeconds(date: Date, n: number): Date {
    return moment(date).add(n, 'seconds').toDate();
  }

  export function addHours(date: Date, n: number): Date {
    return moment(date).add(n, 'hours').toDate();
  }

  export function addDays(date: Date, n: number): Date {
    return moment(date).add(n, 'days').toDate();
  }
}

export module Obj {

  export function put(obj: Object, path: string, value: JsValue): Object {
    const sp = path.split('.');
    sp.reduce((acc: JsObject, p: string, index: number) => {
      const v = acc[p];
      if(index + 1 >= sp.length) {
        const x = acc[p];
        if(typeof x === 'string') {
          const alreadyExisting = acc[p];
          if(typeof alreadyExisting === 'string') {
            const xxx: string[] = alreadyExisting.split(' ');
            if(typeof value === 'string') {
              const yyy = value.split(' ');
              acc[p] = _.uniq<string>(xxx.concat(yyy)).join(' ');
            } else {
              acc[p] = value;
            }
          } else {
            acc[p] = value;
          }
        } else {
          acc[p] = value;
        }
        return acc;
      } else if(_.isNull(v) || _.isUndefined(v) || !_.isObject(v)) {
        acc[p] = {};
        return acc[p];
      } else {
        return acc;
      }
    }, obj);
    return obj;
  }

  function buildPath(rootPath: string, key: string) {
    return rootPath ? (rootPath + '.' + key) : key;
  }

  export function filter(obj: Object, predicat: (path: string) => boolean): Object {
    const step = (z: Object = {}, rootPath: string = '', tree: JsObject = {}): Object => {
      return Object.keys(tree).reduce((acc: Object, key: string) => {
        const value: JsValue = tree[key];
        const path = buildPath(rootPath, key);
        if(_.isPlainObject(value)) {
          const o = <JsObject>value;
          return step(acc, path, o);
        } else if(_.isNull(value) || _.isUndefined(value)) {
          return acc;
        } else {
          if(typeof value === 'string') {
            return value.split(' ').reduce((xxx, v) => {
              return predicat(buildPath(path, v)) ? put(xxx, path, v) : xxx;
            }, acc);
          } else {
            return predicat(path) ? put(acc, path, value) : acc;
          }
        }
      }, z);
    }
    return step({}, '', <JsObject>obj);
  }
}

export module m {

  export function prop(value?: any, f?: (value: any) => void, scope?: any): (value?: any) => any {
    function _prop(store?: any, f?: (value: any) => void, scope?: any) {
      const prop = function(s?: any) {
        if (s !== undefined) store = s;
        f !== undefined && s !==undefined && f.call(scope, s);
        return store;
      }
      return prop;
    }

    return _prop(value, f, scope);
  }

  export function attributes(mask: StringMap<boolean>): (obj: Object, config?: (el: HTMLElement, isUpdate: boolean, context: mithril.Context) => void) => Object {
    return (obj: mithril.Attributes, config?: (el: HTMLElement, isUpdate: boolean) => void) => {
      if(config) obj.config = config;
      return Obj.filter(obj, (path) => {
        const x = mask[path.replace(/\./g, ':')];
        return _.isUndefined(x) || _.isNull(x) || !!x;
      });
    }
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

export module Arr {

  export function zipWithIndex<T>(aaa: T[]): [T, number][] {
    return _.zip(aaa, _.range(0, aaa.length));
  }

  export function lastn<T>(aaa: T[], x: number, y: number): T {
    if(y > x) throw new Error('y should be inferior or equal to x');
    const formula = (z: number) => (x * z) + y;
    return _.range(0, aaa.length).reduce((x, i) => {
      const index = formula(i) - 1;
      return aaa[index] ? aaa[index] : x;
    }, null);
  }

  function unfold<A, B>(z: B, f: (x: B) => [A, B]): A[] {
    const x = f(z);
    if(x) {
      const [elem, next] = x;
      const acc = unfold(next, f);
      acc.push(elem);
      return acc;
    } else {
      return [];
    }
  }
}

export module Promise {

  export function done(): Q.Promise<void> {
    return Q<void>(null);
  }

  export function pure<T>(t: T): Q.Promise<T> {
    return Q<T>(t);
  }

  export function withMinimumDelay<T>(promise: Q.Promise<T>, delay: number): Q.Promise<T> {
    const timeout = Q.defer<T>();
    setTimeout(() => timeout.resolve(null), delay);
    return Q.spread([promise, timeout.promise], (result: T) => {
      return result;
    }, () => { return promise });
  }

  export function foldLeftSequentially<A, B>(seq: Array<A>, z: B, f: (x: B, y: A) => Q.Promise<B>): Q.Promise<B> {
    if(seq.length === 0) {
      return Q(z);
    } else {
      let h = seq[0];
      let t = seq.slice(1);
      return f(z, h).then((acc) => foldLeftSequentially(t, acc, f));
    }
  }

  export function sequence<T, U>(seq: Array<T>, f: (t: T) => Q.Promise<U>): Q.Promise<Array<U>> {
    if(seq.length === 0) {
      return Q([]);
    } else {
      const h = seq[0];
      const t = seq.slice(1);
      return f(h).then<Array<U>>((t1) => {
        return sequence(t, f).then((t2) => {
          return [t1].concat(t2)
        });
      });
    }
  }
}

export module Transition {

  export function transitionEnd(): string {
    let transitionend = "transitionend"
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

  const bindHandlers: StringMap<EventHandler> = {};

  export function bindonce(event: string, handler: (e: Event) => void): void {
    const h = bindHandlers[event];
    if(h) document.body.removeEventListener(event, h);
    document.body.addEventListener(event, handler);
    bindHandlers[event] = handler;
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
}
