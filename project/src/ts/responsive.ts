import Utils = require('utils');
import native = require('native');

var ticking = false;

function update() {
  var [height, width] = Utils.viewportSize();
  var wsize = (width * 100) / 320;
  var hsize = (height * 100) / 568;
  var html = <HTMLElement> document.querySelector('html');
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

  if(native.Cheminot.isDemo() && !Utils.Detectizr.isMobile()) {

    window.addEventListener('resize', onResize, false);

    onResize();
  }
}
