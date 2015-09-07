import Toolkit = require('toolkit');
import native = require('native');

let ticking = false;

function update() {
  const [height, width] = Toolkit.viewportSize();
  const wsize = (width * 100) / 320;
  const hsize = (height * 100) / 568;
  const html = <HTMLElement> document.querySelector('html');
  html.style.fontSize = (wsize < hsize ? wsize : hsize) + '%';
  ticking = false;
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

export function init() {

  if(native.Cheminot.isDemo() && !Toolkit.Detectizr.isMobile()) {

    window.addEventListener('resize', onResize, false);

  }

  window.addEventListener('orientationchange', () => onResize());

  onResize();
}
