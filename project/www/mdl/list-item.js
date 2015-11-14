(function() {
  'use strict';

  var MaterialListItem = function MaterialListItem(element) {
    this.element_ = element;
    this.init();
  };

  window.MaterialListItem = MaterialListItem;

  MaterialListItem.prototype.Constant_ = {};

  MaterialListItem.prototype.CssClasses_ = {
    RIPPLE_EFFECT: 'mdl-js-ripple-effect',
    RIPPLE_CONTAINER: 'mdl-list__item__ripple-container',
    RIPPLE: 'mdl-ripple'
  };

  MaterialListItem.prototype.blurHandler_ = function(event) {
    if (event) {
      this.element_.blur();
    }
  };

  MaterialListItem.prototype.disable = function() {
    this.element_.disabled = true;
  };

  MaterialListItem.prototype.enable = function() {
    this.element_.disabled = false;
  };

  MaterialListItem.prototype.init = function() {
    if (this.element_) {
        if (this.element_.classList.contains(this.CssClasses_.RIPPLE_EFFECT)) {
            var rippleContainer = document.createElement('span');
            rippleContainer.classList.add(this.CssClasses_.RIPPLE_CONTAINER);
            this.rippleElement_ = document.createElement('span');
            this.rippleElement_.classList.add(this.CssClasses_.RIPPLE);
            rippleContainer.appendChild(this.rippleElement_);
            this.boundRippleBlurHandler = this.blurHandler_.bind(this);
            this.rippleElement_.addEventListener('mouseup', this.boundRippleBlurHandler);
            this.element_.appendChild(rippleContainer);
        }
        this.boundListBlurHandler = this.blurHandler_.bind(this);
        this.element_.addEventListener('mouseup', this.boundListBlurHandler);
        this.element_.addEventListener('mouseleave', this.boundListBlurHandler);
    }
  };

  MaterialListItem.prototype.mdlDowngrade_ = function() {
    if (this.rippleElement_) {
      this.rippleElement_.removeEventListener('mouseup', this.boundRippleBlurHandler);
    }
    this.element_.removeEventListener('mouseup', this.boundListBlurHandler);
    this.element_.removeEventListener('mouseleave', this.boundListBlurHandler);
  };

  componentHandler.register({
    constructor: MaterialListItem,
    classAsString: 'MaterialListItem',
    cssClass: 'mdl-js-list__item',
    widget: true
  });
})();
