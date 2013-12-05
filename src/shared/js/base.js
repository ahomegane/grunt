;(function(window, document, undefined) {

  window._ptl = window._ptl || {};

  _ptl.device = (function () {
    var userAgent = window.navigator.userAgent.toLowerCase();
    var deviceType = {
      iphone:       false,
      android:      false,
      windowsphone: false,
      ipad:         false,
      androidtab:   false,
      windows8:     false,
      pc:           false
    }
    
    if ((userAgent.indexOf('iphone') > -1 && userAgent.indexOf('ipad') == -1) || userAgent.indexOf('ipod') > -1) {
      deviceType.iphone = true; //iPhone&iPod
    } else if (userAgent.indexOf('android') > -1 && userAgent.indexOf('mobile') > -1) {
      deviceType.android = true; //AndroidMobile(一部のタブレット型アンドロイドを含む)
    } else if (userAgent.indexOf('windows phone') > -1) {
      deviceType.windowsphone = true; //WindowsPhone
    } else if (userAgent.indexOf('ipad') > -1) {
      deviceType.ipad = true; //iPad
    } else if (userAgent.indexOf('android') > -1) {
      deviceType.androidtab = true; //AndroidTablet
    } else if (/win(dows )?nt 6\.2/.test(userAgent)) {
      deviceType.windows8 = true; //windows8
    } else {
      deviceType.pc = true; //PC
    }
    return deviceType;
  })();

  _ptl.browser = (function () {
    var userAgent = window.navigator.userAgent.toLowerCase();
    var ieVersion = +userAgent.replace(/^.*msie\s?(\d+?)\.?\d*?;.*$/, '$1');
    var browserType = {
      lteIe6:  false,
      lteIe7:  false,
      lteIe8:  false,
      lteIe9:  false,
      ie:      false,
      ie6:     false,
      ie7:     false,
      ie8:     false,
      ie9:     false,
      ie10:    false,
      gtIe10:  false,
      firefox: false,
      opera:   false,
      chrome:  false,
      safari:  false,
      other:   false
    }

    if (ieVersion < 7) {
      browserType.lteIe6 = true;
      browserType.lteIe7 = true;
      browserType.lteIe8 = true;
      browserType.lteIe9 = true;
    } else if (ieVersion < 8) {
      browserType.lteIe7 = true;
      browserType.lteIe8 = true;
      browserType.lteIe9 = true;
    } else if (ieVersion < 9) {
      browserType.lteIe8 = true;
      browserType.lteIe9 = true;
    } else if (ieVersion < 10) {
      browserType.lteIe9 = true;
    }

    if (userAgent.indexOf('msie') > -1) {
      browserType.ie = true;
      if (ieVersion == 6) {
        browserType.ie6 = true;
      } else if (ieVersion == 7) {
        browserType.ie7 = true;
      } else if (ieVersion == 8) {
        browserType.ie8 = true;
      } else if (ieVersion == 9) {
        browserType.ie9 = true;
      } else if (ieVersion == 10) {
        browserType.ie10 = true;
      } else if (ieVersion > 10) {
        browserType.gtIe10 = true;
      }
    } else if (userAgent.indexOf('firefox') > -1) {
      browserType.firefox = true;
    } else if (userAgent.indexOf('opera') > -1) {
      browserType.opera = true;
    } else if (userAgent.indexOf('chrome') > -1 || userAgent.indexOf('crios') > -1) {
      browserType.chrome = true;
    } else if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') == -1) {
      browserType.safari = true;
    } else {
      browserType.other = true;
    }
    return browserType;
  })();

  _ptl.prefix = (function() {
    var prefix;
    if(_ptl.browser.safari || _ptl.browser.chrome) prefix = '-webkit-';      
    if(_ptl.browser.firefox) prefix = '-moz-';
    if(_ptl.browser.opera) prefix = '-o-';
    if(_ptl.browser.ie) prefix = '-ms-';
    return prefix;
  })();

  _ptl.support = {

    touch: 'ontouchstart' in window,

    canTouch: 'ontouchstart' in window || 'onmspointerover' in window,

    transition: (function() {
      var prop = [
        'webkitTransitionProperty',
        'MozTransitionProperty',
        'mozTransitionProperty',
        'msTransitionProperty',
        'oTransitionProperty',
        'transitionProperty'
      ];
      var div = document.createElement('div');
      for (var i = 0, l = prop.length; i < l; i++) {
        if(div.style[prop[i]] !== undefined){
          return true;
        }
      }
      return false;
    })(),

    standalone: navigator.standalone ? true : false

  };

})(window, document);

