import Q = require('q');

class MaterialRipple {

  private element: HTMLElement;

  private rippleElement: HTMLElement;

  private boundHeight: number = 0;

  private boundWidth: number = 0;

  private rippleSize: number = 0;

  private ignoringMouseDown: boolean = false;

  private frameCount: number = 0;

  private x: number = 0;

  private y: number = 0;

  private boundDownHandler: (event: any) => void;

  private boundUpHandler: (event: any) => void;

  private Constant = {
    INITIAL_SCALE: 'scale(0.0001, 0.0001)',
    INITIAL_SIZE: '1px',
    INITIAL_OPACITY: '0.4',
    FINAL_OPACITY: '0',
    FINAL_SCALE: ''
  };

  private CssClasses = {
    RIPPLE_CENTER: 'mdl-ripple--center',
    RIPPLE_EFFECT_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',
    RIPPLE: 'mdl-ripple',
    IS_ANIMATING: 'is-animating',
    IS_VISIBLE: 'is-visible'
  };

  constructor(element: HTMLElement) {
    this.element = element;
    this.rippleElement = <HTMLElement> this.element.querySelector('.' + this.CssClasses.RIPPLE);
    this.boundDownHandler = this.downHandler.bind(this);
    this.element.addEventListener('mousedown', this.boundDownHandler);
    this.element.addEventListener('touchstart', this.boundDownHandler);
    this.boundUpHandler = this.upHandler.bind(this);
    this.element.addEventListener('mouseup', this.boundUpHandler);
    this.element.addEventListener('mouseleave', this.boundUpHandler);
    this.element.addEventListener('touchend', this.boundUpHandler);
    this.element.addEventListener('blur', this.boundUpHandler);
  }

  private getFrameCount(): number {
    return this.frameCount;
  }

  private setFrameCount(fC: number) {
    this.frameCount = fC;
  }

  private setRippleXY(newX: number, newY: number) {
    this.x = newX;
    this.y = newY;
  }

  private upHandler(event: UIEvent) {
    if (event && event.detail !== 2) {
      this.rippleElement.classList.remove(this.CssClasses.IS_VISIBLE);
    }
    window.setTimeout(function () {
      this.rippleElement.classList.remove(this.CssClasses.IS_VISIBLE);
      this.destroy();
    }.bind(this), 0);
  }

  private downHandler(event: any) {
    if (!this.rippleElement.style.width && !this.rippleElement.style.height) {
      var rect = this.element.getBoundingClientRect();
      this.boundHeight = rect.height;
      this.boundWidth = rect.width;
      this.rippleSize = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2 + 2;
      this.rippleElement.style.width = this.rippleSize + 'px';
      this.rippleElement.style.height = this.rippleSize + 'px';
    }
    this.rippleElement.classList.add(this.CssClasses.IS_VISIBLE);
    if (event.type === 'mousedown' && this.ignoringMouseDown) {
      this.ignoringMouseDown = false;
    } else {
      if (event.type === 'touchstart') {
        this.ignoringMouseDown = true;
      }
      var frameCount = this.getFrameCount();
      if (frameCount > 0) {
        return;
      }
      this.setFrameCount(1);
      const bound = event.target.getBoundingClientRect();
      let x: number;
      let y: number;
      // Check if we are handling a keyboard click.
      if (event.clientX === 0 && event.clientY === 0) {
        x = Math.round(bound.width / 2);
        y = Math.round(bound.height / 2);
      } else {
        var clientX = event.clientX ? event.clientX : event.touches[0].clientX;
        var clientY = event.clientY ? event.clientY : event.touches[0].clientY;
        x = Math.round(clientX - bound.left);
        y = Math.round(clientY - bound.top);
      }
      this.setRippleXY(x, y);
      this.setRippleStyles(true);
      window.requestAnimationFrame(this.animFrameHandler.bind(this));
    }
  };

  setRippleStyles(start: boolean) {
    if (this.rippleElement !== null) {
      let transformString: string;
      let scale: string;
      let size: string;
      let offset = 'translate(' + this.x + 'px, ' + this.y + 'px)';

      if (start) {
        scale = this.Constant.INITIAL_SCALE;
        size = this.Constant.INITIAL_SIZE;
      } else {
        scale = this.Constant.FINAL_SCALE;
        size = this.rippleSize + 'px';
      }

      transformString = 'translate(-50%, -50%) ' + offset + scale;

      this.rippleElement.style.webkitTransform = transformString;
      this.rippleElement.style.msTransform = transformString;
      this.rippleElement.style.transform = transformString;

      if (start) {
        this.rippleElement.classList.remove(this.CssClasses.IS_ANIMATING);
      } else {
        this.rippleElement.classList.add(this.CssClasses.IS_ANIMATING);
      }
    }
  };

  animFrameHandler() {
    if (this.frameCount-- > 0) {
      window.requestAnimationFrame(this.animFrameHandler.bind(this));
    } else {
      this.setRippleStyles(false);
    }
  }

  trigger(event: any) {
    if (!this.rippleElement.style.width && !this.rippleElement.style.height) {
      var rect = this.element.getBoundingClientRect();
      this.boundHeight = rect.height;
      this.boundWidth = rect.width;
      this.rippleSize = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2 + 2;
      this.rippleElement.style.width = this.rippleSize + 'px';
      this.rippleElement.style.height = this.rippleSize + 'px';
    }

    this.rippleElement.classList.add(this.CssClasses.IS_VISIBLE);

    if (event.type === 'mousedown' && this.ignoringMouseDown) {
      this.ignoringMouseDown = false;
    } else {
      if (event.type === 'touchstart') {
        this.ignoringMouseDown = true;
      }
      var frameCount = this.getFrameCount();
      if (frameCount > 0) {
        return;
      }
      this.setFrameCount(1);
      const bound = event.target.getBoundingClientRect();
      let x: number;
      let y: number;
      // Check if we are handling a keyboard click.
      if (event.clientX === 0 && event.clientY === 0) {
        x = Math.round(bound.width / 2);
        y = Math.round(bound.height / 2);
      } else {
        var clientX = event.clientX ? event.clientX : event.touches[0].clientX;
        var clientY = event.clientY ? event.clientY : event.touches[0].clientY;
        x = Math.round(clientX - bound.left);
        y = Math.round(clientY - bound.top);
      }
      this.setRippleXY(x, y);
      this.setRippleStyles(true);
      window.requestAnimationFrame(this.animFrameHandler.bind(this));
    }
  }

  destroy = function() {
    this.element.removeEventListener('mousedown', this.boundDownHandler);
    this.element.removeEventListener('touchstart', this.boundDownHandler);
    this.element.removeEventListener('mouseup', this.boundUpHandler);
    this.element.removeEventListener('mouseleave', this.boundUpHandler);
    this.element.removeEventListener('touchend', this.boundUpHandler);
    this.element.removeEventListener('blur', this.boundUpHandler);
  };
}

export function trigger(el: HTMLElement, e: Event): Q.Promise<void> {

  const d = Q.defer<void>();

  const ripple = new MaterialRipple(el);

  const rippleDom = el.querySelector('.mdl-ripple');

  const transitionend = 'WebkitTransition' in document.body.style ? 'webkitTransitionEnd' : 'transitionend';

  rippleDom.addEventListener(transitionend, () => {

    d.resolve(null);

  });

  ripple.trigger(e);

  return d.promise;
}
