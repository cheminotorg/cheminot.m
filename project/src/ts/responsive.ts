import Toolkit = require('toolkit');
import native = require('native');
import Q = require('q');

let ticking = false;

const d = Q.defer<void>();

function update() {
  window.setTimeout(function() {
    const [height, width] = Toolkit.viewportSize();
    const wsize = (width * 100) / 320;
    const hsize = (height * 100) / 568;
    const html = <HTMLElement> document.querySelector('html');
    html.style.fontSize = Math.round(wsize < hsize ? wsize : hsize) + '%';
    ticking = false;
    d.resolve(null);
  }, 300);
}

function requestTick() {
  if(!ticking) {
    requestAnimationFrame(update);
  }
  ticking = true;
}

function onResize() {
  requestTick();
}

export function init(): Q.Promise<void> {

  if(native.Cheminot.isDemo() && !Toolkit.Detectizr.isMobile()) {

    window.addEventListener('resize', onResize, false);

  }

  document.addEventListener("resume", () => onResize(), false);

  onResize();

  return d.promise
;}