;(function(window, document, $, undefined) {

  window._ptl = window._ptl || {};

  var prefix = _ptl.prefix,
      prefixShort = prefix.replace(/\-/g, '');

  /* extend jquery : transfrom helper */
  ;(function() {

    var extend = {

      getTransform: function() {
        var matrix = this.css('transform').replace(/matrix\((.*)\)/, '$1').split(',');
        return {
          translateX: +matrix[4],
          translateY: +matrix[5]
        }
      }

    }

    $.extend($.fn, extend);

  })();

  /* extend jquery : transition helper */
  ;(function() {

    var fixProp = {
      transitionEnd: (function() {
        if (prefixShort == 'moz') return 'transitionend';
        return prefixShort + 'TransitionEnd';
      })()
    };

    var util = {

      addPrefix: function(prop) {
        var target = [
          'transform',
          'perspective'
        ];
        for (var i = 0, l = target.length; i < l; i++) {
          if (prop == target[i]) return prefix + prop;
        }
        return prop;
      },

      makeReg: function(target) {
        return new RegExp('\\b' +  target + ' .+?(, |$)\\b', 'g')
      },

      toHyphen: function(camelCase) {
        return camelCase.replace(/([a-z]|\d)([A-Z])/g, '$1-$2').toLowerCase();
      }

    }

    $.extend($, {
      isTransitionEndTarget: function(e, prop) {
        var name = e.originalEvent.propertyName;        
        if (name == prop || name == prefix + prop) return true;
        return false;
      }
    });

    var extend = {

      addTransition: function(options) {
        options = options || {};                
        var target = options.target,
            css = options.css,
            time = options.time ? ' ' + (options.time / 1000) + 's' : ' ' + (400 / 1000) + 's',
            ease = options.ease ? ' ' + options.ease : ' ' + 'linear',//ease: linear/ease/ease-in/ease-out/ease-in-out/cubic-bezier(num, num, num, num)
            delay = options.delay ? ' ' + (options.delay / 1000) + 's' : '',
            transitionEnd = options.transitionEnd;

        var value = this.css('transition');
        value = value.replace(util.makeReg('all 0s'), '');

        if (target) {
          if (typeof target == 'string') target = [target];
          for (var i = 0, l = target.length; i < l; i++) {
            if (value != '') value += ', ';
            value = value.replace(util.makeReg(target[i]), '');
            value += util.addPrefix(target[i]) + time + ease + delay;
          }
        } else {
          for (var target in css) {
            if (value != '') value += ', ';
            value = value.replace(util.makeReg(target), '');
            value += util.addPrefix(target) + time + ease + delay;
          }
        }
        
        this.css('transition', util.toHyphen(value));

        setTimeout($.proxy(function() {
          if (transitionEnd) this.on(fixProp.transitionEnd, transitionEnd);
          if (css) this.css(css);
        }, this), 0);

        return this;
      },

      removeTransition: function(options) {
        options = options || {};
        var target = options.target;
            css = options.css;

        if (target || css) {
          var value = this.css('transition');
          value = value.replace(util.makeReg('all 0s'), '');

          if (target) {
            if (typeof target == 'string') target = [target];
            for (var i = 0, l = target.length; i < l; i++) {
              value = value.replace(util.makeReg(target[i]), '');
            }
          } else {
            for (var target in css) {
              value = value.replace(util.makeReg(target), '');
            }
          }
          this.css('transition', util.toHyphen(value));

        } else {
          this.css('transition', '');
        }
        return this;
      },

      onTransitionEnd: function(callback) {
        this.on(fixProp.transitionEnd, callback);
        return this;
      },

      offTransitionEnd: function(callback) {
        this.off(fixProp.transitionEnd, callback);
        return this;
      },

      oneTransitionEnd: function(prop, callback) {
        var one = function(e) {
          if (! $.isTransitionEndTarget(e, util.toHyphen(prop))) return;
          callback(e);
          $(this).offTransitionEnd(one);
        };
        this.onTransitionEnd(one);
      }

    };

    $.extend($.fn, extend);

  })();

  /* extend jquery : transition */
  var supportTransition = _ptl.support.transition;

  ;(function() {

    // jquery easing extend
    jQuery.extend( jQuery.easing, {
      ease: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 * ((--t)*(t-2) - 1) + b;
      },
      easeIn: function (x, t, b, c, d) {
        return c*(t/=d)*t + b;
      },
      easeOut: function (x, t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
      },
      easeInOut: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 * ((--t)*(t-2) - 1) + b;
      }
    });

    var util = {

      toCamel: function(hyphen) {
        if (! hyphen) return hyphen;
        var camel = hyphen.replace(/\-./g, function (matched) {
            return matched.charAt(1).toUpperCase();
        });
        return camel;
      }

    }

    var extend = {

      transition: function() {
        var _this = this;

        var css = arguments[0];
        if (! css) return this.dequeue();

        var search = function(args, type) {
          for (var i in args) {
            if (i == 0) continue;
            if (typeof args[i] == type) return args[i];
          }
          return false;
        }
        var time = search(arguments, 'number') || 400,
            ease = search(arguments, 'string') || 'linear',
            callback = search(arguments, 'function');

        var render = function() {

          if (supportTransition) {
            var doAnimation = function() {
              var prop, i = 0;
              for (var key in css) {
                if (++i > 1) break;
                prop = key;
              }
              var complete = function() {
                if (callback) callback();
                _this.dequeue();
              }
              _this.addTransition({
                css: css,
                time: time,
                ease: ease
              })
              .oneTransitionEnd(prop, complete);
            }
            return _this.queue('fx', doAnimation);

          } else {
            return _this.animate(css, time, util.toCamel(ease), callback);
          }

        }   
        return render();
      }
    }

    $.extend($.fn, extend);

  })();

})(window, document, jQuery);