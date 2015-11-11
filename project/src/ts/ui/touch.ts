import mithril = require('mithril');
import Toolkit = require('toolkit');

const HOLD_DURATION = 600;
const SCROLL_TOLERANCE = 8;
const ACTIVE_CLASS = 'active';

type UnbindFunction = (context: mithril.Context) => void;

function hasContextMenu() {
  return cordova.platformId !== 'ios';
}

declare type Boundaries = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function TouchHandler(el: HTMLElement, tapHandler: (e: Event) => void, holdHandler: () => void, scrollX: boolean, scrollY: boolean, touchEndFeedback: boolean): () => void {
  let startX: number, startY: number, boundaries: Boundaries, active: boolean, holdTimeoutID: number;

  if (typeof tapHandler !== 'function')
    throw new Error('Handler 2nd argument must be a function!');

  if (holdHandler && typeof holdHandler !== 'function')
    throw new Error('Handler 3rd argument must be a function!');

  function onTouchStart(e: TouchEvent) {
    let touch = e.changedTouches[0];
    let boundingRect = el.getBoundingClientRect();
    startX = touch.clientX;
    startY = touch.clientY;
    boundaries = {
      minX: boundingRect.left,
      maxX: boundingRect.right,
      minY: boundingRect.top,
      maxY: boundingRect.bottom
    };
    active = true;
    setTimeout(() => {
      if (active) el.classList.add(ACTIVE_CLASS);
    }, 200);
    if (!hasContextMenu()) holdTimeoutID = setTimeout(onHold, HOLD_DURATION);
  }

  function onTouchMove(e: TouchEvent) {
    // if going out of bounds, no way to reenable the button
    if (active) {
      let touch = e.changedTouches[0];
      active = isActive(touch);
      if (!active) {
        clearTimeout(holdTimeoutID);
        el.classList.remove(ACTIVE_CLASS);
      }
    }
  }

  function onTouchEnd(e: TouchEvent) {
    if (e.cancelable) e.preventDefault();
    if (active) {
      clearTimeout(holdTimeoutID);
      if (touchEndFeedback) el.classList.add(ACTIVE_CLASS);
      tapHandler(e);
      active = false;
      setTimeout(() => el.classList.remove(ACTIVE_CLASS), 80);
    }
  }

  function onClick(e: Event) {
    if (e.cancelable) e.preventDefault();
    tapHandler(e);
  }

  function onTouchCancel() {
    clearTimeout(holdTimeoutID);
    active = false;
    el.classList.remove(ACTIVE_CLASS);
  }

  function onContextMenu(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (holdTimeoutID === undefined) onHold();
  }

  function onHold() {
    if (holdHandler) {
      holdHandler();
      active = false;
      el.classList.remove(ACTIVE_CLASS);
    }
  }

  function isActive(touch: Touch) {
    let x = touch.clientX,
      y = touch.clientY,
      b = boundaries,
      d = 0;
    if (scrollX) d = Math.abs(x - startX);
    if (scrollY) d = Math.abs(y - startY);
    return x < b.maxX && x > b.minX && y < b.maxY && y > b.minY && d < SCROLL_TOLERANCE;
  }

  el.addEventListener('click', onClick, false);
  el.addEventListener('touchstart', onTouchStart, false);
  el.addEventListener('touchmove', onTouchMove, false);
  el.addEventListener('touchend', onTouchEnd, false);
  el.addEventListener('touchcancel', onTouchCancel, false);
  el.addEventListener('contextmenu', onContextMenu, false);

  return function unbind() {
    el.removeEventListener('click', onClick, false);
    el.removeEventListener('touchstart', onTouchStart, false);
    el.removeEventListener('touchmove', onTouchMove, false);
    el.removeEventListener('touchend', onTouchEnd, false);
    el.removeEventListener('touchcancel', onTouchCancel, false);
    el.removeEventListener('contextmenu', onContextMenu, false);
  };
}

export function ontap(el: HTMLElement, tapHandler: (e: Event) => void, holdHandler:() => void = Toolkit.noop, scrollX: boolean = false, scrollY: boolean = false, touchEndFeedback: boolean = true): UnbindFunction {
  const unbind = TouchHandler(el, tapHandler, holdHandler, scrollX, scrollY, touchEndFeedback);
  return (context: mithril.Context) => {
    context.onunload = () => {
      unbind();
    }
  };
}

export function onlongtap(el: HTMLElement, holdHandler:() => void = Toolkit.noop, scrollX: boolean = false, scrollY: boolean = false, touchEndFeedback: boolean = true): UnbindFunction {
  return ontap(el, Toolkit.noop, holdHandler, scrollX, scrollY, touchEndFeedback);
}

export function ontapX(el: HTMLElement, tapHandler: (e: TouchEvent) => void, holdHandler: () => void, touchEndFeedback: boolean = true): UnbindFunction {
  return ontap(el, tapHandler, holdHandler, true, false, touchEndFeedback);
};

export function ontapY(el: HTMLElement, tapHandler: (e: TouchEvent) => void, holdHandler: () => void, touchEndFeedback: boolean = true): UnbindFunction {
  return ontap(el, tapHandler, holdHandler, false, true, touchEndFeedback);
};

export module m {

  export function ontap(tapHandler: (e: Event) => void, holdHandler:() => void = Toolkit.noop, scrollX: boolean = false, scrollY: boolean = false, touchEndFeedback: boolean = true) {
    return (el: HTMLElement, isUpdate: boolean, context: mithril.Context) => {
      if (!isUpdate) {
        const unbind = TouchHandler(el, tapHandler, holdHandler, scrollX, scrollY, touchEndFeedback);
        context.onunload = () => {
          unbind();
        };
      }
    };
  }
}
