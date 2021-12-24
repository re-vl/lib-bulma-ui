/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/animejs/lib/anime.es.js":
/*!**********************************************!*\
  !*** ./node_modules/animejs/lib/anime.es.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*
 * anime.js v3.2.1
 * (c) 2020 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */

// Defaults

var defaultInstanceSettings = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};

var defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0
};

var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];

// Caching

var cache = {
  CSS: {},
  springs: {}
};

// Utils

function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

function applyArguments(func, args) {
  return func.apply(null, args);
}

var is = {
  arr: function (a) { return Array.isArray(a); },
  obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
  pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
  svg: function (a) { return a instanceof SVGElement; },
  inp: function (a) { return a instanceof HTMLInputElement; },
  dom: function (a) { return a.nodeType || is.svg(a); },
  str: function (a) { return typeof a === 'string'; },
  fnc: function (a) { return typeof a === 'function'; },
  und: function (a) { return typeof a === 'undefined'; },
  nil: function (a) { return is.und(a) || a === null; },
  hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
  rgb: function (a) { return /^rgb/.test(a); },
  hsl: function (a) { return /^hsl/.test(a); },
  col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
  key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; },
};

// Easings

function parseEasingParameters(string) {
  var match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration) {

  var params = parseEasingParameters(string);
  var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
  var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
  var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
  var velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
  var w0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  var a = 1;
  var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    var progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) { return t; }
    return 1 - progress;
  }

  function getDuration() {
    var cached = cache.springs[string];
    if (cached) { return cached; }
    var frame = 1/6;
    var elapsed = 0;
    var rest = 0;
    while(true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) { break; }
      } else {
        rest = 0;
      }
    }
    var duration = elapsed * frame * 1000;
    cache.springs[string] = duration;
    return duration;
  }

  return duration ? solver : getDuration;

}

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

function steps(steps) {
  if ( steps === void 0 ) steps = 10;

  return function (t) { return Math.ceil((minMax(t, 0.000001, 1)) * steps) * (1 / steps); };
}

// BezierEasing https://github.com/gre/bezier-easing

var bezier = (function () {

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
  function C(aA1)      { return 3.0 * aA1 }

  function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
  function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < 4; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) { return aGuessT; }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  function bezier(mX1, mY1, mX2, mY2) {

    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
    var sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {

      var intervalStart = 0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;

      var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;
      var initialSlope = getSlope(guessForT, mX1, mX2);

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }

    }

    return function (x) {
      if (mX1 === mY1 && mX2 === mY2) { return x; }
      if (x === 0 || x === 1) { return x; }
      return calcBezier(getTForX(x), mY1, mY2);
    }

  }

  return bezier;

})();

var penner = (function () {

  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

  var eases = { linear: function () { return function (t) { return t; }; } };

  var functionEasings = {
    Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
    Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
    Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
    Bounce: function () { return function (t) {
      var pow2, b = 4;
      while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
      return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
    }; },
    Elastic: function (amplitude, period) {
      if ( amplitude === void 0 ) amplitude = 1;
      if ( period === void 0 ) period = .5;

      var a = minMax(amplitude, 1, 10);
      var p = minMax(period, .1, 2);
      return function (t) {
        return (t === 0 || t === 1) ? t : 
          -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
      }
    }
  };

  var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

  baseEasings.forEach(function (name, i) {
    functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
  });

  Object.keys(functionEasings).forEach(function (name) {
    var easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;
    eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
    eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 
      1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
    eases['easeOutIn' + name] = function (a, b) { return function (t) { return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : 
      (easeIn(a, b)(t * 2 - 1) + 1) / 2; }; };
  });

  return eases;

})();

function parseEasings(easing, duration) {
  if (is.fnc(easing)) { return easing; }
  var name = easing.split('(')[0];
  var ease = penner[name];
  var args = parseEasingParameters(easing);
  switch (name) {
    case 'spring' : return spring(easing, duration);
    case 'cubicBezier' : return applyArguments(bezier, args);
    case 'steps' : return applyArguments(steps, args);
    default : return applyArguments(ease, args);
  }
}

// Strings

function selectString(str) {
  try {
    var nodes = document.querySelectorAll(str);
    return nodes;
  } catch(e) {
    return;
  }
}

// Arrays

function filterArray(arr, callback) {
  var len = arr.length;
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  var result = [];
  for (var i = 0; i < len; i++) {
    if (i in arr) {
      var val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}

function flattenArray(arr) {
  return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
}

function toArray(o) {
  if (is.arr(o)) { return o; }
  if (is.str(o)) { o = selectString(o) || o; }
  if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
  return [o];
}

function arrayContains(arr, val) {
  return arr.some(function (a) { return a === val; });
}

// Objects

function cloneObject(o) {
  var clone = {};
  for (var p in o) { clone[p] = o[p]; }
  return clone;
}

function replaceObjectProps(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
  return o;
}

function mergeObjects(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
  return o;
}

// Colors

function rgbToRgba(rgbValue) {
  var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
}

function hexToRgba(hexValue) {
  var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
  var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(rgb[1], 16);
  var g = parseInt(rgb[2], 16);
  var b = parseInt(rgb[3], 16);
  return ("rgba(" + r + "," + g + "," + b + ",1)");
}

function hslToRgba(hslValue) {
  var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  var h = parseInt(hsl[1], 10) / 360;
  var s = parseInt(hsl[2], 10) / 100;
  var l = parseInt(hsl[3], 10) / 100;
  var a = hsl[4] || 1;
  function hue2rgb(p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
  }
  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
}

function colorToRgb(val) {
  if (is.rgb(val)) { return rgbToRgba(val); }
  if (is.hex(val)) { return hexToRgba(val); }
  if (is.hsl(val)) { return hslToRgba(val); }
}

// Units

function getUnit(val) {
  var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
  if (split) { return split[1]; }
}

function getTransformUnit(propName) {
  if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
}

// Values

function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) { return val; }
  return val(animatable.target, animatable.id, animatable.total);
}

function getAttribute(el, prop) {
  return el.getAttribute(prop);
}

function convertPxToUnit(el, value, unit) {
  var valueUnit = getUnit(value);
  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
  var cached = cache.CSS[value + unit];
  if (!is.und(cached)) { return cached; }
  var baseline = 100;
  var tempEl = document.createElement(el.tagName);
  var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  var factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  var convertedUnit = factor * parseFloat(value);
  cache.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}

function getCSSValue(el, prop, unit) {
  if (prop in el.style) {
    var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}

function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (!is.nil(getAttribute(el, prop)) || (is.svg(el) && el[prop]))) { return 'attribute'; }
  if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
  if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
  if (el[prop] != null) { return 'object'; }
}

function getElementTransforms(el) {
  if (!is.dom(el)) { return; }
  var str = el.style.transform || '';
  var reg  = /(\w+)\(([^)]*)\)/g;
  var transforms = new Map();
  var m; while (m = reg.exec(str)) { transforms.set(m[1], m[2]); }
  return transforms;
}

function getTransformValue(el, propName, animatable, unit) {
  var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  var value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms['last'] = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}

function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case 'transform': return getTransformValue(target, propName, animatable, unit);
    case 'css': return getCSSValue(target, propName, unit);
    case 'attribute': return getAttribute(target, propName);
    default: return target[propName] || 0;
  }
}

function getRelativeValue(to, from) {
  var operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) { return to; }
  var u = getUnit(to) || 0;
  var x = parseFloat(from);
  var y = parseFloat(to.replace(operator[0], ''));
  switch (operator[0][0]) {
    case '+': return x + y + u;
    case '-': return x - y + u;
    case '*': return x * y + u;
  }
}

function validateValue(val, unit) {
  if (is.col(val)) { return colorToRgb(val); }
  if (/\s/g.test(val)) { return val; }
  var originalUnit = getUnit(val);
  var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) { return unitLess + unit; }
  return unitLess;
}

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, 'r');
}

function getRectLength(el) {
  return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
}

function getLineLength(el) {
  return getDistance(
    {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
    {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
  );
}

function getPolylineLength(el) {
  var points = el.points;
  var totalLength = 0;
  var previousPos;
  for (var i = 0 ; i < points.numberOfItems; i++) {
    var currentPos = points.getItem(i);
    if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
    previousPos = currentPos;
  }
  return totalLength;
}

function getPolygonLength(el) {
  var points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}

// Path animation

function getTotalLength(el) {
  if (el.getTotalLength) { return el.getTotalLength(); }
  switch(el.tagName.toLowerCase()) {
    case 'circle': return getCircleLength(el);
    case 'rect': return getRectLength(el);
    case 'line': return getLineLength(el);
    case 'polyline': return getPolylineLength(el);
    case 'polygon': return getPolygonLength(el);
  }
}

function setDashoffset(el) {
  var pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
}

// Motion path

function getParentSvgEl(el) {
  var parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) { break; }
    parentEl = parentEl.parentNode;
  }
  return parentEl;
}

function getParentSvg(pathEl, svgData) {
  var svg = svgData || {};
  var parentSvgEl = svg.el || getParentSvgEl(pathEl);
  var rect = parentSvgEl.getBoundingClientRect();
  var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  var width = rect.width;
  var height = rect.height;
  var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width,
    h: height,
    vW: viewBox[2],
    vH: viewBox[3]
  }
}

function getPath(path, percent) {
  var pathEl = is.str(path) ? selectString(path)[0] : path;
  var p = percent || 100;
  return function(property) {
    return {
      property: property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    }
  }
}

function getPathProgress(path, progress, isPathTargetInsideSVG) {
  function point(offset) {
    if ( offset === void 0 ) offset = 0;

    var l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }
  var svg = getParentSvg(path.el, path.svg);
  var p = point();
  var p0 = point(-1);
  var p1 = point(+1);
  var scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
  var scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
  switch (path.property) {
    case 'x': return (p.x - svg.x) * scaleX;
    case 'y': return (p.y - svg.y) * scaleY;
    case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
}

// Decompose value

function decomposeValue(val, unit) {
  // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
  // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: (is.str(val) || unit) ? value.split(rgx) : []
  }
}

// Animatables

function parseTargets(targets) {
  var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
  return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
}

function getAnimatables(targets) {
  var parsed = parseTargets(targets);
  return parsed.map(function (t, i) {
    return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
  });
}

// Properties

function normalizePropertyTweens(prop, tweenSettings) {
  var settings = cloneObject(tweenSettings);
  // Override duration if easing is a spring
  if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
  if (is.arr(prop)) {
    var l = prop.length;
    var isFromTo = (l === 2 && !is.obj(prop[0]));
    if (!isFromTo) {
      // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      prop = {value: prop};
    }
  }
  var propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function (v, i) {
    var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
    return obj;
  }).map(function (k) { return mergeObjects(k, settings); });
}


function flattenKeyframes(keyframes) {
  var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
  .reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
  var properties = {};
  var loop = function ( i ) {
    var propName = propertyNames[i];
    properties[propName] = keyframes.map(function (key) {
      var newKey = {};
      for (var p in key) {
        if (is.key(p)) {
          if (p == propName) { newKey.value = key[p]; }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  };

  for (var i = 0; i < propertyNames.length; i++) loop( i );
  return properties;
}

function getProperties(tweenSettings, params) {
  var properties = [];
  var keyframes = params.keyframes;
  if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
  for (var p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
}

// Tweens

function normalizeTweenValues(tween, animatable) {
  var t = {};
  for (var p in tween) {
    var value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(function (v) { return getFunctionValue(v, animatable); });
      if (value.length === 1) { value = value[0]; }
    }
    t[p] = value;
  }
  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}

function normalizeTweens(prop, animatable) {
  var previousTween;
  return prop.tweens.map(function (t) {
    var tween = normalizeTweenValues(t, animatable);
    var tweenValue = tween.value;
    var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    var toUnit = getUnit(to);
    var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    var previousValue = previousTween ? previousTween.to.original : originalValue;
    var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    var fromUnit = getUnit(from) || getUnit(originalValue);
    var unit = toUnit || fromUnit;
    if (is.und(to)) { to = previousValue; }
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isPathTargetInsideSVG = tween.isPath && is.svg(animatable.target);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) { tween.round = 1; }
    previousTween = tween;
    return tween;
  });
}

// Tween progress

var setProgressValue = {
  css: function (t, p, v) { return t.style[p] = v; },
  attribute: function (t, p, v) { return t.setAttribute(p, v); },
  object: function (t, p, v) { return t[p] = v; },
  transform: function (t, p, v, transforms, manual) {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      var str = '';
      transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
      t.style.transform = str;
    }
  }
};

// Set Value helper

function setTargetsValue(targets, properties) {
  var animatables = getAnimatables(targets);
  animatables.forEach(function (animatable) {
    for (var property in properties) {
      var value = getFunctionValue(properties[property], animatable);
      var target = animatable.target;
      var valueUnit = getUnit(value);
      var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      var unit = valueUnit || getUnit(originalValue);
      var to = getRelativeValue(validateValue(value, unit), originalValue);
      var animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
}

// Animations

function createAnimation(animatable, prop) {
  var animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    var tweens = normalizeTweens(prop, animatable);
    var lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    }
  }
}

function getAnimations(animatables, properties) {
  return filterArray(flattenArray(animatables.map(function (animatable) {
    return properties.map(function (prop) {
      return createAnimation(animatable, prop);
    });
  })), function (a) { return !is.und(a); });
}

// Create Instance

function getInstanceTimings(animations, tweenSettings) {
  var animLength = animations.length;
  var getTlOffset = function (anim) { return anim.timelineOffset ? anim.timelineOffset : 0; };
  var timings = {};
  timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
  timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
  timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
  return timings;
}

var instanceID = 0;

function createNewInstance(params) {
  var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  var properties = getProperties(tweenSettings, params);
  var animatables = getAnimatables(params.targets);
  var animations = getAnimations(animatables, properties);
  var timings = getInstanceTimings(animations, tweenSettings);
  var id = instanceID;
  instanceID++;
  return mergeObjects(instanceSettings, {
    id: id,
    children: [],
    animatables: animatables,
    animations: animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });
}

// Core

var activeInstances = [];

var engine = (function () {
  var raf;

  function play() {
    if (!raf && (!isDocumentHidden() || !anime.suspendWhenDocumentHidden) && activeInstances.length > 0) {
      raf = requestAnimationFrame(step);
    }
  }
  function step(t) {
    // memo on algorithm issue:
    // dangerous iteration over mutable `activeInstances`
    // (that collection may be updated from within callbacks of `tick`-ed animation instances)
    var activeInstancesLength = activeInstances.length;
    var i = 0;
    while (i < activeInstancesLength) {
      var activeInstance = activeInstances[i];
      if (!activeInstance.paused) {
        activeInstance.tick(t);
        i++;
      } else {
        activeInstances.splice(i, 1);
        activeInstancesLength--;
      }
    }
    raf = i > 0 ? requestAnimationFrame(step) : undefined;
  }

  function handleVisibilityChange() {
    if (!anime.suspendWhenDocumentHidden) { return; }

    if (isDocumentHidden()) {
      // suspend ticks
      raf = cancelAnimationFrame(raf);
    } else { // is back to active tab
      // first adjust animations to consider the time that ticks were suspended
      activeInstances.forEach(
        function (instance) { return instance ._onDocumentVisibility(); }
      );
      engine();
    }
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return play;
})();

function isDocumentHidden() {
  return !!document && document.hidden;
}

// Public Instance

function anime(params) {
  if ( params === void 0 ) params = {};


  var startTime = 0, lastTime = 0, now = 0;
  var children, childrenLength = 0;
  var resolve = null;

  function makePromise(instance) {
    var promise = window.Promise && new Promise(function (_resolve) { return resolve = _resolve; });
    instance.finished = promise;
    return promise;
  }

  var instance = createNewInstance(params);
  var promise = makePromise(instance);

  function toggleInstanceDirection() {
    var direction = instance.direction;
    if (direction !== 'alternate') {
      instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    instance.reversed = !instance.reversed;
    children.forEach(function (child) { return child.reversed = instance.reversed; });
  }

  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
  }

  function seekChild(time, child) {
    if (child) { child.seek(time - child.timelineOffset); }
  }

  function syncInstanceChildren(time) {
    if (!instance.reversePlayback) {
      for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i]); }
    } else {
      for (var i$1 = childrenLength; i$1--;) { seekChild(time, children[i$1]); }
    }
  }

  function setAnimationsProgress(insTime) {
    var i = 0;
    var animations = instance.animations;
    var animationsLength = animations.length;
    while (i < animationsLength) {
      var anim = animations[i];
      var animatable = anim.animatable;
      var tweens = anim.tweens;
      var tweenLength = tweens.length - 1;
      var tween = tweens[tweenLength];
      // Only check for keyframes if there is more than one tween
      if (tweenLength) { tween = filterArray(tweens, function (t) { return (insTime < t.end); })[0] || tween; }
      var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      var strings = tween.to.strings;
      var round = tween.round;
      var numbers = [];
      var toNumbersLength = tween.to.numbers.length;
      var progress = (void 0);
      for (var n = 0; n < toNumbersLength; n++) {
        var value = (void 0);
        var toNumber = tween.to.numbers[n];
        var fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + (eased * (toNumber - fromNumber));
        } else {
          value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // Manual Array.reduce for better performances
      var stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (var s = 0; s < stringsLength; s++) {
          var a = strings[s];
          var b = strings[s + 1];
          var n$1 = numbers[s];
          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + ' ';
            } else {
              progress += n$1 + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  function setCallback(cb) {
    if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
  }

  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }

  function setInstanceProgress(engineTime) {
    var insDuration = instance.duration;
    var insDelay = instance.delay;
    var insEndDelay = insDuration - instance.endDelay;
    var insTime = adjustTime(engineTime);
    instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
    instance.reversePlayback = insTime < instance.currentTime;
    if (children) { syncInstanceChildren(insTime); }
    if (!instance.began && instance.currentTime > 0) {
      instance.began = true;
      setCallback('begin');
    }
    if (!instance.loopBegan && instance.currentTime > 0) {
      instance.loopBegan = true;
      setCallback('loopBegin');
    }
    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }
    if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
      setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        setCallback('changeBegin');
      }
      setCallback('change');
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        setCallback('changeComplete');
      }
    }
    instance.currentTime = minMax(insTime, 0, insDuration);
    if (instance.began) { setCallback('update'); }
    if (engineTime >= insDuration) {
      lastTime = 0;
      countIteration();
      if (!instance.remaining) {
        instance.paused = true;
        if (!instance.completed) {
          instance.completed = true;
          setCallback('loopComplete');
          setCallback('complete');
          if (!instance.passThrough && 'Promise' in window) {
            resolve();
            promise = makePromise(instance);
          }
        }
      } else {
        startTime = now;
        setCallback('loopComplete');
        instance.loopBegan = false;
        if (instance.direction === 'alternate') {
          toggleInstanceDirection();
        }
      }
    }
  }

  instance.reset = function() {
    var direction = instance.direction;
    instance.passThrough = false;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === 'reverse';
    instance.remaining = instance.loop;
    children = instance.children;
    childrenLength = children.length;
    for (var i = childrenLength; i--;) { instance.children[i].reset(); }
    if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  };

  // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
  instance._onDocumentVisibility = resetTime;

  // Set Value helper

  instance.set = function(targets, properties) {
    setTargetsValue(targets, properties);
    return instance;
  };

  instance.tick = function(t) {
    now = t;
    if (!startTime) { startTime = now; }
    setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
  };

  instance.seek = function(time) {
    setInstanceProgress(adjustTime(time));
  };

  instance.pause = function() {
    instance.paused = true;
    resetTime();
  };

  instance.play = function() {
    if (!instance.paused) { return; }
    if (instance.completed) { instance.reset(); }
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    engine();
  };

  instance.reverse = function() {
    toggleInstanceDirection();
    instance.completed = instance.reversed ? false : true;
    resetTime();
  };

  instance.restart = function() {
    instance.reset();
    instance.play();
  };

  instance.remove = function(targets) {
    var targetsArray = parseTargets(targets);
    removeTargetsFromInstance(targetsArray, instance);
  };

  instance.reset();

  if (instance.autoplay) { instance.play(); }

  return instance;

}

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (var a = animations.length; a--;) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargetsFromInstance(targetsArray, instance) {
  var animations = instance.animations;
  var children = instance.children;
  removeTargetsFromAnimations(targetsArray, animations);
  for (var c = children.length; c--;) {
    var child = children[c];
    var childAnimations = child.animations;
    removeTargetsFromAnimations(targetsArray, childAnimations);
    if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
  }
  if (!animations.length && !children.length) { instance.pause(); }
}

function removeTargetsFromActiveInstances(targets) {
  var targetsArray = parseTargets(targets);
  for (var i = activeInstances.length; i--;) {
    var instance = activeInstances[i];
    removeTargetsFromInstance(targetsArray, instance);
  }
}

// Stagger helpers

function stagger(val, params) {
  if ( params === void 0 ) params = {};

  var direction = params.direction || 'normal';
  var easing = params.easing ? parseEasings(params.easing) : null;
  var grid = params.grid;
  var axis = params.axis;
  var fromIndex = params.from || 0;
  var fromFirst = fromIndex === 'first';
  var fromCenter = fromIndex === 'center';
  var fromLast = fromIndex === 'last';
  var isRange = is.arr(val);
  var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  var val2 = isRange ? parseFloat(val[1]) : 0;
  var unit = getUnit(isRange ? val[1] : val) || 0;
  var start = params.start || 0 + (isRange ? val1 : 0);
  var values = [];
  var maxValue = 0;
  return function (el, i, t) {
    if (fromFirst) { fromIndex = 0; }
    if (fromCenter) { fromIndex = (t - 1) / 2; }
    if (fromLast) { fromIndex = t - 1; }
    if (!values.length) {
      for (var index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
          var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
          var toX = index%grid[0];
          var toY = Math.floor(index/grid[0]);
          var distanceX = fromX - toX;
          var distanceY = fromY - toY;
          var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') { value = -distanceX; }
          if (axis === 'y') { value = -distanceY; }
          values.push(value);
        }
        maxValue = Math.max.apply(Math, values);
      }
      if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
      if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
    }
    var spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
  }
}

// Timeline

function timeline(params) {
  if ( params === void 0 ) params = {};

  var tl = anime(params);
  tl.duration = 0;
  tl.add = function(instanceParams, timelineOffset) {
    var tlIndex = activeInstances.indexOf(tl);
    var children = tl.children;
    if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
    function passThrough(ins) { ins.passThrough = true; }
    for (var i = 0; i < children.length; i++) { passThrough(children[i]); }
    var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    var tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    var ins = anime(insParams);
    passThrough(ins);
    children.push(ins);
    var timings = getInstanceTimings(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();
    if (tl.autoplay) { tl.play(); }
    return tl;
  };
  return tl;
}

anime.version = '3.2.1';
anime.speed = 1;
// TODO:#review: naming, documentation
anime.suspendWhenDocumentHidden = true;
anime.running = activeInstances;
anime.remove = removeTargetsFromActiveInstances;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (anime);


/***/ }),

/***/ "./src/js/lib/components/accordion.js":
/*!********************************************!*\
  !*** ./src/js/lib/components/accordion.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
/* harmony import */ var animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! animejs/lib/anime.es.js */ "./node_modules/animejs/lib/anime.es.js");



_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.accordion = function () {
  for (let i = 0; i < this.length; i++) {
    //получаем элементы и заносим в массивы
    const headers = Array.from((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).find(".accordion-header")),
          contents = Array.from((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).find(".accordion-content")),
          inner = Array.from((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).find(".accordion-content .accordion-inner")),
          icons = Array.from((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).find(".accordion-header .icon")); //устанавливаем доп стили на выпадающий элемент

    contents.forEach(content => {
      content.style.cssText = "overflow: hidden; max-height: auto; margin: 0; padding: 0 32px";
    }); //перебираем заголовки навещиваем слушатель клика на заголовок

    headers.forEach((header, j) => {
      header.addEventListener("click", () => {
        header.classList.toggle("has-text-info"); //проверяем скрыт ли внутрунний выпадающий элемент

        if (inner[j].classList.contains("is-hidden")) {
          animeAccordion(inner[j], contents[j], "down"); //анимируем открытие элемента

          animeAccordion(icons[j], "", "", [0, 180]); //анимируем разворот индикатоар
        } else {
          animeAccordion(inner[j], contents[j], "up"); //анимируем закрытие элемента

          animeAccordion(icons[j], "", "", [180, 360]); //анимируем разворот индикатоар
        }
      });
    });

    function animeAccordion(target, content, dir, angel) {
      const duration = 400;
      let maxHeight, py, mb; //проверяем направление движения элемента

      if (dir == "down") {
        target.classList.toggle("is-hidden"); //переключаем на видимость

        maxHeight = ["0px", `${(0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(target)[0].scrollHeight + "px"}`]; //задаем нач и конечную высоту элемента

        py = "32px"; //задаем отступы по вертикали внутри

        mb = "32px"; //задаем отступ снизу снаружи
      } else if (dir == "up") {
        maxHeight = [`${(0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(target)[0].scrollHeight + "px"}`, "0px"]; //задаем нач и конечную высоту элемента

        py = "0px"; //обнуляем отступы по вертикали внутри

        mb = "0px"; //обнуляем отступ по вертикали снизу снаружи

        setTimeout(() => {
          target.classList.toggle("is-hidden");
        }, duration); //убираем видимость по завершении анимации
      }

      if (!angel) {
        //анимируем движение элемента
        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
          targets: target,
          duration: duration,
          maxHeight: maxHeight,
          easing: "linear"
        }); //анимируем стилизацию

        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
          targets: content,
          duration: duration,
          paddingTop: py,
          paddingBottom: py,
          marginBottom: mb,
          easing: "linear"
        });
      } //анимируем поворот стрелки


      if (angel) {
        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
          targets: target,
          duration: duration,
          rotateZ: angel,
          easing: "easeInOutSine"
        });
      }
    }
  }
};

(0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(".accordion").accordion();

/***/ }),

/***/ "./src/js/lib/components/burger.js":
/*!*****************************************!*\
  !*** ./src/js/lib/components/burger.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
/* harmony import */ var animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! animejs/lib/anime.es.js */ "./node_modules/animejs/lib/anime.es.js");



_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.burger = function () {
  for (let i = 0; i < this.length; i++) {
    //проверяем меню на прозрачность
    const transparent = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).closest(".navbar")[0].classList.contains("is-transparent"); //получаем выпадающее меню

    const navMenuBurger = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).getAttrib("data-target")); //получаем ссылки из выпадающего меню

    const burgerLinks = Array.from((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).getAttrib("data-target")).find(".navbar-item")); //задаем стили и устанавливаем выпадающее меню в начальную позицию

    navMenuBurger[0].style.cssText = "position: absolute; width: 100%; transform: translateY(-50%) scaleY(0);";
    (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).click(e => {
      //получаем nav и событие
      const nav = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).closest(".navbar");
      const targetBurger = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(e.target);
      hideShowHandler(targetBurger, navMenuBurger, nav, transparent);
    });
    burgerLinks.forEach(link => {
      link.addEventListener("click", () => {
        const nav = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).closest(".navbar");
        const targetBurger = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]);
        hideShowHandler(targetBurger, navMenuBurger, nav, transparent);
      });
    });
  }

  function hideShowHandler(targetBurger, navMenuBurger, nav, transparent) {
    if (!targetBurger[0].classList.contains("is-active")) {
      targetBurger.addClass("is-active"); //активируем кнопку бургер

      navMenuBurger.addClass("is-active"); //активируем меню бургер

      if (transparent) nav.removeClass("is-transparent"); //снимаем прозрачность с меню

      animeBurger(navMenuBurger[0], ["-50%", 0], 1, () => {});
    } else {
      animeBurger(navMenuBurger[0], [0, "-50%"], 0, () => {
        targetBurger.removeClass("is-active"); //деактивируем кнопку бургер

        navMenuBurger.removeClass("is-active"); //деактивируем меню бургер

        if (transparent) nav.addClass("is-transparent"); //устанавливаем прозрачность меню
      });
    }
  }

  function animeBurger(target, translateY, scaleY, callback) {
    const duration = 500;
    (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
      targets: target,
      duration: duration,
      translateY: translateY,
      scaleY: scaleY,
      easing: "easeInOutSine"
    });
    setTimeout(() => {
      callback();
    }, duration);
  }
};

(0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(".navbar-burger").burger();

/***/ }),

/***/ "./src/js/lib/components/dropdown.js":
/*!*******************************************!*\
  !*** ./src/js/lib/components/dropdown.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
/* harmony import */ var animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! animejs/lib/anime.es.js */ "./node_modules/animejs/lib/anime.es.js");



_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.dropdown = function () {
  for (let i = 0; i < this.length; i++) {
    const dropItem = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]),
          dropContent = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(dropItem[0]).find(".dropdown-content")[0]; //устанавливаем выпадающее меню в начальную позицию

    dropContent.style.transform = "translateY(-50%) scaleY(0)";
    (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[i]).click(() => {
      if (!dropItem[0].classList.contains("is-active")) {
        dropItem.addClass("is-active"); //активируем меню дропдавн

        animeDrop(dropContent, ["-50%", 0], 1, () => {});
      } else {
        animeDrop(dropContent, [0, "-50%"], 0, () => {
          dropItem.removeClass("is-active"); //деактивируем меню дропдавн
        });
      }
    });
  }

  function animeDrop(target, translateY, scaleY, callback) {
    const duration = 500;
    (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
      targets: target,
      duration: duration,
      translateY: translateY,
      scaleY: scaleY,
      easing: "easeInOutSine"
    });
    setTimeout(() => {
      callback();
    }, duration);
  }
};

(0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])("#dropdown-1").dropdown();

/***/ }),

/***/ "./src/js/lib/components/helpers/addCSSRule.js":
/*!*****************************************************!*\
  !*** ./src/js/lib/components/helpers/addCSSRule.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addCSSRule": () => (/* binding */ addCSSRule)
/* harmony export */ });
/* harmony import */ var _raf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./raf.js */ "./src/js/lib/components/helpers/raf.js");
// cross browsers addRule method

function addCSSRule(sheet, selector, rules, index) {
  // return raf(function() {
  'insertRule' in sheet ? sheet.insertRule(selector + '{' + rules + '}', index) : sheet.addRule(selector, rules, index); // });
}

/***/ }),

/***/ "./src/js/lib/components/helpers/addClass.js":
/*!***************************************************!*\
  !*** ./src/js/lib/components/helpers/addClass.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addClass": () => (/* binding */ addClass)
/* harmony export */ });
/* harmony import */ var _hasClass_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./hasClass.js */ "./src/js/lib/components/helpers/hasClass.js");

var addClass = _hasClass_js__WEBPACK_IMPORTED_MODULE_0__.classListSupport ? function (el, str) {
  if (!(0,_hasClass_js__WEBPACK_IMPORTED_MODULE_0__.hasClass)(el, str)) {
    el.classList.add(str);
  }
} : function (el, str) {
  if (!(0,_hasClass_js__WEBPACK_IMPORTED_MODULE_0__.hasClass)(el, str)) {
    el.className += ' ' + str;
  }
};


/***/ }),

/***/ "./src/js/lib/components/helpers/addEvents.js":
/*!****************************************************!*\
  !*** ./src/js/lib/components/helpers/addEvents.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addEvents": () => (/* binding */ addEvents)
/* harmony export */ });
/* harmony import */ var _passiveOption_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./passiveOption.js */ "./src/js/lib/components/helpers/passiveOption.js");

function addEvents(el, obj, preventScrolling) {
  for (var prop in obj) {
    var option = ['touchstart', 'touchmove'].indexOf(prop) >= 0 && !preventScrolling ? _passiveOption_js__WEBPACK_IMPORTED_MODULE_0__.passiveOption : false;
    el.addEventListener(prop, obj[prop], option);
  }
}

/***/ }),

/***/ "./src/js/lib/components/helpers/arrayFromNodeList.js":
/*!************************************************************!*\
  !*** ./src/js/lib/components/helpers/arrayFromNodeList.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "arrayFromNodeList": () => (/* binding */ arrayFromNodeList)
/* harmony export */ });
function arrayFromNodeList(nl) {
  var arr = [];

  for (var i = 0, l = nl.length; i < l; i++) {
    arr.push(nl[i]);
  }

  return arr;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/caf.js":
/*!**********************************************!*\
  !*** ./src/js/lib/components/helpers/caf.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "caf": () => (/* binding */ caf)
/* harmony export */ });
var win = window;
var caf = win.cancelAnimationFrame || win.mozCancelAnimationFrame || function (id) {
  clearTimeout(id);
};

/***/ }),

/***/ "./src/js/lib/components/helpers/calc.js":
/*!***********************************************!*\
  !*** ./src/js/lib/components/helpers/calc.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "calc": () => (/* binding */ calc)
/* harmony export */ });
/* harmony import */ var _getBody_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getBody.js */ "./src/js/lib/components/helpers/getBody.js");
/* harmony import */ var _setFakeBody_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./setFakeBody.js */ "./src/js/lib/components/helpers/setFakeBody.js");
/* harmony import */ var _resetFakeBody_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resetFakeBody.js */ "./src/js/lib/components/helpers/resetFakeBody.js");
// get css-calc 
// @return - false | calc | -webkit-calc | -moz-calc
// @usage - var calc = getCalc(); 



function calc() {
  var doc = document,
      body = (0,_getBody_js__WEBPACK_IMPORTED_MODULE_0__.getBody)(),
      docOverflow = (0,_setFakeBody_js__WEBPACK_IMPORTED_MODULE_1__.setFakeBody)(body),
      div = doc.createElement('div'),
      result = false;
  body.appendChild(div);

  try {
    var str = '(10px * 10)',
        vals = ['calc' + str, '-moz-calc' + str, '-webkit-calc' + str],
        val;

    for (var i = 0; i < 3; i++) {
      val = vals[i];
      div.style.width = val;

      if (div.offsetWidth === 100) {
        result = val.replace(str, '');
        break;
      }
    }
  } catch (e) {}

  body.fake ? (0,_resetFakeBody_js__WEBPACK_IMPORTED_MODULE_2__.resetFakeBody)(body, docOverflow) : div.remove();
  return result;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/checkStorageValue.js":
/*!************************************************************!*\
  !*** ./src/js/lib/components/helpers/checkStorageValue.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "checkStorageValue": () => (/* binding */ checkStorageValue)
/* harmony export */ });
function checkStorageValue(value) {
  return ['true', 'false'].indexOf(value) >= 0 ? JSON.parse(value) : value;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/classListSupport.js":
/*!***********************************************************!*\
  !*** ./src/js/lib/components/helpers/classListSupport.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "classListSupport": () => (/* binding */ classListSupport)
/* harmony export */ });
var classListSupport = ('classList' in document.createElement('_'));

/***/ }),

/***/ "./src/js/lib/components/helpers/createStyleSheet.js":
/*!***********************************************************!*\
  !*** ./src/js/lib/components/helpers/createStyleSheet.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createStyleSheet": () => (/* binding */ createStyleSheet)
/* harmony export */ });
// create and append style sheet
function createStyleSheet(media, nonce) {
  // Create the <style> tag
  var style = document.createElement("style"); // style.setAttribute("type", "text/css");
  // Add a media (and/or media query) here if you'd like!
  // style.setAttribute("media", "screen")
  // style.setAttribute("media", "only screen and (max-width : 1024px)")

  if (media) {
    style.setAttribute("media", media);
  } // Add nonce attribute for Content Security Policy


  if (nonce) {
    style.setAttribute("nonce", nonce);
  } // WebKit hack :(
  // style.appendChild(document.createTextNode(""));
  // Add the <style> element to the page


  document.querySelector('head').appendChild(style);
  return style.sheet ? style.sheet : style.styleSheet;
}
;

/***/ }),

/***/ "./src/js/lib/components/helpers/docElement.js":
/*!*****************************************************!*\
  !*** ./src/js/lib/components/helpers/docElement.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "docElement": () => (/* binding */ docElement)
/* harmony export */ });
var docElement = document.documentElement;

/***/ }),

/***/ "./src/js/lib/components/helpers/events.js":
/*!*************************************************!*\
  !*** ./src/js/lib/components/helpers/events.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Events": () => (/* binding */ Events)
/* harmony export */ });
function Events() {
  return {
    topics: {},
    on: function (eventName, fn) {
      this.topics[eventName] = this.topics[eventName] || [];
      this.topics[eventName].push(fn);
    },
    off: function (eventName, fn) {
      if (this.topics[eventName]) {
        for (var i = 0; i < this.topics[eventName].length; i++) {
          if (this.topics[eventName][i] === fn) {
            this.topics[eventName].splice(i, 1);
            break;
          }
        }
      }
    },
    emit: function (eventName, data) {
      data.type = eventName;

      if (this.topics[eventName]) {
        this.topics[eventName].forEach(function (fn) {
          fn(data, eventName);
        });
      }
    }
  };
}
;

/***/ }),

/***/ "./src/js/lib/components/helpers/extend.js":
/*!*************************************************!*\
  !*** ./src/js/lib/components/helpers/extend.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "extend": () => (/* binding */ extend)
/* harmony export */ });
function extend() {
  var obj,
      name,
      copy,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length;

  for (; i < length; i++) {
    if ((obj = arguments[i]) !== null) {
      for (name in obj) {
        copy = obj[name];

        if (target === copy) {
          continue;
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  return target;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/forEach.js":
/*!**************************************************!*\
  !*** ./src/js/lib/components/helpers/forEach.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "forEach": () => (/* binding */ forEach)
/* harmony export */ });
// https://toddmotto.com/ditch-the-array-foreach-call-nodelist-hack/
function forEach(arr, callback, scope) {
  for (var i = 0, l = arr.length; i < l; i++) {
    callback.call(scope, arr[i], i);
  }
}

/***/ }),

/***/ "./src/js/lib/components/helpers/getAttr.js":
/*!**************************************************!*\
  !*** ./src/js/lib/components/helpers/getAttr.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getAttr": () => (/* binding */ getAttr)
/* harmony export */ });
function getAttr(el, attr) {
  return el.getAttribute(attr);
}

/***/ }),

/***/ "./src/js/lib/components/helpers/getBody.js":
/*!**************************************************!*\
  !*** ./src/js/lib/components/helpers/getBody.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getBody": () => (/* binding */ getBody)
/* harmony export */ });
function getBody() {
  var doc = document,
      body = doc.body;

  if (!body) {
    body = doc.createElement('body');
    body.fake = true;
  }

  return body;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/getCssRulesLength.js":
/*!************************************************************!*\
  !*** ./src/js/lib/components/helpers/getCssRulesLength.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getCssRulesLength": () => (/* binding */ getCssRulesLength)
/* harmony export */ });
function getCssRulesLength(sheet) {
  var rule = 'insertRule' in sheet ? sheet.cssRules : sheet.rules;
  return rule.length;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/getEndProperty.js":
/*!*********************************************************!*\
  !*** ./src/js/lib/components/helpers/getEndProperty.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getEndProperty": () => (/* binding */ getEndProperty)
/* harmony export */ });
// get transitionend, animationend based on transitionDuration
// @propin: string
// @propOut: string, first-letter uppercase
// Usage: getEndProperty('WebkitTransitionDuration', 'Transition') => webkitTransitionEnd
function getEndProperty(propIn, propOut) {
  var endProp = false;

  if (/^Webkit/.test(propIn)) {
    endProp = 'webkit' + propOut + 'End';
  } else if (/^O/.test(propIn)) {
    endProp = 'o' + propOut + 'End';
  } else if (propIn) {
    endProp = propOut.toLowerCase() + 'end';
  }

  return endProp;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/getSlideId.js":
/*!*****************************************************!*\
  !*** ./src/js/lib/components/helpers/getSlideId.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getSlideId": () => (/* binding */ getSlideId)
/* harmony export */ });
function getSlideId() {
  var id = window.tnsId;
  window.tnsId = !id ? 1 : id + 1;
  return 'tns' + window.tnsId;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/getTouchDirection.js":
/*!************************************************************!*\
  !*** ./src/js/lib/components/helpers/getTouchDirection.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getTouchDirection": () => (/* binding */ getTouchDirection)
/* harmony export */ });
function getTouchDirection(angle, range) {
  var direction = false,
      gap = Math.abs(90 - Math.abs(angle));

  if (gap >= 90 - range) {
    direction = 'horizontal';
  } else if (gap <= range) {
    direction = 'vertical';
  }

  return direction;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/has3DTransforms.js":
/*!**********************************************************!*\
  !*** ./src/js/lib/components/helpers/has3DTransforms.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "has3DTransforms": () => (/* binding */ has3DTransforms)
/* harmony export */ });
/* harmony import */ var _getBody_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getBody.js */ "./src/js/lib/components/helpers/getBody.js");
/* harmony import */ var _setFakeBody_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./setFakeBody.js */ "./src/js/lib/components/helpers/setFakeBody.js");
/* harmony import */ var _resetFakeBody_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resetFakeBody.js */ "./src/js/lib/components/helpers/resetFakeBody.js");



function has3DTransforms(tf) {
  if (!tf) {
    return false;
  }

  if (!window.getComputedStyle) {
    return false;
  }

  var doc = document,
      body = (0,_getBody_js__WEBPACK_IMPORTED_MODULE_0__.getBody)(),
      docOverflow = (0,_setFakeBody_js__WEBPACK_IMPORTED_MODULE_1__.setFakeBody)(body),
      el = doc.createElement('p'),
      has3d,
      cssTF = tf.length > 9 ? '-' + tf.slice(0, -9).toLowerCase() + '-' : '';
  cssTF += 'transform'; // Add it to the body to get the computed style

  body.insertBefore(el, null);
  el.style[tf] = 'translate3d(1px,1px,1px)';
  has3d = window.getComputedStyle(el).getPropertyValue(cssTF);
  body.fake ? (0,_resetFakeBody_js__WEBPACK_IMPORTED_MODULE_2__.resetFakeBody)(body, docOverflow) : el.remove();
  return has3d !== undefined && has3d.length > 0 && has3d !== "none";
}

/***/ }),

/***/ "./src/js/lib/components/helpers/hasAttr.js":
/*!**************************************************!*\
  !*** ./src/js/lib/components/helpers/hasAttr.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hasAttr": () => (/* binding */ hasAttr)
/* harmony export */ });
function hasAttr(el, attr) {
  return el.hasAttribute(attr);
}

/***/ }),

/***/ "./src/js/lib/components/helpers/hasClass.js":
/*!***************************************************!*\
  !*** ./src/js/lib/components/helpers/hasClass.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "classListSupport": () => (/* reexport safe */ _classListSupport_js__WEBPACK_IMPORTED_MODULE_0__.classListSupport),
/* harmony export */   "hasClass": () => (/* binding */ hasClass)
/* harmony export */ });
/* harmony import */ var _classListSupport_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./classListSupport.js */ "./src/js/lib/components/helpers/classListSupport.js");

var hasClass = _classListSupport_js__WEBPACK_IMPORTED_MODULE_0__.classListSupport ? function (el, str) {
  return el.classList.contains(str);
} : function (el, str) {
  return el.className.indexOf(str) >= 0;
};


/***/ }),

/***/ "./src/js/lib/components/helpers/hideElement.js":
/*!******************************************************!*\
  !*** ./src/js/lib/components/helpers/hideElement.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hideElement": () => (/* binding */ hideElement)
/* harmony export */ });
function hideElement(el, forceHide) {
  if (el.style.display !== 'none') {
    el.style.display = 'none';
  }
}

/***/ }),

/***/ "./src/js/lib/components/helpers/isNodeList.js":
/*!*****************************************************!*\
  !*** ./src/js/lib/components/helpers/isNodeList.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isNodeList": () => (/* binding */ isNodeList)
/* harmony export */ });
function isNodeList(el) {
  // Only NodeList has the "item()" function
  return typeof el.item !== "undefined";
}

/***/ }),

/***/ "./src/js/lib/components/helpers/isVisible.js":
/*!****************************************************!*\
  !*** ./src/js/lib/components/helpers/isVisible.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isVisible": () => (/* binding */ isVisible)
/* harmony export */ });
function isVisible(el) {
  return window.getComputedStyle(el).display !== 'none';
}

/***/ }),

/***/ "./src/js/lib/components/helpers/jsTransform.js":
/*!******************************************************!*\
  !*** ./src/js/lib/components/helpers/jsTransform.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "jsTransform": () => (/* binding */ jsTransform)
/* harmony export */ });
function jsTransform(element, attr, prefix, postfix, to, duration, callback) {
  var tick = Math.min(duration, 10),
      unit = to.indexOf('%') >= 0 ? '%' : 'px',
      to = to.replace(unit, ''),
      from = Number(element.style[attr].replace(prefix, '').replace(postfix, '').replace(unit, '')),
      positionTick = (to - from) / duration * tick,
      running;
  setTimeout(moveElement, tick);

  function moveElement() {
    duration -= tick;
    from += positionTick;
    element.style[attr] = prefix + from + unit + postfix;

    if (duration > 0) {
      setTimeout(moveElement, tick);
    } else {
      callback();
    }
  }
}

/***/ }),

/***/ "./src/js/lib/components/helpers/mediaquerySupport.js":
/*!************************************************************!*\
  !*** ./src/js/lib/components/helpers/mediaquerySupport.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mediaquerySupport": () => (/* binding */ mediaquerySupport)
/* harmony export */ });
/* harmony import */ var _getBody_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getBody.js */ "./src/js/lib/components/helpers/getBody.js");
/* harmony import */ var _setFakeBody_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./setFakeBody.js */ "./src/js/lib/components/helpers/setFakeBody.js");
/* harmony import */ var _resetFakeBody_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resetFakeBody.js */ "./src/js/lib/components/helpers/resetFakeBody.js");



function mediaquerySupport() {
  if (window.matchMedia || window.msMatchMedia) {
    return true;
  }

  var doc = document,
      body = (0,_getBody_js__WEBPACK_IMPORTED_MODULE_0__.getBody)(),
      docOverflow = (0,_setFakeBody_js__WEBPACK_IMPORTED_MODULE_1__.setFakeBody)(body),
      div = doc.createElement('div'),
      style = doc.createElement('style'),
      rule = '@media all and (min-width:1px){.tns-mq-test{position:absolute}}',
      position;
  style.type = 'text/css';
  div.className = 'tns-mq-test';
  body.appendChild(style);
  body.appendChild(div);

  if (style.styleSheet) {
    style.styleSheet.cssText = rule;
  } else {
    style.appendChild(doc.createTextNode(rule));
  }

  position = window.getComputedStyle ? window.getComputedStyle(div).position : div.currentStyle['position'];
  body.fake ? (0,_resetFakeBody_js__WEBPACK_IMPORTED_MODULE_2__.resetFakeBody)(body, docOverflow) : div.remove();
  return position === "absolute";
}

/***/ }),

/***/ "./src/js/lib/components/helpers/passiveOption.js":
/*!********************************************************!*\
  !*** ./src/js/lib/components/helpers/passiveOption.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "passiveOption": () => (/* binding */ passiveOption)
/* harmony export */ });
// Test via a getter in the options object to see if the passive property is accessed
var supportsPassive = false;

try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function () {
      supportsPassive = true;
    }
  });
  window.addEventListener("test", null, opts);
} catch (e) {}

var passiveOption = supportsPassive ? {
  passive: true
} : false;

/***/ }),

/***/ "./src/js/lib/components/helpers/percentageLayout.js":
/*!***********************************************************!*\
  !*** ./src/js/lib/components/helpers/percentageLayout.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "percentageLayout": () => (/* binding */ percentageLayout)
/* harmony export */ });
/* harmony import */ var _getBody_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getBody.js */ "./src/js/lib/components/helpers/getBody.js");
/* harmony import */ var _setFakeBody_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./setFakeBody.js */ "./src/js/lib/components/helpers/setFakeBody.js");
/* harmony import */ var _resetFakeBody_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resetFakeBody.js */ "./src/js/lib/components/helpers/resetFakeBody.js");
// get subpixel support value
// @return - boolean



function percentageLayout() {
  // check subpixel layout supporting
  var doc = document,
      body = (0,_getBody_js__WEBPACK_IMPORTED_MODULE_0__.getBody)(),
      docOverflow = (0,_setFakeBody_js__WEBPACK_IMPORTED_MODULE_1__.setFakeBody)(body),
      wrapper = doc.createElement('div'),
      outer = doc.createElement('div'),
      str = '',
      count = 70,
      perPage = 3,
      supported = false;
  wrapper.className = "tns-t-subp2";
  outer.className = "tns-t-ct";

  for (var i = 0; i < count; i++) {
    str += '<div></div>';
  }

  outer.innerHTML = str;
  wrapper.appendChild(outer);
  body.appendChild(wrapper);
  supported = Math.abs(wrapper.getBoundingClientRect().left - outer.children[count - perPage].getBoundingClientRect().left) < 2;
  body.fake ? (0,_resetFakeBody_js__WEBPACK_IMPORTED_MODULE_2__.resetFakeBody)(body, docOverflow) : wrapper.remove();
  return supported;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/raf.js":
/*!**********************************************!*\
  !*** ./src/js/lib/components/helpers/raf.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "raf": () => (/* binding */ raf)
/* harmony export */ });
var win = window;
var raf = win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.msRequestAnimationFrame || function (cb) {
  return setTimeout(cb, 16);
};

/***/ }),

/***/ "./src/js/lib/components/helpers/removeAttrs.js":
/*!******************************************************!*\
  !*** ./src/js/lib/components/helpers/removeAttrs.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "removeAttrs": () => (/* binding */ removeAttrs)
/* harmony export */ });
/* harmony import */ var _isNodeList_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isNodeList.js */ "./src/js/lib/components/helpers/isNodeList.js");

function removeAttrs(els, attrs) {
  els = (0,_isNodeList_js__WEBPACK_IMPORTED_MODULE_0__.isNodeList)(els) || els instanceof Array ? els : [els];
  attrs = attrs instanceof Array ? attrs : [attrs];
  var attrLength = attrs.length;

  for (var i = els.length; i--;) {
    for (var j = attrLength; j--;) {
      els[i].removeAttribute(attrs[j]);
    }
  }
}

/***/ }),

/***/ "./src/js/lib/components/helpers/removeCSSRule.js":
/*!********************************************************!*\
  !*** ./src/js/lib/components/helpers/removeCSSRule.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "removeCSSRule": () => (/* binding */ removeCSSRule)
/* harmony export */ });
/* harmony import */ var _raf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./raf.js */ "./src/js/lib/components/helpers/raf.js");
// cross browsers addRule method

function removeCSSRule(sheet, index) {
  // return raf(function() {
  'deleteRule' in sheet ? sheet.deleteRule(index) : sheet.removeRule(index); // });
}

/***/ }),

/***/ "./src/js/lib/components/helpers/removeClass.js":
/*!******************************************************!*\
  !*** ./src/js/lib/components/helpers/removeClass.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "removeClass": () => (/* binding */ removeClass)
/* harmony export */ });
/* harmony import */ var _hasClass_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./hasClass.js */ "./src/js/lib/components/helpers/hasClass.js");

var removeClass = _hasClass_js__WEBPACK_IMPORTED_MODULE_0__.classListSupport ? function (el, str) {
  if ((0,_hasClass_js__WEBPACK_IMPORTED_MODULE_0__.hasClass)(el, str)) {
    el.classList.remove(str);
  }
} : function (el, str) {
  if ((0,_hasClass_js__WEBPACK_IMPORTED_MODULE_0__.hasClass)(el, str)) {
    el.className = el.className.replace(str, '');
  }
};


/***/ }),

/***/ "./src/js/lib/components/helpers/removeEvents.js":
/*!*******************************************************!*\
  !*** ./src/js/lib/components/helpers/removeEvents.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "removeEvents": () => (/* binding */ removeEvents)
/* harmony export */ });
/* harmony import */ var _passiveOption_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./passiveOption.js */ "./src/js/lib/components/helpers/passiveOption.js");

function removeEvents(el, obj) {
  for (var prop in obj) {
    var option = ['touchstart', 'touchmove'].indexOf(prop) >= 0 ? _passiveOption_js__WEBPACK_IMPORTED_MODULE_0__.passiveOption : false;
    el.removeEventListener(prop, obj[prop], option);
  }
}

/***/ }),

/***/ "./src/js/lib/components/helpers/resetFakeBody.js":
/*!********************************************************!*\
  !*** ./src/js/lib/components/helpers/resetFakeBody.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "resetFakeBody": () => (/* binding */ resetFakeBody)
/* harmony export */ });
/* harmony import */ var _docElement_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./docElement.js */ "./src/js/lib/components/helpers/docElement.js");

function resetFakeBody(body, docOverflow) {
  if (body.fake) {
    body.remove();
    _docElement_js__WEBPACK_IMPORTED_MODULE_0__.docElement.style.overflow = docOverflow; // Trigger layout so kinetic scrolling isn't disabled in iOS6+
    // eslint-disable-next-line

    _docElement_js__WEBPACK_IMPORTED_MODULE_0__.docElement.offsetHeight;
  }
}

/***/ }),

/***/ "./src/js/lib/components/helpers/setAttrs.js":
/*!***************************************************!*\
  !*** ./src/js/lib/components/helpers/setAttrs.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setAttrs": () => (/* binding */ setAttrs)
/* harmony export */ });
/* harmony import */ var _isNodeList_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isNodeList.js */ "./src/js/lib/components/helpers/isNodeList.js");

function setAttrs(els, attrs) {
  els = (0,_isNodeList_js__WEBPACK_IMPORTED_MODULE_0__.isNodeList)(els) || els instanceof Array ? els : [els];

  if (Object.prototype.toString.call(attrs) !== '[object Object]') {
    return;
  }

  for (var i = els.length; i--;) {
    for (var key in attrs) {
      els[i].setAttribute(key, attrs[key]);
    }
  }
}

/***/ }),

/***/ "./src/js/lib/components/helpers/setFakeBody.js":
/*!******************************************************!*\
  !*** ./src/js/lib/components/helpers/setFakeBody.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setFakeBody": () => (/* binding */ setFakeBody)
/* harmony export */ });
/* harmony import */ var _docElement_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./docElement.js */ "./src/js/lib/components/helpers/docElement.js");

function setFakeBody(body) {
  var docOverflow = '';

  if (body.fake) {
    docOverflow = _docElement_js__WEBPACK_IMPORTED_MODULE_0__.docElement.style.overflow; //avoid crashing IE8, if background image is used

    body.style.background = ''; //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible

    body.style.overflow = _docElement_js__WEBPACK_IMPORTED_MODULE_0__.docElement.style.overflow = 'hidden';
    _docElement_js__WEBPACK_IMPORTED_MODULE_0__.docElement.appendChild(body);
  }

  return docOverflow;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/setLocalStorage.js":
/*!**********************************************************!*\
  !*** ./src/js/lib/components/helpers/setLocalStorage.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "setLocalStorage": () => (/* binding */ setLocalStorage)
/* harmony export */ });
function setLocalStorage(storage, key, value, access) {
  if (access) {
    try {
      storage.setItem(key, value);
    } catch (e) {}
  }

  return value;
}

/***/ }),

/***/ "./src/js/lib/components/helpers/showElement.js":
/*!******************************************************!*\
  !*** ./src/js/lib/components/helpers/showElement.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "showElement": () => (/* binding */ showElement)
/* harmony export */ });
function showElement(el, forceHide) {
  if (el.style.display === 'none') {
    el.style.display = '';
  }
}

/***/ }),

/***/ "./src/js/lib/components/helpers/toDegree.js":
/*!***************************************************!*\
  !*** ./src/js/lib/components/helpers/toDegree.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "toDegree": () => (/* binding */ toDegree)
/* harmony export */ });
function toDegree(y, x) {
  return Math.atan2(y, x) * (180 / Math.PI);
}

/***/ }),

/***/ "./src/js/lib/components/helpers/whichProperty.js":
/*!********************************************************!*\
  !*** ./src/js/lib/components/helpers/whichProperty.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "whichProperty": () => (/* binding */ whichProperty)
/* harmony export */ });
function whichProperty(props) {
  if (typeof props === 'string') {
    var arr = [props],
        Props = props.charAt(0).toUpperCase() + props.substr(1),
        prefixes = ['Webkit', 'Moz', 'ms', 'O'];
    prefixes.forEach(function (prefix) {
      if (prefix !== 'ms' || props === 'transform') {
        arr.push(prefix + Props);
      }
    });
    props = arr;
  }

  var el = document.createElement('fakeelement'),
      len = props.length;

  for (var i = 0; i < props.length; i++) {
    var prop = props[i];

    if (el.style[prop] !== undefined) {
      return prop;
    }
  }

  return false; // explicit for ie9-
}

/***/ }),

/***/ "./src/js/lib/components/modal.js":
/*!****************************************!*\
  !*** ./src/js/lib/components/modal.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
/* harmony import */ var _services_maskPhone_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../services/maskPhone.js */ "./src/js/lib/services/maskPhone.js");
/* harmony import */ var _services_just_validate_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/just-validate.js */ "./src/js/lib/services/just-validate.js");
/* harmony import */ var animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! animejs/lib/anime.es.js */ "./node_modules/animejs/lib/anime.es.js");





_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.modal = function () {
  const html = document.querySelector("html"),
        body = document.body,
        nav = document.querySelector("nav"); // рассчитываем ширину полосы скролла

  function calcScrool() {
    let div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "50px";
    div.style.overflowY = "scroll";
    div.style.visibility = "hidden";
    document.body.appendChild(div);
    let scrollWidth = div.offsetWidth - div.clientWidth;
    div.remove();
    return scrollWidth;
  }

  let scroll = calcScrool(); //перебираем модальные окна

  for (let i = 0; i < this.length; i++) {
    const dataTarget = this[i].getAttribute("data-target"),
          modalCont = document.querySelector(`${dataTarget} .modal-content`),
          thanksTarget = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(dataTarget).find("[data-thanks]")[0].getAttribute("data-target"),
          thanksCont = document.querySelector(`${thanksTarget} .modal-content`);
    let thanks = false,
        formValid = false;
    const duration = 500; // коррекция смещения при погашении полосы скролла

    const offsetCorrection = function () {
      html.classList.add("is-clipped");
      modalCont.style.transform = `translateX(${scroll / 2}px)`;
      thanksCont.style.transform = `translateX(${scroll / 2}px)`;
      body.style.marginRight = `${scroll}px`;
      nav.style.marginRight = `${scroll}px`;
    }; // при клике на кнопку с data-target показываем модальное окно


    if (dataTarget && !thanks) {
      this[i].addEventListener("click", e => {
        e.preventDefault();
        (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(dataTarget).addClass("is-active");
        animeModal((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(dataTarget)[0].querySelector(".modal-content"), (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(dataTarget)[0].querySelector(".modal-background"), 1);
        offsetCorrection();
      });
    } // открываем окно thanks


    function showThanks() {
      setTimeout(() => {
        (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(thanksTarget).addClass("is-active");
        animeModal((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(thanksTarget)[0].querySelector(".modal-content"), (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(thanksTarget)[0].querySelector(".modal-background"), 1);
        offsetCorrection();
        thanks = true;
      }, duration);
      setTimeout(() => {
        closeModal();
      }, duration * 15); //закрытие окна спасибо по таймауту
    } //обработка формы


    if (!thanks) {
      function validate(callback) {
        //выводим маску телефона в поле, и проводим валидацию
        (0,_services_maskPhone_js__WEBPACK_IMPORTED_MODULE_1__["default"])(`${dataTarget} [type="tel"]`); //валидация формы

        new window.JustValidate(`${dataTarget} form`, {
          rules: {
            //настройка параметров валидации
            email: {
              required: true,
              email: true
            },
            tel: {
              required: true
            },
            checkbox: {
              required: true
            }
          },
          submitHandler: function () {
            //обработчик кнопки подтверждения
            formValid = true; //отправляем форму если капчи нет

            if (!(0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(`${dataTarget} form .captcha`).length) {
              sendForm((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(`${dataTarget} form`)[0]);
            }
          }
        });
        callback();
      } //проверяем наличие капчи в форме


      if ((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(`${dataTarget} form .captcha`).length) {
        validate(captcha);
      } else {
        validate(() => {});
      }
    } //обновление картинки капчи


    const refreshCaptcha = target => {
      const captchaImage = target.closest(".captcha__image-reload").querySelector(".captcha__image");
      captchaImage.src = "/PHPcaptcha/captcha.php?r=" + new Date().getUTCMilliseconds();
    };

    const captchaBtn = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(modalCont).find(".captcha__refresh");
    captchaBtn.click(e => refreshCaptcha(e.target)); //обработка капчи

    function captcha() {
      const form = modalCont.querySelector(`form`); //получаем форму

      form.addEventListener("submit", e => {
        e.preventDefault();

        try {
          //запрос на сервер
          fetch("/PHPcaptcha/process-form.php", {
            method: "POST",
            body: new FormData(form)
          }).then(response => {
            //получаем ответ конвертируем json
            return response.json();
          }).then(data => {
            //получаем значение input если не прошли валидацию капчи
            const inpInv = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(modalCont).find("input.is-invalid");
            inpInv.removeClass("is-invalid"); //удаляем класс капчи не-валидно

            inpInv.siblings(".control").find(".fa-exclamation-triangle").addClass("is-hidden"); //скрываем индикатор предупреждения

            inpInv.siblings(".control").find(".fa-check").removeClass("is-hidden"); //показваем индикатор валидно
            //проверяем что нет валидности

            if (!data.success) {
              refreshCaptcha(form.querySelector(".captcha__refresh")); //обновляем картинку капчи
              //обрабатываем какая ошибка пришла с сервера

              data.errors.forEach(error => {
                const input = form.querySelector(`[name="${error[0]}"]`);

                if (input) {
                  input.classList.add("is-invalid"); //добовляем класс капчи не-валидно

                  input.parentNode.querySelector(".fa-exclamation-triangle").classList.remove("is-hidden");
                  input.parentNode.querySelector(".fa-check").classList.add("is-hidden"); //input.nextElementSibling.textContent = error[1]; // при показе ошибки строкой текста
                }
              });
            } else if (formValid) {
              //капча прошла валидацию
              //проверяем что форма прошла общую валидацию
              (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(form).find(".captcha__refresh").addClass("is-invisible"); //скрываем кнопку обновления капчи

              sendForm(form); // отправляем форму
              //document.querySelector(".form-result").classList.remove("is-hidden"); // при показе результата строкой текста
            }
          });
        } catch (error) {
          console.error("Ошибка:", error);
        }
      });
    }

    function sendForm(form) {
      try {
        fetch("/PHPMailer/mail.php", {
          method: "POST",
          body: new FormData(form)
        });
      } catch (error) {
        console.error("Ошибка:", error);
      }

      (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(form).find(".fa-check", ".fa-exclamation-triangle").addClass("is-hidden"); //скрываем значки

      (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(form).find(".captcha__refresh").removeClass("is-invisible"); //открываем кнопку обновления

      form.reset();
      closeModal();
      showThanks();
      formValid = false;
    }

    function closeModal() {
      switch (thanks) {
        //закрываем модалку
        case false:
          setTimeout(() => {
            (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(dataTarget).removeClass("is-active");
          }, duration);
          document.querySelector(`${dataTarget} form`).reset();
          animeModal((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(dataTarget)[0].querySelector(".modal-content"), (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(dataTarget)[0].querySelector(".modal-background"), 0);
          break;
        //закрываем модалку спасибо

        case true:
          setTimeout(() => {
            (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(thanksTarget).removeClass("is-active");
          }, duration);
          animeModal((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(thanksTarget)[0].querySelector(".modal-content"), (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(thanksTarget)[0].querySelector(".modal-background"), 0);
          thanks = false;
          break;
      } //компенсация смещени


      modalCont.style.transform = `translateX(${scroll}px)`;
      thanksCont.style.transform = `translateX(${scroll}px)`;
      html.classList.remove("is-clipped"); //разрешаем скролл

      body.style.marginRight = `0px`;
      nav.style.marginRight = `0px`;
    }

    const closeElements = document.querySelectorAll(`${dataTarget} [data-close]`),
          closeThanks = document.querySelectorAll(`${thanksTarget} [data-close]`);

    function closeHandler(closeElem, background) {
      // закрываем модальное окно при клике на элемент закрытия
      closeElem.forEach(elem => {
        (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(elem).click(e => {
          e.preventDefault();
          closeModal();
        });
      }); // закрываем окно при клике на подложку

      (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(background).click(e => {
        if (e.target.classList.contains("modal-background")) {
          closeModal();
        }
      });
    }

    closeHandler(closeElements, dataTarget);
    closeHandler(closeThanks, thanksTarget); //анимация окон

    function animeModal(target, targetBackground, action) {
      if (action == 1) {
        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_3__["default"])({
          targets: target,
          scale: [0, 1],
          opacity: [0, 1],
          easing: "linear",
          duration: duration
        });
        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_3__["default"])({
          targets: targetBackground,
          opacity: [0, 1],
          easing: "linear",
          duration: duration
        });
      } else {
        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_3__["default"])({
          targets: target,
          scale: [1, 0],
          opacity: [0, 1],
          easing: "linear",
          duration: duration
        });
        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_3__["default"])({
          targets: targetBackground,
          opacity: [1, 0],
          easing: "linear",
          duration: duration
        });
      }
    }
  }
};

(0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])("[data-modal]").modal();

/***/ }),

/***/ "./src/js/lib/components/tab.js":
/*!**************************************!*\
  !*** ./src/js/lib/components/tab.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
/* harmony import */ var animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! animejs/lib/anime.es.js */ "./node_modules/animejs/lib/anime.es.js");



_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.tab = function () {
  // получаем селекторы меню и карт табов
  const tabsItem = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[0]).find(".tab-item");
  const tabsContent = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[0]).find(".tab-content .card");

  for (let i = 0; i < tabsItem.length; i++) {
    (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(tabsItem[i]).click(e => {
      const tabsItemI = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(e.currentTarget); //получаем элемент таб меню
      //добавляем "активный" текущему пункту таб-меню и удаляем у остальных

      tabsItemI.addClass("is-active").siblings().removeClass("is-active"); //запускаем анимацию подъема карты

      animeTab([0, "-110%"], function () {
        //после подъема
        //находим карты и дабовляем всем "скрытый"
        tabsItemI.closest(".tab-panel").find(".tab-content").addClass("is-hidden"); //находим текущую карту и убираем "скрытый"

        tabsItemI.closest(".tab-panel").find(".tab-content").eq((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(tabsItem[i]).index()).removeClass("is-hidden");
        animeTab(["-110%", 0], () => {}); //запускае анимацию опускания
      });
    });
  }

  function animeTab(translateY, callback) {
    const duration = 500;

    for (let i = 0; i < tabsContent.length; i++) {
      //проверяем что это экран компьютера
      if (document.documentElement.clientWidth > 768) {
        //анимация подъема - опуска
        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
          targets: tabsContent[i],
          duration: duration,
          translateY: translateY,
          easing: "easeInOutBack"
        });
      } else if (translateY[0] == 0) {
        //если не компьютер
        //анимация затухания
        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
          targets: tabsContent[i],
          duration: duration,
          opacity: 0,
          easing: "easeInOutBack"
        });
      } else if (translateY[0] == "-110%") {
        //если не компьютер
        //анимация проявления
        (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
          targets: tabsContent[i],
          duration: duration,
          opacity: 1,
          easing: "easeInOutBack"
        });
      }
    }

    setTimeout(() => {
      callback();
    }, duration);
  }
};

(0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])("#tabs1").tab();

/***/ }),

/***/ "./src/js/lib/components/tiny-slider.js":
/*!**********************************************!*\
  !*** ./src/js/lib/components/tiny-slider.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "tns": () => (/* binding */ tns)
/* harmony export */ });
/* harmony import */ var _helpers_raf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers/raf.js */ "./src/js/lib/components/helpers/raf.js");
/* harmony import */ var _helpers_caf_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers/caf.js */ "./src/js/lib/components/helpers/caf.js");
/* harmony import */ var _helpers_extend_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers/extend.js */ "./src/js/lib/components/helpers/extend.js");
/* harmony import */ var _helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./helpers/checkStorageValue.js */ "./src/js/lib/components/helpers/checkStorageValue.js");
/* harmony import */ var _helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./helpers/setLocalStorage.js */ "./src/js/lib/components/helpers/setLocalStorage.js");
/* harmony import */ var _helpers_getSlideId_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./helpers/getSlideId.js */ "./src/js/lib/components/helpers/getSlideId.js");
/* harmony import */ var _helpers_calc_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./helpers/calc.js */ "./src/js/lib/components/helpers/calc.js");
/* harmony import */ var _helpers_percentageLayout_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./helpers/percentageLayout.js */ "./src/js/lib/components/helpers/percentageLayout.js");
/* harmony import */ var _helpers_mediaquerySupport_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./helpers/mediaquerySupport.js */ "./src/js/lib/components/helpers/mediaquerySupport.js");
/* harmony import */ var _helpers_createStyleSheet_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./helpers/createStyleSheet.js */ "./src/js/lib/components/helpers/createStyleSheet.js");
/* harmony import */ var _helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./helpers/addCSSRule.js */ "./src/js/lib/components/helpers/addCSSRule.js");
/* harmony import */ var _helpers_removeCSSRule_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./helpers/removeCSSRule.js */ "./src/js/lib/components/helpers/removeCSSRule.js");
/* harmony import */ var _helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./helpers/getCssRulesLength.js */ "./src/js/lib/components/helpers/getCssRulesLength.js");
/* harmony import */ var _helpers_toDegree_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./helpers/toDegree.js */ "./src/js/lib/components/helpers/toDegree.js");
/* harmony import */ var _helpers_getTouchDirection_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./helpers/getTouchDirection.js */ "./src/js/lib/components/helpers/getTouchDirection.js");
/* harmony import */ var _helpers_forEach_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./helpers/forEach.js */ "./src/js/lib/components/helpers/forEach.js");
/* harmony import */ var _helpers_hasClass_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./helpers/hasClass.js */ "./src/js/lib/components/helpers/hasClass.js");
/* harmony import */ var _helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./helpers/addClass.js */ "./src/js/lib/components/helpers/addClass.js");
/* harmony import */ var _helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./helpers/removeClass.js */ "./src/js/lib/components/helpers/removeClass.js");
/* harmony import */ var _helpers_hasAttr_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./helpers/hasAttr.js */ "./src/js/lib/components/helpers/hasAttr.js");
/* harmony import */ var _helpers_getAttr_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./helpers/getAttr.js */ "./src/js/lib/components/helpers/getAttr.js");
/* harmony import */ var _helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./helpers/setAttrs.js */ "./src/js/lib/components/helpers/setAttrs.js");
/* harmony import */ var _helpers_removeAttrs_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./helpers/removeAttrs.js */ "./src/js/lib/components/helpers/removeAttrs.js");
/* harmony import */ var _helpers_arrayFromNodeList_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./helpers/arrayFromNodeList.js */ "./src/js/lib/components/helpers/arrayFromNodeList.js");
/* harmony import */ var _helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./helpers/hideElement.js */ "./src/js/lib/components/helpers/hideElement.js");
/* harmony import */ var _helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./helpers/showElement.js */ "./src/js/lib/components/helpers/showElement.js");
/* harmony import */ var _helpers_isVisible_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./helpers/isVisible.js */ "./src/js/lib/components/helpers/isVisible.js");
/* harmony import */ var _helpers_whichProperty_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./helpers/whichProperty.js */ "./src/js/lib/components/helpers/whichProperty.js");
/* harmony import */ var _helpers_has3DTransforms_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./helpers/has3DTransforms.js */ "./src/js/lib/components/helpers/has3DTransforms.js");
/* harmony import */ var _helpers_getEndProperty_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./helpers/getEndProperty.js */ "./src/js/lib/components/helpers/getEndProperty.js");
/* harmony import */ var _helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./helpers/addEvents.js */ "./src/js/lib/components/helpers/addEvents.js");
/* harmony import */ var _helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./helpers/removeEvents.js */ "./src/js/lib/components/helpers/removeEvents.js");
/* harmony import */ var _helpers_events_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./helpers/events.js */ "./src/js/lib/components/helpers/events.js");
/* harmony import */ var _helpers_jsTransform_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./helpers/jsTransform.js */ "./src/js/lib/components/helpers/jsTransform.js");
// Object.keys
if (!Object.keys) {
  Object.keys = function (object) {
    var keys = [];

    for (var name in object) {
      if (Object.prototype.hasOwnProperty.call(object, name)) {
        keys.push(name);
      }
    }

    return keys;
  };
} // ChildNode.remove


if (!("remove" in Element.prototype)) {
  Element.prototype.remove = function () {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}



































var tns = function (options) {
  options = (0,_helpers_extend_js__WEBPACK_IMPORTED_MODULE_2__.extend)({
    container: ".slider",
    mode: "carousel",
    axis: "horizontal",
    items: 1,
    gutter: 0,
    edgePadding: 0,
    fixedWidth: false,
    autoWidth: false,
    viewportMax: false,
    slideBy: 1,
    center: false,
    controls: true,
    controlsPosition: "top",
    controlsText: ["prev", "next"],
    controlsContainer: false,
    prevButton: false,
    nextButton: false,
    nav: true,
    navPosition: "top",
    navContainer: false,
    navAsThumbnails: false,
    arrowKeys: false,
    speed: 300,
    autoplay: false,
    autoplayPosition: "top",
    autoplayTimeout: 5000,
    autoplayDirection: "forward",
    autoplayText: ["start", "stop"],
    autoplayHoverPause: false,
    autoplayButton: false,
    autoplayButtonOutput: true,
    autoplayResetOnVisibility: true,
    animateIn: "tns-fadeIn",
    animateOut: "tns-fadeOut",
    animateNormal: "tns-normal",
    animateDelay: false,
    loop: true,
    rewind: false,
    autoHeight: false,
    responsive: false,
    lazyload: false,
    lazyloadSelector: ".tns-lazy-img",
    touch: true,
    mouseDrag: false,
    swipeAngle: 15,
    nested: false,
    preventActionWhenRunning: false,
    preventScrollOnTouch: false,
    freezable: true,
    onInit: false,
    useLocalStorage: true,
    nonce: false
  }, options || {});
  var doc = document,
      win = window,
      KEYS = {
    ENTER: 13,
    SPACE: 32,
    LEFT: 37,
    RIGHT: 39
  },
      tnsStorage = {},
      localStorageAccess = options.useLocalStorage;

  if (localStorageAccess) {
    // check browser version and local storage access
    var browserInfo = navigator.userAgent;
    var uid = new Date();

    try {
      tnsStorage = win.localStorage;

      if (tnsStorage) {
        tnsStorage.setItem(uid, uid);
        localStorageAccess = tnsStorage.getItem(uid) == uid;
        tnsStorage.removeItem(uid);
      } else {
        localStorageAccess = false;
      }

      if (!localStorageAccess) {
        tnsStorage = {};
      }
    } catch (e) {
      localStorageAccess = false;
    }

    if (localStorageAccess) {
      // remove storage when browser version changes
      if (tnsStorage["tnsApp"] && tnsStorage["tnsApp"] !== browserInfo) {
        ["tC", "tPL", "tMQ", "tTf", "t3D", "tTDu", "tTDe", "tADu", "tADe", "tTE", "tAE"].forEach(function (item) {
          tnsStorage.removeItem(item);
        });
      } // update browserInfo


      localStorage["tnsApp"] = browserInfo;
    }
  }

  var CALC = tnsStorage["tC"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tC"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tC", (0,_helpers_calc_js__WEBPACK_IMPORTED_MODULE_6__.calc)(), localStorageAccess),
      PERCENTAGELAYOUT = tnsStorage["tPL"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tPL"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tPL", (0,_helpers_percentageLayout_js__WEBPACK_IMPORTED_MODULE_7__.percentageLayout)(), localStorageAccess),
      CSSMQ = tnsStorage["tMQ"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tMQ"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tMQ", (0,_helpers_mediaquerySupport_js__WEBPACK_IMPORTED_MODULE_8__.mediaquerySupport)(), localStorageAccess),
      TRANSFORM = tnsStorage["tTf"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tTf"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tTf", (0,_helpers_whichProperty_js__WEBPACK_IMPORTED_MODULE_27__.whichProperty)("transform"), localStorageAccess),
      HAS3DTRANSFORMS = tnsStorage["t3D"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["t3D"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "t3D", (0,_helpers_has3DTransforms_js__WEBPACK_IMPORTED_MODULE_28__.has3DTransforms)(TRANSFORM), localStorageAccess),
      TRANSITIONDURATION = tnsStorage["tTDu"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tTDu"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tTDu", (0,_helpers_whichProperty_js__WEBPACK_IMPORTED_MODULE_27__.whichProperty)("transitionDuration"), localStorageAccess),
      TRANSITIONDELAY = tnsStorage["tTDe"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tTDe"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tTDe", (0,_helpers_whichProperty_js__WEBPACK_IMPORTED_MODULE_27__.whichProperty)("transitionDelay"), localStorageAccess),
      ANIMATIONDURATION = tnsStorage["tADu"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tADu"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tADu", (0,_helpers_whichProperty_js__WEBPACK_IMPORTED_MODULE_27__.whichProperty)("animationDuration"), localStorageAccess),
      ANIMATIONDELAY = tnsStorage["tADe"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tADe"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tADe", (0,_helpers_whichProperty_js__WEBPACK_IMPORTED_MODULE_27__.whichProperty)("animationDelay"), localStorageAccess),
      TRANSITIONEND = tnsStorage["tTE"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tTE"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tTE", (0,_helpers_getEndProperty_js__WEBPACK_IMPORTED_MODULE_29__.getEndProperty)(TRANSITIONDURATION, "Transition"), localStorageAccess),
      ANIMATIONEND = tnsStorage["tAE"] ? (0,_helpers_checkStorageValue_js__WEBPACK_IMPORTED_MODULE_3__.checkStorageValue)(tnsStorage["tAE"]) : (0,_helpers_setLocalStorage_js__WEBPACK_IMPORTED_MODULE_4__.setLocalStorage)(tnsStorage, "tAE", (0,_helpers_getEndProperty_js__WEBPACK_IMPORTED_MODULE_29__.getEndProperty)(ANIMATIONDURATION, "Animation"), localStorageAccess); // get element nodes from selectors

  var supportConsoleWarn = win.console && typeof win.console.warn === "function",
      tnsList = ["container", "controlsContainer", "prevButton", "nextButton", "navContainer", "autoplayButton"],
      optionsElements = {};
  tnsList.forEach(function (item) {
    if (typeof options[item] === "string") {
      var str = options[item],
          el = doc.querySelector(str);
      optionsElements[item] = str;

      if (el && el.nodeName) {
        options[item] = el;
      } else {
        if (supportConsoleWarn) {
          console.warn("Can't find", options[item]);
        }

        return;
      }
    }
  }); // make sure at least 1 slide

  if (options.container.children.length < 1) {
    if (supportConsoleWarn) {
      console.warn("No slides found in", options.container);
    }

    return;
  } // update options


  var responsive = options.responsive,
      nested = options.nested,
      carousel = options.mode === "carousel" ? true : false;

  if (responsive) {
    // apply responsive[0] to options and remove it
    if (0 in responsive) {
      options = (0,_helpers_extend_js__WEBPACK_IMPORTED_MODULE_2__.extend)(options, responsive[0]);
      delete responsive[0];
    }

    var responsiveTem = {};

    for (var key in responsive) {
      var val = responsive[key]; // update responsive
      // from: 300: 2
      // to:
      //   300: {
      //     items: 2
      //   }

      val = typeof val === "number" ? {
        items: val
      } : val;
      responsiveTem[key] = val;
    }

    responsive = responsiveTem;
    responsiveTem = null;
  } // update options


  function updateOptions(obj) {
    for (var key in obj) {
      if (!carousel) {
        if (key === "slideBy") {
          obj[key] = "page";
        }

        if (key === "edgePadding") {
          obj[key] = false;
        }

        if (key === "autoHeight") {
          obj[key] = false;
        }
      } // update responsive options


      if (key === "responsive") {
        updateOptions(obj[key]);
      }
    }
  }

  if (!carousel) {
    updateOptions(options);
  } // === define and set variables ===


  if (!carousel) {
    options.axis = "horizontal";
    options.slideBy = "page";
    options.edgePadding = false;
    var animateIn = options.animateIn,
        animateOut = options.animateOut,
        animateDelay = options.animateDelay,
        animateNormal = options.animateNormal;
  }

  var horizontal = options.axis === "horizontal" ? true : false,
      outerWrapper = doc.createElement("div"),
      innerWrapper = doc.createElement("div"),
      middleWrapper,
      container = options.container,
      containerParent = container.parentNode,
      containerHTML = container.outerHTML,
      slideItems = container.children,
      slideCount = slideItems.length,
      breakpointZone,
      windowWidth = getWindowWidth(),
      isOn = false;

  if (responsive) {
    setBreakpointZone();
  }

  if (carousel) {
    container.className += " tns-vpfix";
  } // fixedWidth: viewport > rightBoundary > indexMax


  var autoWidth = options.autoWidth,
      fixedWidth = getOption("fixedWidth"),
      edgePadding = getOption("edgePadding"),
      gutter = getOption("gutter"),
      viewport = getViewportWidth(),
      center = getOption("center"),
      items = !autoWidth ? Math.floor(getOption("items")) : 1,
      slideBy = getOption("slideBy"),
      viewportMax = options.viewportMax || options.fixedWidthViewportWidth,
      arrowKeys = getOption("arrowKeys"),
      speed = getOption("speed"),
      rewind = options.rewind,
      loop = rewind ? false : options.loop,
      autoHeight = getOption("autoHeight"),
      controls = getOption("controls"),
      controlsText = getOption("controlsText"),
      nav = getOption("nav"),
      touch = getOption("touch"),
      mouseDrag = getOption("mouseDrag"),
      autoplay = getOption("autoplay"),
      autoplayTimeout = getOption("autoplayTimeout"),
      autoplayText = getOption("autoplayText"),
      autoplayHoverPause = getOption("autoplayHoverPause"),
      autoplayResetOnVisibility = getOption("autoplayResetOnVisibility"),
      sheet = (0,_helpers_createStyleSheet_js__WEBPACK_IMPORTED_MODULE_9__.createStyleSheet)(null, getOption("nonce")),
      lazyload = options.lazyload,
      lazyloadSelector = options.lazyloadSelector,
      slidePositions,
      // collection of slide positions
  slideItemsOut = [],
      cloneCount = loop ? getCloneCountForLoop() : 0,
      slideCountNew = !carousel ? slideCount + cloneCount : slideCount + cloneCount * 2,
      hasRightDeadZone = (fixedWidth || autoWidth) && !loop ? true : false,
      rightBoundary = fixedWidth ? getRightBoundary() : null,
      updateIndexBeforeTransform = !carousel || !loop ? true : false,
      // transform
  transformAttr = horizontal ? "left" : "top",
      transformPrefix = "",
      transformPostfix = "",
      // index
  getIndexMax = function () {
    if (fixedWidth) {
      return function () {
        return center && !loop ? slideCount - 1 : Math.ceil(-rightBoundary / (fixedWidth + gutter));
      };
    } else if (autoWidth) {
      return function () {
        for (var i = 0; i < slideCountNew; i++) {
          if (slidePositions[i] >= -rightBoundary) {
            return i;
          }
        }
      };
    } else {
      return function () {
        if (center && carousel && !loop) {
          return slideCount - 1;
        } else {
          return loop || carousel ? Math.max(0, slideCountNew - Math.ceil(items)) : slideCountNew - 1;
        }
      };
    }
  }(),
      index = getStartIndex(getOption("startIndex")),
      indexCached = index,
      displayIndex = getCurrentSlide(),
      indexMin = 0,
      indexMax = !autoWidth ? getIndexMax() : null,
      // resize
  resizeTimer,
      preventActionWhenRunning = options.preventActionWhenRunning,
      swipeAngle = options.swipeAngle,
      moveDirectionExpected = swipeAngle ? "?" : true,
      running = false,
      onInit = options.onInit,
      events = new _helpers_events_js__WEBPACK_IMPORTED_MODULE_32__.Events(),
      // id, class
  newContainerClasses = " tns-slider tns-" + options.mode,
      slideId = container.id || (0,_helpers_getSlideId_js__WEBPACK_IMPORTED_MODULE_5__.getSlideId)(),
      disable = getOption("disable"),
      disabled = false,
      freezable = options.freezable,
      freeze = freezable && !autoWidth ? getFreeze() : false,
      frozen = false,
      controlsEvents = {
    click: onControlsClick,
    keydown: onControlsKeydown
  },
      navEvents = {
    click: onNavClick,
    keydown: onNavKeydown
  },
      hoverEvents = {
    mouseover: mouseoverPause,
    mouseout: mouseoutRestart
  },
      visibilityEvent = {
    visibilitychange: onVisibilityChange
  },
      docmentKeydownEvent = {
    keydown: onDocumentKeydown
  },
      touchEvents = {
    touchstart: onPanStart,
    touchmove: onPanMove,
    touchend: onPanEnd,
    touchcancel: onPanEnd
  },
      dragEvents = {
    mousedown: onPanStart,
    mousemove: onPanMove,
    mouseup: onPanEnd,
    mouseleave: onPanEnd
  },
      hasControls = hasOption("controls"),
      hasNav = hasOption("nav"),
      navAsThumbnails = autoWidth ? true : options.navAsThumbnails,
      hasAutoplay = hasOption("autoplay"),
      hasTouch = hasOption("touch"),
      hasMouseDrag = hasOption("mouseDrag"),
      slideActiveClass = "tns-slide-active",
      slideClonedClass = "tns-slide-cloned",
      imgCompleteClass = "tns-complete",
      imgEvents = {
    load: onImgLoaded,
    error: onImgFailed
  },
      imgsComplete,
      liveregionCurrent,
      preventScroll = options.preventScrollOnTouch === "force" ? true : false; // controls


  if (hasControls) {
    var controlsContainer = options.controlsContainer,
        controlsContainerHTML = options.controlsContainer ? options.controlsContainer.outerHTML : "",
        prevButton = options.prevButton,
        nextButton = options.nextButton,
        prevButtonHTML = options.prevButton ? options.prevButton.outerHTML : "",
        nextButtonHTML = options.nextButton ? options.nextButton.outerHTML : "",
        prevIsButton,
        nextIsButton;
  } // nav


  if (hasNav) {
    var navContainer = options.navContainer,
        navContainerHTML = options.navContainer ? options.navContainer.outerHTML : "",
        navItems,
        pages = autoWidth ? slideCount : getPages(),
        pagesCached = 0,
        navClicked = -1,
        navCurrentIndex = getCurrentNavIndex(),
        navCurrentIndexCached = navCurrentIndex,
        navActiveClass = "tns-nav-active",
        navStr = "Carousel Page ",
        navStrCurrent = " (Current Slide)";
  } // autoplay


  if (hasAutoplay) {
    var autoplayDirection = options.autoplayDirection === "forward" ? 1 : -1,
        autoplayButton = options.autoplayButton,
        autoplayButtonHTML = options.autoplayButton ? options.autoplayButton.outerHTML : "",
        autoplayHtmlStrings = ["<span class='tns-visually-hidden'>", " animation</span>"],
        autoplayTimer,
        animating,
        autoplayHoverPaused,
        autoplayUserPaused,
        autoplayVisibilityPaused;
  }

  if (hasTouch || hasMouseDrag) {
    var initPosition = {},
        lastPosition = {},
        translateInit,
        disX,
        disY,
        panStart = false,
        rafIndex,
        getDist = horizontal ? function (a, b) {
      return a.x - b.x;
    } : function (a, b) {
      return a.y - b.y;
    };
  } // disable slider when slidecount <= items


  if (!autoWidth) {
    resetVariblesWhenDisable(disable || freeze);
  }

  if (TRANSFORM) {
    transformAttr = TRANSFORM;
    transformPrefix = "translate";

    if (HAS3DTRANSFORMS) {
      transformPrefix += horizontal ? "3d(" : "3d(0px, ";
      transformPostfix = horizontal ? ", 0px, 0px)" : ", 0px)";
    } else {
      transformPrefix += horizontal ? "X(" : "Y(";
      transformPostfix = ")";
    }
  }

  if (carousel) {
    container.className = container.className.replace("tns-vpfix", "");
  }

  initStructure();
  initSheet();
  initSliderTransform(); // === COMMON FUNCTIONS === //

  function resetVariblesWhenDisable(condition) {
    if (condition) {
      controls = nav = touch = mouseDrag = arrowKeys = autoplay = autoplayHoverPause = autoplayResetOnVisibility = false;
    }
  }

  function getCurrentSlide() {
    var tem = carousel ? index - cloneCount : index;

    while (tem < 0) {
      tem += slideCount;
    }

    return tem % slideCount + 1;
  }

  function getStartIndex(ind) {
    ind = ind ? Math.max(0, Math.min(loop ? slideCount - 1 : slideCount - items, ind)) : 0;
    return carousel ? ind + cloneCount : ind;
  }

  function getAbsIndex(i) {
    if (i == null) {
      i = index;
    }

    if (carousel) {
      i -= cloneCount;
    }

    while (i < 0) {
      i += slideCount;
    }

    return Math.floor(i % slideCount);
  }

  function getCurrentNavIndex() {
    var absIndex = getAbsIndex(),
        result;
    result = navAsThumbnails ? absIndex : fixedWidth || autoWidth ? Math.ceil((absIndex + 1) * pages / slideCount - 1) : Math.floor(absIndex / items); // set active nav to the last one when reaches the right edge

    if (!loop && carousel && index === indexMax) {
      result = pages - 1;
    }

    return result;
  }

  function getItemsMax() {
    // fixedWidth or autoWidth while viewportMax is not available
    if (autoWidth || fixedWidth && !viewportMax) {
      return slideCount - 1; // most cases
    } else {
      var str = fixedWidth ? "fixedWidth" : "items",
          arr = [];

      if (fixedWidth || options[str] < slideCount) {
        arr.push(options[str]);
      }

      if (responsive) {
        for (var bp in responsive) {
          var tem = responsive[bp][str];

          if (tem && (fixedWidth || tem < slideCount)) {
            arr.push(tem);
          }
        }
      }

      if (!arr.length) {
        arr.push(0);
      }

      return Math.ceil(fixedWidth ? viewportMax / Math.min.apply(null, arr) : Math.max.apply(null, arr));
    }
  }

  function getCloneCountForLoop() {
    var itemsMax = getItemsMax(),
        result = carousel ? Math.ceil((itemsMax * 5 - slideCount) / 2) : itemsMax * 4 - slideCount;
    result = Math.max(itemsMax, result);
    return hasOption("edgePadding") ? result + 1 : result;
  }

  function getWindowWidth() {
    return win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;
  }

  function getInsertPosition(pos) {
    return pos === "top" ? "afterbegin" : "beforeend";
  }

  function getClientWidth(el) {
    if (el == null) {
      return;
    }

    var div = doc.createElement("div"),
        rect,
        width;
    el.appendChild(div);
    rect = div.getBoundingClientRect();
    width = rect.right - rect.left;
    div.remove();
    return width || getClientWidth(el.parentNode);
  }

  function getViewportWidth() {
    var gap = edgePadding ? edgePadding * 2 - gutter : 0;
    return getClientWidth(containerParent) - gap;
  }

  function hasOption(item) {
    if (options[item]) {
      return true;
    } else {
      if (responsive) {
        for (var bp in responsive) {
          if (responsive[bp][item]) {
            return true;
          }
        }
      }

      return false;
    }
  } // get option:
  // fixed width: viewport, fixedWidth, gutter => items
  // others: window width => all variables
  // all: items => slideBy


  function getOption(item, ww) {
    if (ww == null) {
      ww = windowWidth;
    }

    if (item === "items" && fixedWidth) {
      return Math.floor((viewport + gutter) / (fixedWidth + gutter)) || 1;
    } else {
      var result = options[item];

      if (responsive) {
        for (var bp in responsive) {
          // bp: convert string to number
          if (ww >= parseInt(bp)) {
            if (item in responsive[bp]) {
              result = responsive[bp][item];
            }
          }
        }
      }

      if (item === "slideBy" && result === "page") {
        result = getOption("items");
      }

      if (!carousel && (item === "slideBy" || item === "items")) {
        result = Math.floor(result);
      }

      return result;
    }
  }

  function getSlideMarginLeft(i) {
    return CALC ? CALC + "(" + i * 100 + "% / " + slideCountNew + ")" : i * 100 / slideCountNew + "%";
  }

  function getInnerWrapperStyles(edgePaddingTem, gutterTem, fixedWidthTem, speedTem, autoHeightBP) {
    var str = "";

    if (edgePaddingTem !== undefined) {
      var gap = edgePaddingTem;

      if (gutterTem) {
        gap -= gutterTem;
      }

      str = horizontal ? "margin: 0 " + gap + "px 0 " + edgePaddingTem + "px;" : "margin: " + edgePaddingTem + "px 0 " + gap + "px 0;";
    } else if (gutterTem && !fixedWidthTem) {
      var gutterTemUnit = "-" + gutterTem + "px",
          dir = horizontal ? gutterTemUnit + " 0 0" : "0 " + gutterTemUnit + " 0";
      str = "margin: 0 " + dir + ";";
    }

    if (!carousel && autoHeightBP && TRANSITIONDURATION && speedTem) {
      str += getTransitionDurationStyle(speedTem);
    }

    return str;
  }

  function getContainerWidth(fixedWidthTem, gutterTem, itemsTem) {
    if (fixedWidthTem) {
      return (fixedWidthTem + gutterTem) * slideCountNew + "px";
    } else {
      return CALC ? CALC + "(" + slideCountNew * 100 + "% / " + itemsTem + ")" : slideCountNew * 100 / itemsTem + "%";
    }
  }

  function getSlideWidthStyle(fixedWidthTem, gutterTem, itemsTem) {
    var width;

    if (fixedWidthTem) {
      width = fixedWidthTem + gutterTem + "px";
    } else {
      if (!carousel) {
        itemsTem = Math.floor(itemsTem);
      }

      var dividend = carousel ? slideCountNew : itemsTem;
      width = CALC ? CALC + "(100% / " + dividend + ")" : 100 / dividend + "%";
    }

    width = "width:" + width; // inner slider: overwrite outer slider styles

    return nested !== "inner" ? width + ";" : width + " !important;";
  }

  function getSlideGutterStyle(gutterTem) {
    var str = ""; // gutter maybe interger || 0
    // so can't use 'if (gutter)'

    if (gutterTem !== false) {
      var prop = horizontal ? "padding-" : "margin-",
          dir = horizontal ? "right" : "bottom";
      str = prop + dir + ": " + gutterTem + "px;";
    }

    return str;
  }

  function getCSSPrefix(name, num) {
    var prefix = name.substring(0, name.length - num).toLowerCase();

    if (prefix) {
      prefix = "-" + prefix + "-";
    }

    return prefix;
  }

  function getTransitionDurationStyle(speed) {
    return getCSSPrefix(TRANSITIONDURATION, 18) + "transition-duration:" + speed / 1000 + "s;";
  }

  function getAnimationDurationStyle(speed) {
    return getCSSPrefix(ANIMATIONDURATION, 17) + "animation-duration:" + speed / 1000 + "s;";
  }

  function initStructure() {
    var classOuter = "tns-outer",
        classInner = "tns-inner",
        hasGutter = hasOption("gutter");
    outerWrapper.className = classOuter;
    innerWrapper.className = classInner;
    outerWrapper.id = slideId + "-ow";
    innerWrapper.id = slideId + "-iw"; // set container properties

    if (container.id === "") {
      container.id = slideId;
    }

    newContainerClasses += PERCENTAGELAYOUT || autoWidth ? " tns-subpixel" : " tns-no-subpixel";
    newContainerClasses += CALC ? " tns-calc" : " tns-no-calc";

    if (autoWidth) {
      newContainerClasses += " tns-autowidth";
    }

    newContainerClasses += " tns-" + options.axis;
    container.className += newContainerClasses; // add constrain layer for carousel

    if (carousel) {
      middleWrapper = doc.createElement("div");
      middleWrapper.id = slideId + "-mw";
      middleWrapper.className = "tns-ovh";
      outerWrapper.appendChild(middleWrapper);
      middleWrapper.appendChild(innerWrapper);
    } else {
      outerWrapper.appendChild(innerWrapper);
    }

    if (autoHeight) {
      var wp = middleWrapper ? middleWrapper : innerWrapper;
      wp.className += " tns-ah";
    }

    containerParent.insertBefore(outerWrapper, container);
    innerWrapper.appendChild(container); // add id, class, aria attributes
    // before clone slides

    (0,_helpers_forEach_js__WEBPACK_IMPORTED_MODULE_15__.forEach)(slideItems, function (item, i) {
      (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, "tns-item");

      if (!item.id) {
        item.id = slideId + "-item" + i;
      }

      if (!carousel && animateNormal) {
        (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, animateNormal);
      }

      (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(item, {
        "aria-hidden": "true",
        tabindex: "-1"
      });
    }); // ## clone slides
    // carousel: n + slides + n
    // gallery:      slides + n

    if (cloneCount) {
      var fragmentBefore = doc.createDocumentFragment(),
          fragmentAfter = doc.createDocumentFragment();

      for (var j = cloneCount; j--;) {
        var num = j % slideCount,
            cloneFirst = slideItems[num].cloneNode(true);
        (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(cloneFirst, slideClonedClass);
        (0,_helpers_removeAttrs_js__WEBPACK_IMPORTED_MODULE_22__.removeAttrs)(cloneFirst, "id");
        fragmentAfter.insertBefore(cloneFirst, fragmentAfter.firstChild);

        if (carousel) {
          var cloneLast = slideItems[slideCount - 1 - num].cloneNode(true);
          (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(cloneLast, slideClonedClass);
          (0,_helpers_removeAttrs_js__WEBPACK_IMPORTED_MODULE_22__.removeAttrs)(cloneLast, "id");
          fragmentBefore.appendChild(cloneLast);
        }
      }

      container.insertBefore(fragmentBefore, container.firstChild);
      container.appendChild(fragmentAfter);
      slideItems = container.children;
    }
  }

  function initSliderTransform() {
    // ## images loaded/failed
    if (hasOption("autoHeight") || autoWidth || !horizontal) {
      var imgs = container.querySelectorAll("img"); // add img load event listener

      (0,_helpers_forEach_js__WEBPACK_IMPORTED_MODULE_15__.forEach)(imgs, function (img) {
        var src = img.src;

        if (!lazyload) {
          // not data img
          if (src && src.indexOf("data:image") < 0) {
            img.src = "";
            (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(img, imgEvents);
            (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(img, "loading");
            img.src = src; // data img
          } else {
            imgLoaded(img);
          }
        }
      }); // set imgsComplete

      (0,_helpers_raf_js__WEBPACK_IMPORTED_MODULE_0__.raf)(function () {
        imgsLoadedCheck((0,_helpers_arrayFromNodeList_js__WEBPACK_IMPORTED_MODULE_23__.arrayFromNodeList)(imgs), function () {
          imgsComplete = true;
        });
      }); // reset imgs for auto height: check visible imgs only

      if (hasOption("autoHeight")) {
        imgs = getImageArray(index, Math.min(index + items - 1, slideCountNew - 1));
      }

      lazyload ? initSliderTransformStyleCheck() : (0,_helpers_raf_js__WEBPACK_IMPORTED_MODULE_0__.raf)(function () {
        imgsLoadedCheck((0,_helpers_arrayFromNodeList_js__WEBPACK_IMPORTED_MODULE_23__.arrayFromNodeList)(imgs), initSliderTransformStyleCheck);
      });
    } else {
      // set container transform property
      if (carousel) {
        doContainerTransformSilent();
      } // update slider tools and events


      initTools();
      initEvents();
    }
  }

  function initSliderTransformStyleCheck() {
    if (autoWidth && slideCount > 1) {
      // check styles application
      var num = loop ? index : slideCount - 1;

      (function stylesApplicationCheck() {
        var left = slideItems[num].getBoundingClientRect().left;
        var right = slideItems[num - 1].getBoundingClientRect().right;
        Math.abs(left - right) <= 1 ? initSliderTransformCore() : setTimeout(function () {
          stylesApplicationCheck();
        }, 16);
      })();
    } else {
      initSliderTransformCore();
    }
  }

  function initSliderTransformCore() {
    // run Fn()s which are rely on image loading
    if (!horizontal || autoWidth) {
      setSlidePositions();

      if (autoWidth) {
        rightBoundary = getRightBoundary();

        if (freezable) {
          freeze = getFreeze();
        }

        indexMax = getIndexMax(); // <= slidePositions, rightBoundary <=

        resetVariblesWhenDisable(disable || freeze);
      } else {
        updateContentWrapperHeight();
      }
    } // set container transform property


    if (carousel) {
      doContainerTransformSilent();
    } // update slider tools and events


    initTools();
    initEvents();
  }

  function initSheet() {
    // gallery:
    // set animation classes and left value for gallery slider
    if (!carousel) {
      for (var i = index, l = index + Math.min(slideCount, items); i < l; i++) {
        var item = slideItems[i];
        item.style.left = (i - index) * 100 / items + "%";
        (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, animateIn);
        (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(item, animateNormal);
      }
    } // #### LAYOUT
    // ## INLINE-BLOCK VS FLOAT
    // ## PercentageLayout:
    // slides: inline-block
    // remove blank space between slides by set font-size: 0
    // ## Non PercentageLayout:
    // slides: float
    //         margin-right: -100%
    //         margin-left: ~
    // Resource: https://docs.google.com/spreadsheets/d/147up245wwTXeQYve3BRSAD4oVcvQmuGsFteJOeA5xNQ/edit?usp=sharing


    if (horizontal) {
      if (PERCENTAGELAYOUT || autoWidth) {
        (0,_helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__.addCSSRule)(sheet, "#" + slideId + " > .tns-item", "font-size:" + win.getComputedStyle(slideItems[0]).fontSize + ";", (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet));
        (0,_helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__.addCSSRule)(sheet, "#" + slideId, "font-size:0;", (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet));
      } else if (carousel) {
        (0,_helpers_forEach_js__WEBPACK_IMPORTED_MODULE_15__.forEach)(slideItems, function (slide, i) {
          slide.style.marginLeft = getSlideMarginLeft(i);
        });
      }
    } // ## BASIC STYLES


    if (CSSMQ) {
      // middle wrapper style
      if (TRANSITIONDURATION) {
        var str = middleWrapper && options.autoHeight ? getTransitionDurationStyle(options.speed) : "";
        (0,_helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__.addCSSRule)(sheet, "#" + slideId + "-mw", str, (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet));
      } // inner wrapper styles


      str = getInnerWrapperStyles(options.edgePadding, options.gutter, options.fixedWidth, options.speed, options.autoHeight);
      (0,_helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__.addCSSRule)(sheet, "#" + slideId + "-iw", str, (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet)); // container styles

      if (carousel) {
        str = horizontal && !autoWidth ? "width:" + getContainerWidth(options.fixedWidth, options.gutter, options.items) + ";" : "";

        if (TRANSITIONDURATION) {
          str += getTransitionDurationStyle(speed);
        }

        (0,_helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__.addCSSRule)(sheet, "#" + slideId, str, (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet));
      } // slide styles


      str = horizontal && !autoWidth ? getSlideWidthStyle(options.fixedWidth, options.gutter, options.items) : "";

      if (options.gutter) {
        str += getSlideGutterStyle(options.gutter);
      } // set gallery items transition-duration


      if (!carousel) {
        if (TRANSITIONDURATION) {
          str += getTransitionDurationStyle(speed);
        }

        if (ANIMATIONDURATION) {
          str += getAnimationDurationStyle(speed);
        }
      }

      if (str) {
        (0,_helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__.addCSSRule)(sheet, "#" + slideId + " > .tns-item", str, (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet));
      } // non CSS mediaqueries: IE8
      // ## update inner wrapper, container, slides if needed
      // set inline styles for inner wrapper & container
      // insert stylesheet (one line) for slides only (since slides are many)

    } else {
      // middle wrapper styles
      update_carousel_transition_duration(); // inner wrapper styles

      innerWrapper.style.cssText = getInnerWrapperStyles(edgePadding, gutter, fixedWidth, autoHeight); // container styles

      if (carousel && horizontal && !autoWidth) {
        container.style.width = getContainerWidth(fixedWidth, gutter, items);
      } // slide styles


      var str = horizontal && !autoWidth ? getSlideWidthStyle(fixedWidth, gutter, items) : "";

      if (gutter) {
        str += getSlideGutterStyle(gutter);
      } // append to the last line


      if (str) {
        (0,_helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__.addCSSRule)(sheet, "#" + slideId + " > .tns-item", str, (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet));
      }
    } // ## MEDIAQUERIES


    if (responsive && CSSMQ) {
      for (var bp in responsive) {
        // bp: convert string to number
        bp = parseInt(bp);
        var opts = responsive[bp],
            str = "",
            middleWrapperStr = "",
            innerWrapperStr = "",
            containerStr = "",
            slideStr = "",
            itemsBP = !autoWidth ? getOption("items", bp) : null,
            fixedWidthBP = getOption("fixedWidth", bp),
            speedBP = getOption("speed", bp),
            edgePaddingBP = getOption("edgePadding", bp),
            autoHeightBP = getOption("autoHeight", bp),
            gutterBP = getOption("gutter", bp); // middle wrapper string

        if (TRANSITIONDURATION && middleWrapper && getOption("autoHeight", bp) && "speed" in opts) {
          middleWrapperStr = "#" + slideId + "-mw{" + getTransitionDurationStyle(speedBP) + "}";
        } // inner wrapper string


        if ("edgePadding" in opts || "gutter" in opts) {
          innerWrapperStr = "#" + slideId + "-iw{" + getInnerWrapperStyles(edgePaddingBP, gutterBP, fixedWidthBP, speedBP, autoHeightBP) + "}";
        } // container string


        if (carousel && horizontal && !autoWidth && ("fixedWidth" in opts || "items" in opts || fixedWidth && "gutter" in opts)) {
          containerStr = "width:" + getContainerWidth(fixedWidthBP, gutterBP, itemsBP) + ";";
        }

        if (TRANSITIONDURATION && "speed" in opts) {
          containerStr += getTransitionDurationStyle(speedBP);
        }

        if (containerStr) {
          containerStr = "#" + slideId + "{" + containerStr + "}";
        } // slide string


        if ("fixedWidth" in opts || fixedWidth && "gutter" in opts || !carousel && "items" in opts) {
          slideStr += getSlideWidthStyle(fixedWidthBP, gutterBP, itemsBP);
        }

        if ("gutter" in opts) {
          slideStr += getSlideGutterStyle(gutterBP);
        } // set gallery items transition-duration


        if (!carousel && "speed" in opts) {
          if (TRANSITIONDURATION) {
            slideStr += getTransitionDurationStyle(speedBP);
          }

          if (ANIMATIONDURATION) {
            slideStr += getAnimationDurationStyle(speedBP);
          }
        }

        if (slideStr) {
          slideStr = "#" + slideId + " > .tns-item{" + slideStr + "}";
        } // add up


        str = middleWrapperStr + innerWrapperStr + containerStr + slideStr;

        if (str) {
          sheet.insertRule("@media (min-width: " + bp / 16 + "em) {" + str + "}", sheet.cssRules.length);
        }
      }
    }
  }

  function initTools() {
    // == slides ==
    updateSlideStatus(); // == live region ==

    outerWrapper.insertAdjacentHTML("afterbegin", '<div class="tns-liveregion tns-visually-hidden" aria-live="polite" aria-atomic="true">slide <span class="current">' + getLiveRegionStr() + "</span>  of " + slideCount + "</div>");
    liveregionCurrent = outerWrapper.querySelector(".tns-liveregion .current"); // == autoplayInit ==

    if (hasAutoplay) {
      var txt = autoplay ? "stop" : "start";

      if (autoplayButton) {
        (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(autoplayButton, {
          "data-action": txt
        });
      } else if (options.autoplayButtonOutput) {
        outerWrapper.insertAdjacentHTML(getInsertPosition(options.autoplayPosition), '<button type="button" data-action="' + txt + '">' + autoplayHtmlStrings[0] + txt + autoplayHtmlStrings[1] + autoplayText[0] + "</button>");
        autoplayButton = outerWrapper.querySelector("[data-action]");
      } // add event


      if (autoplayButton) {
        (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(autoplayButton, {
          click: toggleAutoplay
        });
      }

      if (autoplay) {
        startAutoplay();

        if (autoplayHoverPause) {
          (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(container, hoverEvents);
        }

        if (autoplayResetOnVisibility) {
          (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(container, visibilityEvent);
        }
      }
    } // == navInit ==


    if (hasNav) {
      var initIndex = !carousel ? 0 : cloneCount; // customized nav
      // will not hide the navs in case they're thumbnails

      if (navContainer) {
        (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(navContainer, {
          "aria-label": "Carousel Pagination"
        });
        navItems = navContainer.children;
        (0,_helpers_forEach_js__WEBPACK_IMPORTED_MODULE_15__.forEach)(navItems, function (item, i) {
          (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(item, {
            "data-nav": i,
            tabindex: "-1",
            "aria-label": navStr + (i + 1),
            "aria-controls": slideId
          });
        }); // generated nav
      } else {
        var navHtml = "",
            hiddenStr = navAsThumbnails ? "" : 'style="display:none"';

        for (var i = 0; i < slideCount; i++) {
          // hide nav items by default
          navHtml += '<button type="button" data-nav="' + i + '" tabindex="-1" aria-controls="' + slideId + '" ' + hiddenStr + ' aria-label="' + navStr + (i + 1) + '"></button>';
        }

        navHtml = '<div class="tns-nav" aria-label="Carousel Pagination">' + navHtml + "</div>";
        outerWrapper.insertAdjacentHTML(getInsertPosition(options.navPosition), navHtml);
        navContainer = outerWrapper.querySelector(".tns-nav");
        navItems = navContainer.children;
      }

      updateNavVisibility(); // add transition

      if (TRANSITIONDURATION) {
        var prefix = TRANSITIONDURATION.substring(0, TRANSITIONDURATION.length - 18).toLowerCase(),
            str = "transition: all " + speed / 1000 + "s";

        if (prefix) {
          str = "-" + prefix + "-" + str;
        }

        (0,_helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__.addCSSRule)(sheet, "[aria-controls^=" + slideId + "-item]", str, (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet));
      }

      (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(navItems[navCurrentIndex], {
        "aria-label": navStr + (navCurrentIndex + 1) + navStrCurrent
      });
      (0,_helpers_removeAttrs_js__WEBPACK_IMPORTED_MODULE_22__.removeAttrs)(navItems[navCurrentIndex], "tabindex");
      (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(navItems[navCurrentIndex], navActiveClass); // add events

      (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(navContainer, navEvents);
    } // == controlsInit ==


    if (hasControls) {
      if (!controlsContainer && (!prevButton || !nextButton)) {
        outerWrapper.insertAdjacentHTML(getInsertPosition(options.controlsPosition), '<div class="tns-controls" aria-label="Carousel Navigation" tabindex="0"><button type="button" data-controls="prev" tabindex="-1" aria-controls="' + slideId + '">' + controlsText[0] + '</button><button type="button" data-controls="next" tabindex="-1" aria-controls="' + slideId + '">' + controlsText[1] + "</button></div>");
        controlsContainer = outerWrapper.querySelector(".tns-controls");
      }

      if (!prevButton || !nextButton) {
        prevButton = controlsContainer.children[0];
        nextButton = controlsContainer.children[1];
      }

      if (options.controlsContainer) {
        (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(controlsContainer, {
          "aria-label": "Carousel Navigation",
          tabindex: "0"
        });
      }

      if (options.controlsContainer || options.prevButton && options.nextButton) {
        (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)([prevButton, nextButton], {
          "aria-controls": slideId,
          tabindex: "-1"
        });
      }

      if (options.controlsContainer || options.prevButton && options.nextButton) {
        (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(prevButton, {
          "data-controls": "prev"
        });
        (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(nextButton, {
          "data-controls": "next"
        });
      }

      prevIsButton = isButton(prevButton);
      nextIsButton = isButton(nextButton);
      updateControlsStatus(); // add events

      if (controlsContainer) {
        (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(controlsContainer, controlsEvents);
      } else {
        (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(prevButton, controlsEvents);
        (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(nextButton, controlsEvents);
      }
    } // hide tools if needed


    disableUI();
  }

  function initEvents() {
    // add events
    if (carousel && TRANSITIONEND) {
      var eve = {};
      eve[TRANSITIONEND] = onTransitionEnd;
      (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(container, eve);
    }

    if (touch) {
      (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(container, touchEvents, options.preventScrollOnTouch);
    }

    if (mouseDrag) {
      (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(container, dragEvents);
    }

    if (arrowKeys) {
      (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(doc, docmentKeydownEvent);
    }

    if (nested === "inner") {
      events.on("outerResized", function () {
        resizeTasks();
        events.emit("innerLoaded", info());
      });
    } else if (responsive || fixedWidth || autoWidth || autoHeight || !horizontal) {
      (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(win, {
        resize: onResize
      });
    }

    if (autoHeight) {
      if (nested === "outer") {
        events.on("innerLoaded", doAutoHeight);
      } else if (!disable) {
        doAutoHeight();
      }
    }

    doLazyLoad();

    if (disable) {
      disableSlider();
    } else if (freeze) {
      freezeSlider();
    }

    events.on("indexChanged", additionalUpdates);

    if (nested === "inner") {
      events.emit("innerLoaded", info());
    }

    if (typeof onInit === "function") {
      onInit(info());
    }

    isOn = true;
  }

  function destroy() {
    // sheet
    sheet.disabled = true;

    if (sheet.ownerNode) {
      sheet.ownerNode.remove();
    } // remove win event listeners


    (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(win, {
      resize: onResize
    }); // arrowKeys, controls, nav

    if (arrowKeys) {
      (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(doc, docmentKeydownEvent);
    }

    if (controlsContainer) {
      (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(controlsContainer, controlsEvents);
    }

    if (navContainer) {
      (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(navContainer, navEvents);
    } // autoplay


    (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(container, hoverEvents);
    (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(container, visibilityEvent);

    if (autoplayButton) {
      (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(autoplayButton, {
        click: toggleAutoplay
      });
    }

    if (autoplay) {
      clearInterval(autoplayTimer);
    } // container


    if (carousel && TRANSITIONEND) {
      var eve = {};
      eve[TRANSITIONEND] = onTransitionEnd;
      (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(container, eve);
    }

    if (touch) {
      (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(container, touchEvents);
    }

    if (mouseDrag) {
      (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(container, dragEvents);
    } // cache Object values in options && reset HTML


    var htmlList = [containerHTML, controlsContainerHTML, prevButtonHTML, nextButtonHTML, navContainerHTML, autoplayButtonHTML];
    tnsList.forEach(function (item, i) {
      var el = item === "container" ? outerWrapper : options[item];

      if (typeof el === "object" && el) {
        var prevEl = el.previousElementSibling ? el.previousElementSibling : false,
            parentEl = el.parentNode;
        el.outerHTML = htmlList[i];
        options[item] = prevEl ? prevEl.nextElementSibling : parentEl.firstElementChild;
      }
    }); // reset variables

    tnsList = animateIn = animateOut = animateDelay = animateNormal = horizontal = outerWrapper = innerWrapper = container = containerParent = containerHTML = slideItems = slideCount = breakpointZone = windowWidth = autoWidth = fixedWidth = edgePadding = gutter = viewport = items = slideBy = viewportMax = arrowKeys = speed = rewind = loop = autoHeight = sheet = lazyload = slidePositions = slideItemsOut = cloneCount = slideCountNew = hasRightDeadZone = rightBoundary = updateIndexBeforeTransform = transformAttr = transformPrefix = transformPostfix = getIndexMax = index = indexCached = indexMin = indexMax = resizeTimer = swipeAngle = moveDirectionExpected = running = onInit = events = newContainerClasses = slideId = disable = disabled = freezable = freeze = frozen = controlsEvents = navEvents = hoverEvents = visibilityEvent = docmentKeydownEvent = touchEvents = dragEvents = hasControls = hasNav = navAsThumbnails = hasAutoplay = hasTouch = hasMouseDrag = slideActiveClass = imgCompleteClass = imgEvents = imgsComplete = controls = controlsText = controlsContainer = controlsContainerHTML = prevButton = nextButton = prevIsButton = nextIsButton = nav = navContainer = navContainerHTML = navItems = pages = pagesCached = navClicked = navCurrentIndex = navCurrentIndexCached = navActiveClass = navStr = navStrCurrent = autoplay = autoplayTimeout = autoplayDirection = autoplayText = autoplayHoverPause = autoplayButton = autoplayButtonHTML = autoplayResetOnVisibility = autoplayHtmlStrings = autoplayTimer = animating = autoplayHoverPaused = autoplayUserPaused = autoplayVisibilityPaused = initPosition = lastPosition = translateInit = disX = disY = panStart = rafIndex = getDist = touch = mouseDrag = null; // check variables
    // [animateIn, animateOut, animateDelay, animateNormal, horizontal, outerWrapper, innerWrapper, container, containerParent, containerHTML, slideItems, slideCount, breakpointZone, windowWidth, autoWidth, fixedWidth, edgePadding, gutter, viewport, items, slideBy, viewportMax, arrowKeys, speed, rewind, loop, autoHeight, sheet, lazyload, slidePositions, slideItemsOut, cloneCount, slideCountNew, hasRightDeadZone, rightBoundary, updateIndexBeforeTransform, transformAttr, transformPrefix, transformPostfix, getIndexMax, index, indexCached, indexMin, indexMax, resizeTimer, swipeAngle, moveDirectionExpected, running, onInit, events, newContainerClasses, slideId, disable, disabled, freezable, freeze, frozen, controlsEvents, navEvents, hoverEvents, visibilityEvent, docmentKeydownEvent, touchEvents, dragEvents, hasControls, hasNav, navAsThumbnails, hasAutoplay, hasTouch, hasMouseDrag, slideActiveClass, imgCompleteClass, imgEvents, imgsComplete, controls, controlsText, controlsContainer, controlsContainerHTML, prevButton, nextButton, prevIsButton, nextIsButton, nav, navContainer, navContainerHTML, navItems, pages, pagesCached, navClicked, navCurrentIndex, navCurrentIndexCached, navActiveClass, navStr, navStrCurrent, autoplay, autoplayTimeout, autoplayDirection, autoplayText, autoplayHoverPause, autoplayButton, autoplayButtonHTML, autoplayResetOnVisibility, autoplayHtmlStrings, autoplayTimer, animating, autoplayHoverPaused, autoplayUserPaused, autoplayVisibilityPaused, initPosition, lastPosition, translateInit, disX, disY, panStart, rafIndex, getDist, touch, mouseDrag ].forEach(function(item) { if (item !== null) { console.log(item); } });

    for (var a in this) {
      if (a !== "rebuild") {
        this[a] = null;
      }
    }

    isOn = false;
  } // === ON RESIZE ===
  // responsive || fixedWidth || autoWidth || !horizontal


  function onResize(e) {
    (0,_helpers_raf_js__WEBPACK_IMPORTED_MODULE_0__.raf)(function () {
      resizeTasks(getEvent(e));
    });
  }

  function resizeTasks(e) {
    if (!isOn) {
      return;
    }

    if (nested === "outer") {
      events.emit("outerResized", info(e));
    }

    windowWidth = getWindowWidth();
    var bpChanged,
        breakpointZoneTem = breakpointZone,
        needContainerTransform = false;

    if (responsive) {
      setBreakpointZone();
      bpChanged = breakpointZoneTem !== breakpointZone; // if (hasRightDeadZone) { needContainerTransform = true; } // *?

      if (bpChanged) {
        events.emit("newBreakpointStart", info(e));
      }
    }

    var indChanged,
        itemsChanged,
        itemsTem = items,
        disableTem = disable,
        freezeTem = freeze,
        arrowKeysTem = arrowKeys,
        controlsTem = controls,
        navTem = nav,
        touchTem = touch,
        mouseDragTem = mouseDrag,
        autoplayTem = autoplay,
        autoplayHoverPauseTem = autoplayHoverPause,
        autoplayResetOnVisibilityTem = autoplayResetOnVisibility,
        indexTem = index;

    if (bpChanged) {
      var fixedWidthTem = fixedWidth,
          autoHeightTem = autoHeight,
          controlsTextTem = controlsText,
          centerTem = center,
          autoplayTextTem = autoplayText;

      if (!CSSMQ) {
        var gutterTem = gutter,
            edgePaddingTem = edgePadding;
      }
    } // get option:
    // fixed width: viewport, fixedWidth, gutter => items
    // others: window width => all variables
    // all: items => slideBy


    arrowKeys = getOption("arrowKeys");
    controls = getOption("controls");
    nav = getOption("nav");
    touch = getOption("touch");
    center = getOption("center");
    mouseDrag = getOption("mouseDrag");
    autoplay = getOption("autoplay");
    autoplayHoverPause = getOption("autoplayHoverPause");
    autoplayResetOnVisibility = getOption("autoplayResetOnVisibility");

    if (bpChanged) {
      disable = getOption("disable");
      fixedWidth = getOption("fixedWidth");
      speed = getOption("speed");
      autoHeight = getOption("autoHeight");
      controlsText = getOption("controlsText");
      autoplayText = getOption("autoplayText");
      autoplayTimeout = getOption("autoplayTimeout");

      if (!CSSMQ) {
        edgePadding = getOption("edgePadding");
        gutter = getOption("gutter");
      }
    } // update options


    resetVariblesWhenDisable(disable);
    viewport = getViewportWidth(); // <= edgePadding, gutter

    if ((!horizontal || autoWidth) && !disable) {
      setSlidePositions();

      if (!horizontal) {
        updateContentWrapperHeight(); // <= setSlidePositions

        needContainerTransform = true;
      }
    }

    if (fixedWidth || autoWidth) {
      rightBoundary = getRightBoundary(); // autoWidth: <= viewport, slidePositions, gutter
      // fixedWidth: <= viewport, fixedWidth, gutter

      indexMax = getIndexMax(); // autoWidth: <= rightBoundary, slidePositions
      // fixedWidth: <= rightBoundary, fixedWidth, gutter
    }

    if (bpChanged || fixedWidth) {
      items = getOption("items");
      slideBy = getOption("slideBy");
      itemsChanged = items !== itemsTem;

      if (itemsChanged) {
        if (!fixedWidth && !autoWidth) {
          indexMax = getIndexMax();
        } // <= items
        // check index before transform in case
        // slider reach the right edge then items become bigger


        updateIndex();
      }
    }

    if (bpChanged) {
      if (disable !== disableTem) {
        if (disable) {
          disableSlider();
        } else {
          enableSlider(); // <= slidePositions, rightBoundary, indexMax
        }
      }
    }

    if (freezable && (bpChanged || fixedWidth || autoWidth)) {
      freeze = getFreeze(); // <= autoWidth: slidePositions, gutter, viewport, rightBoundary
      // <= fixedWidth: fixedWidth, gutter, rightBoundary
      // <= others: items

      if (freeze !== freezeTem) {
        if (freeze) {
          doContainerTransform(getContainerTransformValue(getStartIndex(0)));
          freezeSlider();
        } else {
          unfreezeSlider();
          needContainerTransform = true;
        }
      }
    }

    resetVariblesWhenDisable(disable || freeze); // controls, nav, touch, mouseDrag, arrowKeys, autoplay, autoplayHoverPause, autoplayResetOnVisibility

    if (!autoplay) {
      autoplayHoverPause = autoplayResetOnVisibility = false;
    }

    if (arrowKeys !== arrowKeysTem) {
      arrowKeys ? (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(doc, docmentKeydownEvent) : (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(doc, docmentKeydownEvent);
    }

    if (controls !== controlsTem) {
      if (controls) {
        if (controlsContainer) {
          (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(controlsContainer);
        } else {
          if (prevButton) {
            (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(prevButton);
          }

          if (nextButton) {
            (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(nextButton);
          }
        }
      } else {
        if (controlsContainer) {
          (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(controlsContainer);
        } else {
          if (prevButton) {
            (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(prevButton);
          }

          if (nextButton) {
            (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(nextButton);
          }
        }
      }
    }

    if (nav !== navTem) {
      if (nav) {
        (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(navContainer);
        updateNavVisibility();
      } else {
        (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(navContainer);
      }
    }

    if (touch !== touchTem) {
      touch ? (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(container, touchEvents, options.preventScrollOnTouch) : (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(container, touchEvents);
    }

    if (mouseDrag !== mouseDragTem) {
      mouseDrag ? (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(container, dragEvents) : (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(container, dragEvents);
    }

    if (autoplay !== autoplayTem) {
      if (autoplay) {
        if (autoplayButton) {
          (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(autoplayButton);
        }

        if (!animating && !autoplayUserPaused) {
          startAutoplay();
        }
      } else {
        if (autoplayButton) {
          (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(autoplayButton);
        }

        if (animating) {
          stopAutoplay();
        }
      }
    }

    if (autoplayHoverPause !== autoplayHoverPauseTem) {
      autoplayHoverPause ? (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(container, hoverEvents) : (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(container, hoverEvents);
    }

    if (autoplayResetOnVisibility !== autoplayResetOnVisibilityTem) {
      autoplayResetOnVisibility ? (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(doc, visibilityEvent) : (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(doc, visibilityEvent);
    }

    if (bpChanged) {
      if (fixedWidth !== fixedWidthTem || center !== centerTem) {
        needContainerTransform = true;
      }

      if (autoHeight !== autoHeightTem) {
        if (!autoHeight) {
          innerWrapper.style.height = "";
        }
      }

      if (controls && controlsText !== controlsTextTem) {
        prevButton.innerHTML = controlsText[0];
        nextButton.innerHTML = controlsText[1];
      }

      if (autoplayButton && autoplayText !== autoplayTextTem) {
        var i = autoplay ? 1 : 0,
            html = autoplayButton.innerHTML,
            len = html.length - autoplayTextTem[i].length;

        if (html.substring(len) === autoplayTextTem[i]) {
          autoplayButton.innerHTML = html.substring(0, len) + autoplayText[i];
        }
      }
    } else {
      if (center && (fixedWidth || autoWidth)) {
        needContainerTransform = true;
      }
    }

    if (itemsChanged || fixedWidth && !autoWidth) {
      pages = getPages();
      updateNavVisibility();
    }

    indChanged = index !== indexTem;

    if (indChanged) {
      events.emit("indexChanged", info());
      needContainerTransform = true;
    } else if (itemsChanged) {
      if (!indChanged) {
        additionalUpdates();
      }
    } else if (fixedWidth || autoWidth) {
      doLazyLoad();
      updateSlideStatus();
      updateLiveRegion();
    }

    if (itemsChanged && !carousel) {
      updateGallerySlidePositions();
    }

    if (!disable && !freeze) {
      // non-mediaqueries: IE8
      if (bpChanged && !CSSMQ) {
        // middle wrapper styles
        // inner wrapper styles
        if (edgePadding !== edgePaddingTem || gutter !== gutterTem) {
          innerWrapper.style.cssText = getInnerWrapperStyles(edgePadding, gutter, fixedWidth, speed, autoHeight);
        }

        if (horizontal) {
          // container styles
          if (carousel) {
            container.style.width = getContainerWidth(fixedWidth, gutter, items);
          } // slide styles


          var str = getSlideWidthStyle(fixedWidth, gutter, items) + getSlideGutterStyle(gutter); // remove the last line and
          // add new styles

          (0,_helpers_removeCSSRule_js__WEBPACK_IMPORTED_MODULE_11__.removeCSSRule)(sheet, (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet) - 1);
          (0,_helpers_addCSSRule_js__WEBPACK_IMPORTED_MODULE_10__.addCSSRule)(sheet, "#" + slideId + " > .tns-item", str, (0,_helpers_getCssRulesLength_js__WEBPACK_IMPORTED_MODULE_12__.getCssRulesLength)(sheet));
        }
      } // auto height


      if (autoHeight) {
        doAutoHeight();
      }

      if (needContainerTransform) {
        doContainerTransformSilent();
        indexCached = index;
      }
    }

    if (bpChanged) {
      events.emit("newBreakpointEnd", info(e));
    }
  } // === INITIALIZATION FUNCTIONS === //


  function getFreeze() {
    if (!fixedWidth && !autoWidth) {
      var a = center ? items - (items - 1) / 2 : items;
      return slideCount <= a;
    }

    var width = fixedWidth ? (fixedWidth + gutter) * slideCount : slidePositions[slideCount],
        vp = edgePadding ? viewport + edgePadding * 2 : viewport + gutter;

    if (center) {
      vp -= fixedWidth ? (viewport - fixedWidth) / 2 : (viewport - (slidePositions[index + 1] - slidePositions[index] - gutter)) / 2;
    }

    return width <= vp;
  }

  function setBreakpointZone() {
    breakpointZone = 0;

    for (var bp in responsive) {
      bp = parseInt(bp); // convert string to number

      if (windowWidth >= bp) {
        breakpointZone = bp;
      }
    }
  } // (slideBy, indexMin, indexMax) => index


  var updateIndex = function () {
    return loop ? carousel ? // loop + carousel
    function () {
      var leftEdge = indexMin,
          rightEdge = indexMax;
      leftEdge += slideBy;
      rightEdge -= slideBy; // adjust edges when has edge paddings
      // or fixed-width slider with extra space on the right side

      if (edgePadding) {
        leftEdge += 1;
        rightEdge -= 1;
      } else if (fixedWidth) {
        if ((viewport + gutter) % (fixedWidth + gutter)) {
          rightEdge -= 1;
        }
      }

      if (cloneCount) {
        if (index > rightEdge) {
          index -= slideCount;
        } else if (index < leftEdge) {
          index += slideCount;
        }
      }
    } : // loop + gallery
    function () {
      if (index > indexMax) {
        while (index >= indexMin + slideCount) {
          index -= slideCount;
        }
      } else if (index < indexMin) {
        while (index <= indexMax - slideCount) {
          index += slideCount;
        }
      }
    } : // non-loop
    function () {
      index = Math.max(indexMin, Math.min(indexMax, index));
    };
  }();

  function disableUI() {
    if (!autoplay && autoplayButton) {
      (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(autoplayButton);
    }

    if (!nav && navContainer) {
      (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(navContainer);
    }

    if (!controls) {
      if (controlsContainer) {
        (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(controlsContainer);
      } else {
        if (prevButton) {
          (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(prevButton);
        }

        if (nextButton) {
          (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(nextButton);
        }
      }
    }
  }

  function enableUI() {
    if (autoplay && autoplayButton) {
      (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(autoplayButton);
    }

    if (nav && navContainer) {
      (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(navContainer);
    }

    if (controls) {
      if (controlsContainer) {
        (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(controlsContainer);
      } else {
        if (prevButton) {
          (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(prevButton);
        }

        if (nextButton) {
          (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(nextButton);
        }
      }
    }
  }

  function freezeSlider() {
    if (frozen) {
      return;
    } // remove edge padding from inner wrapper


    if (edgePadding) {
      innerWrapper.style.margin = "0px";
    } // add class tns-transparent to cloned slides


    if (cloneCount) {
      var str = "tns-transparent";

      for (var i = cloneCount; i--;) {
        if (carousel) {
          (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(slideItems[i], str);
        }

        (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(slideItems[slideCountNew - i - 1], str);
      }
    } // update tools


    disableUI();
    frozen = true;
  }

  function unfreezeSlider() {
    if (!frozen) {
      return;
    } // restore edge padding for inner wrapper
    // for mordern browsers


    if (edgePadding && CSSMQ) {
      innerWrapper.style.margin = "";
    } // remove class tns-transparent to cloned slides


    if (cloneCount) {
      var str = "tns-transparent";

      for (var i = cloneCount; i--;) {
        if (carousel) {
          (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(slideItems[i], str);
        }

        (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(slideItems[slideCountNew - i - 1], str);
      }
    } // update tools


    enableUI();
    frozen = false;
  }

  function disableSlider() {
    if (disabled) {
      return;
    }

    sheet.disabled = true;
    container.className = container.className.replace(newContainerClasses.substring(1), "");
    (0,_helpers_removeAttrs_js__WEBPACK_IMPORTED_MODULE_22__.removeAttrs)(container, ["style"]);

    if (loop) {
      for (var j = cloneCount; j--;) {
        if (carousel) {
          (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(slideItems[j]);
        }

        (0,_helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement)(slideItems[slideCountNew - j - 1]);
      }
    } // vertical slider


    if (!horizontal || !carousel) {
      (0,_helpers_removeAttrs_js__WEBPACK_IMPORTED_MODULE_22__.removeAttrs)(innerWrapper, ["style"]);
    } // gallery


    if (!carousel) {
      for (var i = index, l = index + slideCount; i < l; i++) {
        var item = slideItems[i];
        (0,_helpers_removeAttrs_js__WEBPACK_IMPORTED_MODULE_22__.removeAttrs)(item, ["style"]);
        (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(item, animateIn);
        (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(item, animateNormal);
      }
    } // update tools


    disableUI();
    disabled = true;
  }

  function enableSlider() {
    if (!disabled) {
      return;
    }

    sheet.disabled = false;
    container.className += newContainerClasses;
    doContainerTransformSilent();

    if (loop) {
      for (var j = cloneCount; j--;) {
        if (carousel) {
          (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(slideItems[j]);
        }

        (0,_helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement)(slideItems[slideCountNew - j - 1]);
      }
    } // gallery


    if (!carousel) {
      for (var i = index, l = index + slideCount; i < l; i++) {
        var item = slideItems[i],
            classN = i < index + items ? animateIn : animateNormal;
        item.style.left = (i - index) * 100 / items + "%";
        (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, classN);
      }
    } // update tools


    enableUI();
    disabled = false;
  }

  function updateLiveRegion() {
    var str = getLiveRegionStr();

    if (liveregionCurrent.innerHTML !== str) {
      liveregionCurrent.innerHTML = str;
    }
  }

  function getLiveRegionStr() {
    var arr = getVisibleSlideRange(),
        start = arr[0] + 1,
        end = arr[1] + 1;
    return start === end ? start + "" : start + " to " + end;
  }

  function getVisibleSlideRange(val) {
    if (val == null) {
      val = getContainerTransformValue();
    }

    var start = index,
        end,
        rangestart,
        rangeend; // get range start, range end for autoWidth and fixedWidth

    if (center || edgePadding) {
      if (autoWidth || fixedWidth) {
        rangestart = -(parseFloat(val) + edgePadding);
        rangeend = rangestart + viewport + edgePadding * 2;
      }
    } else {
      if (autoWidth) {
        rangestart = slidePositions[index];
        rangeend = rangestart + viewport;
      }
    } // get start, end
    // - check auto width


    if (autoWidth) {
      slidePositions.forEach(function (point, i) {
        if (i < slideCountNew) {
          if ((center || edgePadding) && point <= rangestart + 0.5) {
            start = i;
          }

          if (rangeend - point >= 0.5) {
            end = i;
          }
        }
      }); // - check percentage width, fixed width
    } else {
      if (fixedWidth) {
        var cell = fixedWidth + gutter;

        if (center || edgePadding) {
          start = Math.floor(rangestart / cell);
          end = Math.ceil(rangeend / cell - 1);
        } else {
          end = start + Math.ceil(viewport / cell) - 1;
        }
      } else {
        if (center || edgePadding) {
          var a = items - 1;

          if (center) {
            start -= a / 2;
            end = index + a / 2;
          } else {
            end = index + a;
          }

          if (edgePadding) {
            var b = edgePadding * items / viewport;
            start -= b;
            end += b;
          }

          start = Math.floor(start);
          end = Math.ceil(end);
        } else {
          end = start + items - 1;
        }
      }

      start = Math.max(start, 0);
      end = Math.min(end, slideCountNew - 1);
    }

    return [start, end];
  }

  function doLazyLoad() {
    if (lazyload && !disable) {
      var arg = getVisibleSlideRange();
      arg.push(lazyloadSelector);
      getImageArray.apply(null, arg).forEach(function (img) {
        if (!(0,_helpers_hasClass_js__WEBPACK_IMPORTED_MODULE_16__.hasClass)(img, imgCompleteClass)) {
          // stop propagation transitionend event to container
          var eve = {};

          eve[TRANSITIONEND] = function (e) {
            e.stopPropagation();
          };

          (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(img, eve);
          (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(img, imgEvents); // update src

          img.src = (0,_helpers_getAttr_js__WEBPACK_IMPORTED_MODULE_20__.getAttr)(img, "data-src"); // update srcset

          var srcset = (0,_helpers_getAttr_js__WEBPACK_IMPORTED_MODULE_20__.getAttr)(img, "data-srcset");

          if (srcset) {
            img.srcset = srcset;
          }

          (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(img, "loading");
        }
      });
    }
  }

  function onImgLoaded(e) {
    imgLoaded(getTarget(e));
  }

  function onImgFailed(e) {
    imgFailed(getTarget(e));
  }

  function imgLoaded(img) {
    (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(img, "loaded");
    imgCompleted(img);
  }

  function imgFailed(img) {
    (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(img, "failed");
    imgCompleted(img);
  }

  function imgCompleted(img) {
    (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(img, imgCompleteClass);
    (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(img, "loading");
    (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(img, imgEvents);
  }

  function getImageArray(start, end, imgSelector) {
    var imgs = [];

    if (!imgSelector) {
      imgSelector = "img";
    }

    while (start <= end) {
      (0,_helpers_forEach_js__WEBPACK_IMPORTED_MODULE_15__.forEach)(slideItems[start].querySelectorAll(imgSelector), function (img) {
        imgs.push(img);
      });
      start++;
    }

    return imgs;
  } // check if all visible images are loaded
  // and update container height if it's done


  function doAutoHeight() {
    var imgs = getImageArray.apply(null, getVisibleSlideRange());
    (0,_helpers_raf_js__WEBPACK_IMPORTED_MODULE_0__.raf)(function () {
      imgsLoadedCheck(imgs, updateInnerWrapperHeight);
    });
  }

  function imgsLoadedCheck(imgs, cb) {
    // execute callback function if all images are complete
    if (imgsComplete) {
      return cb();
    } // check image classes


    imgs.forEach(function (img, index) {
      if (!lazyload && img.complete) {
        imgCompleted(img);
      } // Check image.complete


      if ((0,_helpers_hasClass_js__WEBPACK_IMPORTED_MODULE_16__.hasClass)(img, imgCompleteClass)) {
        imgs.splice(index, 1);
      }
    }); // execute callback function if selected images are all complete

    if (!imgs.length) {
      return cb();
    } // otherwise execute this functiona again


    (0,_helpers_raf_js__WEBPACK_IMPORTED_MODULE_0__.raf)(function () {
      imgsLoadedCheck(imgs, cb);
    });
  }

  function additionalUpdates() {
    doLazyLoad();
    updateSlideStatus();
    updateLiveRegion();
    updateControlsStatus();
    updateNavStatus();
  }

  function update_carousel_transition_duration() {
    if (carousel && autoHeight) {
      middleWrapper.style[TRANSITIONDURATION] = speed / 1000 + "s";
    }
  }

  function getMaxSlideHeight(slideStart, slideRange) {
    var heights = [];

    for (var i = slideStart, l = Math.min(slideStart + slideRange, slideCountNew); i < l; i++) {
      heights.push(slideItems[i].offsetHeight);
    }

    return Math.max.apply(null, heights);
  } // update inner wrapper height
  // 1. get the max-height of the visible slides
  // 2. set transitionDuration to speed
  // 3. update inner wrapper height to max-height
  // 4. set transitionDuration to 0s after transition done


  function updateInnerWrapperHeight() {
    var maxHeight = autoHeight ? getMaxSlideHeight(index, items) : getMaxSlideHeight(cloneCount, slideCount),
        wp = middleWrapper ? middleWrapper : innerWrapper;

    if (wp.style.height !== maxHeight) {
      wp.style.height = maxHeight + "px";
    }
  } // get the distance from the top edge of the first slide to each slide
  // (init) => slidePositions


  function setSlidePositions() {
    slidePositions = [0];
    var attr = horizontal ? "left" : "top",
        attr2 = horizontal ? "right" : "bottom",
        base = slideItems[0].getBoundingClientRect()[attr];
    (0,_helpers_forEach_js__WEBPACK_IMPORTED_MODULE_15__.forEach)(slideItems, function (item, i) {
      // skip the first slide
      if (i) {
        slidePositions.push(item.getBoundingClientRect()[attr] - base);
      } // add the end edge


      if (i === slideCountNew - 1) {
        slidePositions.push(item.getBoundingClientRect()[attr2] - base);
      }
    });
  } // update slide


  function updateSlideStatus() {
    var range = getVisibleSlideRange(),
        start = range[0],
        end = range[1];
    (0,_helpers_forEach_js__WEBPACK_IMPORTED_MODULE_15__.forEach)(slideItems, function (item, i) {
      // show slides
      if (i >= start && i <= end) {
        if ((0,_helpers_hasAttr_js__WEBPACK_IMPORTED_MODULE_19__.hasAttr)(item, "aria-hidden")) {
          (0,_helpers_removeAttrs_js__WEBPACK_IMPORTED_MODULE_22__.removeAttrs)(item, ["aria-hidden", "tabindex"]);
          (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, slideActiveClass);
        } // hide slides

      } else {
        if (!(0,_helpers_hasAttr_js__WEBPACK_IMPORTED_MODULE_19__.hasAttr)(item, "aria-hidden")) {
          (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(item, {
            "aria-hidden": "true",
            tabindex: "-1"
          });
          (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(item, slideActiveClass);
        }
      }
    });
  } // gallery: update slide position


  function updateGallerySlidePositions() {
    var l = index + Math.min(slideCount, items);

    for (var i = slideCountNew; i--;) {
      var item = slideItems[i];

      if (i >= index && i < l) {
        // add transitions to visible slides when adjusting their positions
        (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, "tns-moving");
        item.style.left = (i - index) * 100 / items + "%";
        (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, animateIn);
        (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(item, animateNormal);
      } else if (item.style.left) {
        item.style.left = "";
        (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, animateNormal);
        (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(item, animateIn);
      } // remove outlet animation


      (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(item, animateOut);
    } // removing '.tns-moving'


    setTimeout(function () {
      (0,_helpers_forEach_js__WEBPACK_IMPORTED_MODULE_15__.forEach)(slideItems, function (el) {
        (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(el, "tns-moving");
      });
    }, 300);
  } // set tabindex on Nav


  function updateNavStatus() {
    // get current nav
    if (nav) {
      navCurrentIndex = navClicked >= 0 ? navClicked : getCurrentNavIndex();
      navClicked = -1;

      if (navCurrentIndex !== navCurrentIndexCached) {
        var navPrev = navItems[navCurrentIndexCached],
            navCurrent = navItems[navCurrentIndex];
        (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(navPrev, {
          tabindex: "-1",
          "aria-label": navStr + (navCurrentIndexCached + 1)
        });
        (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(navPrev, navActiveClass);
        (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(navCurrent, {
          "aria-label": navStr + (navCurrentIndex + 1) + navStrCurrent
        });
        (0,_helpers_removeAttrs_js__WEBPACK_IMPORTED_MODULE_22__.removeAttrs)(navCurrent, "tabindex");
        (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(navCurrent, navActiveClass);
        navCurrentIndexCached = navCurrentIndex;
      }
    }
  }

  function getLowerCaseNodeName(el) {
    return el.nodeName.toLowerCase();
  }

  function isButton(el) {
    return getLowerCaseNodeName(el) === "button";
  }

  function isAriaDisabled(el) {
    return el.getAttribute("aria-disabled") === "true";
  }

  function disEnableElement(isButton, el, val) {
    if (isButton) {
      el.disabled = val;
    } else {
      el.setAttribute("aria-disabled", val.toString());
    }
  } // set 'disabled' to true on controls when reach the edges


  function updateControlsStatus() {
    if (!controls || rewind || loop) {
      return;
    }

    var prevDisabled = prevIsButton ? prevButton.disabled : isAriaDisabled(prevButton),
        nextDisabled = nextIsButton ? nextButton.disabled : isAriaDisabled(nextButton),
        disablePrev = index <= indexMin ? true : false,
        disableNext = !rewind && index >= indexMax ? true : false;

    if (disablePrev && !prevDisabled) {
      disEnableElement(prevIsButton, prevButton, true);
    }

    if (!disablePrev && prevDisabled) {
      disEnableElement(prevIsButton, prevButton, false);
    }

    if (disableNext && !nextDisabled) {
      disEnableElement(nextIsButton, nextButton, true);
    }

    if (!disableNext && nextDisabled) {
      disEnableElement(nextIsButton, nextButton, false);
    }
  } // set duration


  function resetDuration(el, str) {
    if (TRANSITIONDURATION) {
      el.style[TRANSITIONDURATION] = str;
    }
  }

  function getSliderWidth() {
    return fixedWidth ? (fixedWidth + gutter) * slideCountNew : slidePositions[slideCountNew];
  }

  function getCenterGap(num) {
    if (num == null) {
      num = index;
    }

    var gap = edgePadding ? gutter : 0;
    return autoWidth ? (viewport - gap - (slidePositions[num + 1] - slidePositions[num] - gutter)) / 2 : fixedWidth ? (viewport - fixedWidth) / 2 : (items - 1) / 2;
  }

  function getRightBoundary() {
    var gap = edgePadding ? gutter : 0,
        result = viewport + gap - getSliderWidth();

    if (center && !loop) {
      result = fixedWidth ? -(fixedWidth + gutter) * (slideCountNew - 1) - getCenterGap() : getCenterGap(slideCountNew - 1) - slidePositions[slideCountNew - 1];
    }

    if (result > 0) {
      result = 0;
    }

    return result;
  }

  function getContainerTransformValue(num) {
    if (num == null) {
      num = index;
    }

    var val;

    if (horizontal && !autoWidth) {
      if (fixedWidth) {
        val = -(fixedWidth + gutter) * num;

        if (center) {
          val += getCenterGap();
        }
      } else {
        var denominator = TRANSFORM ? slideCountNew : items;

        if (center) {
          num -= getCenterGap();
        }

        val = -num * 100 / denominator;
      }
    } else {
      val = -slidePositions[num];

      if (center && autoWidth) {
        val += getCenterGap();
      }
    }

    if (hasRightDeadZone) {
      val = Math.max(val, rightBoundary);
    }

    val += horizontal && !autoWidth && !fixedWidth ? "%" : "px";
    return val;
  }

  function doContainerTransformSilent(val) {
    resetDuration(container, "0s");
    doContainerTransform(val);
  }

  function doContainerTransform(val) {
    if (val == null) {
      val = getContainerTransformValue();
    }

    container.style[transformAttr] = transformPrefix + val + transformPostfix;
  }

  function animateSlide(number, classOut, classIn, isOut) {
    var l = number + items;

    if (!loop) {
      l = Math.min(l, slideCountNew);
    }

    for (var i = number; i < l; i++) {
      var item = slideItems[i]; // set item positions

      if (!isOut) {
        item.style.left = (i - index) * 100 / items + "%";
      }

      if (animateDelay && TRANSITIONDELAY) {
        item.style[TRANSITIONDELAY] = item.style[ANIMATIONDELAY] = animateDelay * (i - number) / 1000 + "s";
      }

      (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(item, classOut);
      (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, classIn);

      if (isOut) {
        slideItemsOut.push(item);
      }
    }
  } // make transfer after click/drag:
  // 1. change 'transform' property for mordern browsers
  // 2. change 'left' property for legacy browsers


  var transformCore = function () {
    return carousel ? function () {
      resetDuration(container, "");

      if (TRANSITIONDURATION || !speed) {
        // for morden browsers with non-zero duration or
        // zero duration for all browsers
        doContainerTransform(); // run fallback function manually
        // when duration is 0 / container is hidden

        if (!speed || !(0,_helpers_isVisible_js__WEBPACK_IMPORTED_MODULE_26__.isVisible)(container)) {
          onTransitionEnd();
        }
      } else {
        // for old browser with non-zero duration
        (0,_helpers_jsTransform_js__WEBPACK_IMPORTED_MODULE_33__.jsTransform)(container, transformAttr, transformPrefix, transformPostfix, getContainerTransformValue(), speed, onTransitionEnd);
      }

      if (!horizontal) {
        updateContentWrapperHeight();
      }
    } : function () {
      slideItemsOut = [];
      var eve = {};
      eve[TRANSITIONEND] = eve[ANIMATIONEND] = onTransitionEnd;
      (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(slideItems[indexCached], eve);
      (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(slideItems[index], eve);
      animateSlide(indexCached, animateIn, animateOut, true);
      animateSlide(index, animateNormal, animateIn); // run fallback function manually
      // when transition or animation not supported / duration is 0

      if (!TRANSITIONEND || !ANIMATIONEND || !speed || !(0,_helpers_isVisible_js__WEBPACK_IMPORTED_MODULE_26__.isVisible)(container)) {
        onTransitionEnd();
      }
    };
  }();

  function render(e, sliderMoved) {
    if (updateIndexBeforeTransform) {
      updateIndex();
    } // render when slider was moved (touch or drag) even though index may not change


    if (index !== indexCached || sliderMoved) {
      // events
      events.emit("indexChanged", info());
      events.emit("transitionStart", info());

      if (autoHeight) {
        doAutoHeight();
      } // pause autoplay when click or keydown from user


      if (animating && e && ["click", "keydown"].indexOf(e.type) >= 0) {
        stopAutoplay();
      }

      running = true;
      transformCore();
    }
  }
  /*
   * Transfer prefixed properties to the same format
   * CSS: -Webkit-Transform => webkittransform
   * JS: WebkitTransform => webkittransform
   * @param {string} str - property
   *
   */


  function strTrans(str) {
    return str.toLowerCase().replace(/-/g, "");
  } // AFTER TRANSFORM
  // Things need to be done after a transfer:
  // 1. check index
  // 2. add classes to visible slide
  // 3. disable controls buttons when reach the first/last slide in non-loop slider
  // 4. update nav status
  // 5. lazyload images
  // 6. update container height


  function onTransitionEnd(event) {
    // check running on gallery mode
    // make sure trantionend/animationend events run only once
    if (carousel || running) {
      events.emit("transitionEnd", info(event));

      if (!carousel && slideItemsOut.length > 0) {
        for (var i = 0; i < slideItemsOut.length; i++) {
          var item = slideItemsOut[i]; // set item positions

          item.style.left = "";

          if (ANIMATIONDELAY && TRANSITIONDELAY) {
            item.style[ANIMATIONDELAY] = "";
            item.style[TRANSITIONDELAY] = "";
          }

          (0,_helpers_removeClass_js__WEBPACK_IMPORTED_MODULE_18__.removeClass)(item, animateOut);
          (0,_helpers_addClass_js__WEBPACK_IMPORTED_MODULE_17__.addClass)(item, animateNormal);
        }
      }
      /* update slides, nav, controls after checking ...
       * => legacy browsers who don't support 'event'
       *    have to check event first, otherwise event.target will cause an error
       * => or 'gallery' mode:
       *   + event target is slide item
       * => or 'carousel' mode:
       *   + event target is container,
       *   + event.property is the same with transform attribute
       */


      if (!event || !carousel && event.target.parentNode === container || event.target === container && strTrans(event.propertyName) === strTrans(transformAttr)) {
        if (!updateIndexBeforeTransform) {
          var indexTem = index;
          updateIndex();

          if (index !== indexTem) {
            events.emit("indexChanged", info());
            doContainerTransformSilent();
          }
        }

        if (nested === "inner") {
          events.emit("innerLoaded", info());
        }

        running = false;
        indexCached = index;
      }
    }
  } // # ACTIONS


  function goTo(targetIndex, e) {
    if (freeze) {
      return;
    } // prev slideBy


    if (targetIndex === "prev") {
      onControlsClick(e, -1); // next slideBy
    } else if (targetIndex === "next") {
      onControlsClick(e, 1); // go to exact slide
    } else {
      if (running) {
        if (preventActionWhenRunning) {
          return;
        } else {
          onTransitionEnd();
        }
      }

      var absIndex = getAbsIndex(),
          indexGap = 0;

      if (targetIndex === "first") {
        indexGap = -absIndex;
      } else if (targetIndex === "last") {
        indexGap = carousel ? slideCount - items - absIndex : slideCount - 1 - absIndex;
      } else {
        if (typeof targetIndex !== "number") {
          targetIndex = parseInt(targetIndex);
        }

        if (!isNaN(targetIndex)) {
          // from directly called goTo function
          if (!e) {
            targetIndex = Math.max(0, Math.min(slideCount - 1, targetIndex));
          }

          indexGap = targetIndex - absIndex;
        }
      } // gallery: make sure new page won't overlap with current page


      if (!carousel && indexGap && Math.abs(indexGap) < items) {
        var factor = indexGap > 0 ? 1 : -1;
        indexGap += index + indexGap - slideCount >= indexMin ? slideCount * factor : slideCount * 2 * factor * -1;
      }

      index += indexGap; // make sure index is in range

      if (carousel && loop) {
        if (index < indexMin) {
          index += slideCount;
        }

        if (index > indexMax) {
          index -= slideCount;
        }
      } // if index is changed, start rendering


      if (getAbsIndex(index) !== getAbsIndex(indexCached)) {
        render(e);
      }
    }
  } // on controls click


  function onControlsClick(e, dir) {
    if (running) {
      if (preventActionWhenRunning) {
        return;
      } else {
        onTransitionEnd();
      }
    }

    var passEventObject;

    if (!dir) {
      e = getEvent(e);
      var target = getTarget(e);

      while (target !== controlsContainer && [prevButton, nextButton].indexOf(target) < 0) {
        target = target.parentNode;
      }

      var targetIn = [prevButton, nextButton].indexOf(target);

      if (targetIn >= 0) {
        passEventObject = true;
        dir = targetIn === 0 ? -1 : 1;
      }
    }

    if (rewind) {
      if (index === indexMin && dir === -1) {
        goTo("last", e);
        return;
      } else if (index === indexMax && dir === 1) {
        goTo("first", e);
        return;
      }
    }

    if (dir) {
      index += slideBy * dir;

      if (autoWidth) {
        index = Math.floor(index);
      } // pass e when click control buttons or keydown


      render(passEventObject || e && e.type === "keydown" ? e : null);
    }
  } // on nav click


  function onNavClick(e) {
    if (running) {
      if (preventActionWhenRunning) {
        return;
      } else {
        onTransitionEnd();
      }
    }

    e = getEvent(e);
    var target = getTarget(e),
        navIndex; // find the clicked nav item

    while (target !== navContainer && !(0,_helpers_hasAttr_js__WEBPACK_IMPORTED_MODULE_19__.hasAttr)(target, "data-nav")) {
      target = target.parentNode;
    }

    if ((0,_helpers_hasAttr_js__WEBPACK_IMPORTED_MODULE_19__.hasAttr)(target, "data-nav")) {
      var navIndex = navClicked = Number((0,_helpers_getAttr_js__WEBPACK_IMPORTED_MODULE_20__.getAttr)(target, "data-nav")),
          targetIndexBase = fixedWidth || autoWidth ? navIndex * slideCount / pages : navIndex * items,
          targetIndex = navAsThumbnails ? navIndex : Math.min(Math.ceil(targetIndexBase), slideCount - 1);
      goTo(targetIndex, e);

      if (navCurrentIndex === navIndex) {
        if (animating) {
          stopAutoplay();
        }

        navClicked = -1; // reset navClicked
      }
    }
  } // autoplay functions


  function setAutoplayTimer() {
    autoplayTimer = setInterval(function () {
      onControlsClick(null, autoplayDirection);
    }, autoplayTimeout);
    animating = true;
  }

  function stopAutoplayTimer() {
    clearInterval(autoplayTimer);
    animating = false;
  }

  function updateAutoplayButton(action, txt) {
    (0,_helpers_setAttrs_js__WEBPACK_IMPORTED_MODULE_21__.setAttrs)(autoplayButton, {
      "data-action": action
    });
    autoplayButton.innerHTML = autoplayHtmlStrings[0] + action + autoplayHtmlStrings[1] + txt;
  }

  function startAutoplay() {
    setAutoplayTimer();

    if (autoplayButton) {
      updateAutoplayButton("stop", autoplayText[1]);
    }
  }

  function stopAutoplay() {
    stopAutoplayTimer();

    if (autoplayButton) {
      updateAutoplayButton("start", autoplayText[0]);
    }
  } // programaitcally play/pause the slider


  function play() {
    if (autoplay && !animating) {
      startAutoplay();
      autoplayUserPaused = false;
    }
  }

  function pause() {
    if (animating) {
      stopAutoplay();
      autoplayUserPaused = true;
    }
  }

  function toggleAutoplay() {
    if (animating) {
      stopAutoplay();
      autoplayUserPaused = true;
    } else {
      startAutoplay();
      autoplayUserPaused = false;
    }
  }

  function onVisibilityChange() {
    if (doc.hidden) {
      if (animating) {
        stopAutoplayTimer();
        autoplayVisibilityPaused = true;
      }
    } else if (autoplayVisibilityPaused) {
      setAutoplayTimer();
      autoplayVisibilityPaused = false;
    }
  }

  function mouseoverPause() {
    if (animating) {
      stopAutoplayTimer();
      autoplayHoverPaused = true;
    }
  }

  function mouseoutRestart() {
    if (autoplayHoverPaused) {
      setAutoplayTimer();
      autoplayHoverPaused = false;
    }
  } // keydown events on document


  function onDocumentKeydown(e) {
    e = getEvent(e);
    var keyIndex = [KEYS.LEFT, KEYS.RIGHT].indexOf(e.keyCode);

    if (keyIndex >= 0) {
      onControlsClick(e, keyIndex === 0 ? -1 : 1);
    }
  } // on key control


  function onControlsKeydown(e) {
    e = getEvent(e);
    var keyIndex = [KEYS.LEFT, KEYS.RIGHT].indexOf(e.keyCode);

    if (keyIndex >= 0) {
      if (keyIndex === 0) {
        if (!prevButton.disabled) {
          onControlsClick(e, -1);
        }
      } else if (!nextButton.disabled) {
        onControlsClick(e, 1);
      }
    }
  } // set focus


  function setFocus(el) {
    el.focus();
  } // on key nav


  function onNavKeydown(e) {
    e = getEvent(e);
    var curElement = doc.activeElement;

    if (!(0,_helpers_hasAttr_js__WEBPACK_IMPORTED_MODULE_19__.hasAttr)(curElement, "data-nav")) {
      return;
    } // var code = e.keyCode,


    var keyIndex = [KEYS.LEFT, KEYS.RIGHT, KEYS.ENTER, KEYS.SPACE].indexOf(e.keyCode),
        navIndex = Number((0,_helpers_getAttr_js__WEBPACK_IMPORTED_MODULE_20__.getAttr)(curElement, "data-nav"));

    if (keyIndex >= 0) {
      if (keyIndex === 0) {
        if (navIndex > 0) {
          setFocus(navItems[navIndex - 1]);
        }
      } else if (keyIndex === 1) {
        if (navIndex < pages - 1) {
          setFocus(navItems[navIndex + 1]);
        }
      } else {
        navClicked = navIndex;
        goTo(navIndex, e);
      }
    }
  }

  function getEvent(e) {
    e = e || win.event;
    return isTouchEvent(e) ? e.changedTouches[0] : e;
  }

  function getTarget(e) {
    return e.target || win.event.srcElement;
  }

  function isTouchEvent(e) {
    return e.type.indexOf("touch") >= 0;
  }

  function preventDefaultBehavior(e) {
    e.preventDefault ? e.preventDefault() : e.returnValue = false;
  }

  function getMoveDirectionExpected() {
    return (0,_helpers_getTouchDirection_js__WEBPACK_IMPORTED_MODULE_14__.getTouchDirection)((0,_helpers_toDegree_js__WEBPACK_IMPORTED_MODULE_13__.toDegree)(lastPosition.y - initPosition.y, lastPosition.x - initPosition.x), swipeAngle) === options.axis;
  }

  function onPanStart(e) {
    if (running) {
      if (preventActionWhenRunning) {
        return;
      } else {
        onTransitionEnd();
      }
    }

    if (autoplay && animating) {
      stopAutoplayTimer();
    }

    panStart = true;

    if (rafIndex) {
      (0,_helpers_caf_js__WEBPACK_IMPORTED_MODULE_1__.caf)(rafIndex);
      rafIndex = null;
    }

    var $ = getEvent(e);
    events.emit(isTouchEvent(e) ? "touchStart" : "dragStart", info(e));

    if (!isTouchEvent(e) && ["img", "a"].indexOf(getLowerCaseNodeName(getTarget(e))) >= 0) {
      preventDefaultBehavior(e);
    }

    lastPosition.x = initPosition.x = $.clientX;
    lastPosition.y = initPosition.y = $.clientY;

    if (carousel) {
      translateInit = parseFloat(container.style[transformAttr].replace(transformPrefix, ""));
      resetDuration(container, "0s");
    }
  }

  function onPanMove(e) {
    if (panStart) {
      var $ = getEvent(e);
      lastPosition.x = $.clientX;
      lastPosition.y = $.clientY;

      if (carousel) {
        if (!rafIndex) {
          rafIndex = (0,_helpers_raf_js__WEBPACK_IMPORTED_MODULE_0__.raf)(function () {
            panUpdate(e);
          });
        }
      } else {
        if (moveDirectionExpected === "?") {
          moveDirectionExpected = getMoveDirectionExpected();
        }

        if (moveDirectionExpected) {
          preventScroll = true;
        }
      }

      if ((typeof e.cancelable !== "boolean" || e.cancelable) && preventScroll) {
        e.preventDefault();
      }
    }
  }

  function panUpdate(e) {
    if (!moveDirectionExpected) {
      panStart = false;
      return;
    }

    (0,_helpers_caf_js__WEBPACK_IMPORTED_MODULE_1__.caf)(rafIndex);

    if (panStart) {
      rafIndex = (0,_helpers_raf_js__WEBPACK_IMPORTED_MODULE_0__.raf)(function () {
        panUpdate(e);
      });
    }

    if (moveDirectionExpected === "?") {
      moveDirectionExpected = getMoveDirectionExpected();
    }

    if (moveDirectionExpected) {
      if (!preventScroll && isTouchEvent(e)) {
        preventScroll = true;
      }

      try {
        if (e.type) {
          events.emit(isTouchEvent(e) ? "touchMove" : "dragMove", info(e));
        }
      } catch (err) {}

      var x = translateInit,
          dist = getDist(lastPosition, initPosition);

      if (!horizontal || fixedWidth || autoWidth) {
        x += dist;
        x += "px";
      } else {
        var percentageX = TRANSFORM ? dist * items * 100 / ((viewport + gutter) * slideCountNew) : dist * 100 / (viewport + gutter);
        x += percentageX;
        x += "%";
      }

      container.style[transformAttr] = transformPrefix + x + transformPostfix;
    }
  }

  function onPanEnd(e) {
    if (panStart) {
      if (rafIndex) {
        (0,_helpers_caf_js__WEBPACK_IMPORTED_MODULE_1__.caf)(rafIndex);
        rafIndex = null;
      }

      if (carousel) {
        resetDuration(container, "");
      }

      panStart = false;
      var $ = getEvent(e);
      lastPosition.x = $.clientX;
      lastPosition.y = $.clientY;
      var dist = getDist(lastPosition, initPosition);

      if (Math.abs(dist)) {
        // drag vs click
        if (!isTouchEvent(e)) {
          // prevent "click"
          var target = getTarget(e);
          (0,_helpers_addEvents_js__WEBPACK_IMPORTED_MODULE_30__.addEvents)(target, {
            click: function preventClick(e) {
              preventDefaultBehavior(e);
              (0,_helpers_removeEvents_js__WEBPACK_IMPORTED_MODULE_31__.removeEvents)(target, {
                click: preventClick
              });
            }
          });
        }

        if (carousel) {
          rafIndex = (0,_helpers_raf_js__WEBPACK_IMPORTED_MODULE_0__.raf)(function () {
            if (horizontal && !autoWidth) {
              var indexMoved = -dist * items / (viewport + gutter);
              indexMoved = dist > 0 ? Math.floor(indexMoved) : Math.ceil(indexMoved);
              index += indexMoved;
            } else {
              var moved = -(translateInit + dist);

              if (moved <= 0) {
                index = indexMin;
              } else if (moved >= slidePositions[slideCountNew - 1]) {
                index = indexMax;
              } else {
                var i = 0;

                while (i < slideCountNew && moved >= slidePositions[i]) {
                  index = i;

                  if (moved > slidePositions[i] && dist < 0) {
                    index += 1;
                  }

                  i++;
                }
              }
            }

            render(e, dist);
            events.emit(isTouchEvent(e) ? "touchEnd" : "dragEnd", info(e));
          });
        } else {
          if (moveDirectionExpected) {
            onControlsClick(e, dist > 0 ? -1 : 1);
          }
        }
      }
    } // reset


    if (options.preventScrollOnTouch === "auto") {
      preventScroll = false;
    }

    if (swipeAngle) {
      moveDirectionExpected = "?";
    }

    if (autoplay && !animating) {
      setAutoplayTimer();
    }
  } // === RESIZE FUNCTIONS === //
  // (slidePositions, index, items) => vertical_conentWrapper.height


  function updateContentWrapperHeight() {
    var wp = middleWrapper ? middleWrapper : innerWrapper;
    wp.style.height = slidePositions[index + items] - slidePositions[index] + "px";
  }

  function getPages() {
    var rough = fixedWidth ? (fixedWidth + gutter) * slideCount / viewport : slideCount / items;
    return Math.min(Math.ceil(rough), slideCount);
  }
  /*
   * 1. update visible nav items list
   * 2. add "hidden" attributes to previous visible nav items
   * 3. remove "hidden" attrubutes to new visible nav items
   */


  function updateNavVisibility() {
    if (!nav || navAsThumbnails) {
      return;
    }

    if (pages !== pagesCached) {
      var min = pagesCached,
          max = pages,
          fn = _helpers_showElement_js__WEBPACK_IMPORTED_MODULE_25__.showElement;

      if (pagesCached > pages) {
        min = pages;
        max = pagesCached;
        fn = _helpers_hideElement_js__WEBPACK_IMPORTED_MODULE_24__.hideElement;
      }

      while (min < max) {
        fn(navItems[min]);
        min++;
      } // cache pages


      pagesCached = pages;
    }
  }

  function info(e) {
    return {
      container: container,
      slideItems: slideItems,
      navContainer: navContainer,
      navItems: navItems,
      controlsContainer: controlsContainer,
      hasControls: hasControls,
      prevButton: prevButton,
      nextButton: nextButton,
      items: items,
      slideBy: slideBy,
      cloneCount: cloneCount,
      slideCount: slideCount,
      slideCountNew: slideCountNew,
      index: index,
      indexCached: indexCached,
      displayIndex: getCurrentSlide(),
      navCurrentIndex: navCurrentIndex,
      navCurrentIndexCached: navCurrentIndexCached,
      pages: pages,
      pagesCached: pagesCached,
      sheet: sheet,
      isOn: isOn,
      event: e || {}
    };
  }

  return {
    version: "2.9.3",
    getInfo: info,
    events: events,
    goTo: goTo,
    play: play,
    pause: pause,
    isOn: isOn,
    updateSliderHeight: updateInnerWrapperHeight,
    refresh: initSliderTransform,
    destroy: destroy,
    rebuild: function () {
      return tns((0,_helpers_extend_js__WEBPACK_IMPORTED_MODULE_2__.extend)(options, optionsElements));
    }
  };
};

/***/ }),

/***/ "./src/js/lib/core.js":
/*!****************************!*\
  !*** ./src/js/lib/core.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const $ = function (selector) {
  return new $.prototype.init(selector);
};

$.prototype.init = function (selector) {
  if (!selector) {
    return this; // возвращаем пустой объект {}
  } // проверяем есть ли элемент на странице через tagName


  if (selector.tagName) {
    this[0] = selector;
    this.length = 1;
    return this;
  } // добавляем свойства в объект


  Object.assign(this, document.querySelectorAll(selector));
  this.length = document.querySelectorAll(selector).length;
  return this;
}; // добовляем в прототип возвращаемой функции init, прототип главной функции


$.prototype.init.prototype = $.prototype;
window.$ = $;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ($);

/***/ }),

/***/ "./src/js/lib/lib.js":
/*!***************************!*\
  !*** ./src/js/lib/lib.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core */ "./src/js/lib/core.js");
/* harmony import */ var _modules_classes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/classes */ "./src/js/lib/modules/classes.js");
/* harmony import */ var _modules_attributes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/attributes */ "./src/js/lib/modules/attributes.js");
/* harmony import */ var _modules_handlers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/handlers */ "./src/js/lib/modules/handlers.js");
/* harmony import */ var _modules_actions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/actions */ "./src/js/lib/modules/actions.js");
/* harmony import */ var _components_burger__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/burger */ "./src/js/lib/components/burger.js");
/* harmony import */ var _components_dropdown__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/dropdown */ "./src/js/lib/components/dropdown.js");
/* harmony import */ var _components_modal__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/modal */ "./src/js/lib/components/modal.js");
/* harmony import */ var _components_tab__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/tab */ "./src/js/lib/components/tab.js");
/* harmony import */ var _components_accordion__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/accordion */ "./src/js/lib/components/accordion.js");
/* harmony import */ var _services_requests__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./services/requests */ "./src/js/lib/services/requests.js");
/* harmony import */ var _modules_scroll__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./modules/scroll */ "./src/js/lib/modules/scroll.js");












/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_core__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "./src/js/lib/modules/actions.js":
/*!***************************************!*\
  !*** ./src/js/lib/modules/actions.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
 // изменение или получение содержания html элемента $("selector").html("contens")
// если  content не передан получаем содержимое $("selector").html()

_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.html = function (content) {
  for (let i = 0; i < this.length; i++) {
    if (content) {
      this[i].innerHTML = content;
    } else {
      return this[i].innerHTML;
    }
  }

  return this;
}; // получение элемента по номеру $("selector").eq(num) (num 1,2,3, ...)


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.eq = function (num) {
  const swap = this[num];
  const objLength = Object.keys(this).length;

  for (let i = 0; i < objLength; i++) {
    delete this[i];
  }

  this[0] = swap;
  this.length = 1;
  return this;
}; // получение номера элемента по порядку, до одного общего родителя
//$("child_selector").index()


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.index = function () {
  const parent = this[0].parentNode;
  const childs = [...parent.children];

  const findMyIndex = item => {
    return item == this[0];
  };

  return childs.findIndex(findMyIndex);
}; // получение элемента по селектору в пределах родителя
//$("parent_selector").find("finding_elem_selector")


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.find = function (selector) {
  let numberOfItems = 0,
      counter = 0;
  const copyObj = Object.assign({}, this);

  for (let i = 0; i < copyObj.length; i++) {
    const arr = copyObj[i].querySelectorAll(selector);

    if (arr.length == 0) {
      continue;
    }

    for (let j = 0; j < arr.length; j++) {
      this[counter] = arr[j];
      counter++;
    }

    numberOfItems += arr.length;
  }

  this.length = numberOfItems;
  const objLength = Object.keys(this).length;

  for (; numberOfItems < objLength; numberOfItems++) {
    delete this[numberOfItems];
  }

  return this;
}; // получение ближайшего родительского элемента по селектору
//$("child_selector").closest("finding_parent_selector")


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.closest = function (selector) {
  let counter = 0;

  for (let i = 0; i < this.length; i++) {
    if (this[i].closest(selector) === null) {
      this[i].classList.add("Parent-not-found!");
    } else {
      this[i] = this[i].closest(selector);
      counter++;
    }
  }

  const objLength = Object.keys(this).length;

  for (; counter < objLength; counter++) {
    delete this[counter];
  }

  return this;
}; // получение содедних элементов внутри родительского блока
// исключая сам блок вызова $("selector").siblings()


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.siblings = function () {
  let numberOfItems = 0;
  let counter = 0;
  const copyObj = Object.assign({}, this);

  for (let i = 0; i < copyObj.length; i++) {
    const arr = copyObj[i].parentNode.children;

    for (let j = 0; j < arr.length; j++) {
      if (copyObj[i] === arr[j]) {
        continue;
      }

      this[counter] = arr[j];
      counter++;
    }

    numberOfItems += arr.length - 1;
  }

  this.length = numberOfItems;
  const objLength = Object.keys(this).length;

  for (; numberOfItems < objLength; numberOfItems++) {
    delete this[numberOfItems];
  }

  return this;
}; // Получение массива элементов по селектору


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.getElems = function (selector) {
  let elems = [];

  for (let i = 0; i < this.length; i++) {
    elems[i] = document.querySelector(this[i].getAttribute(selector));
  }

  return elems;
};

/***/ }),

/***/ "./src/js/lib/modules/attributes.js":
/*!******************************************!*\
  !*** ./src/js/lib/modules/attributes.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");

/* формат вызова функций
   $("selector").toggleAttrib("data-one", "111", "data-two", "");
*/
//  Установка атрибута

_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.setAttrib = function (...attr) {
  for (let i = 0; i < this.length; i++) {
    if (!attr) {
      return this;
    } else {
      for (let j = 0; j < attr.length; j = j + 2) {
        this[i].setAttribute(attr[j], attr[j + 1]);
      }
    }
  }

  return this;
}; //  Удаление атрибута


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.removeAttrib = function (...attr) {
  for (let i = 0; i < this.length; i++) {
    for (let j = 0; j < attr.length; j = j + 2) {
      this[i].setAttribute(attr[j], attr[j + 1]);
    }
  }

  return this;
}; //  Переключение атрибута


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.toggleAttrib = function (...attr) {
  for (let i = 0; i < this.length; i++) {
    for (let j = 0; j < attr.length; j = j + 2) {
      if (this[i].hasAttribute(attr[j])) {
        this[i].removeAttribute(attr[j]);
      } else if (!this[i].hasAttribute(attr[j])) {
        this[i].setAttribute(attr[j], attr[j + 1]);
      }
    }
  }

  return this;
}; // Получение атрибутa


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.getAttrib = function (attribName) {
  return this[0].getAttribute(attribName);
}; // Проверка наличия атрибутов


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.hasAttrib = function (attribName) {
  return this[0].hasAttribute(attribName);
};

/***/ }),

/***/ "./src/js/lib/modules/classes.js":
/*!***************************************!*\
  !*** ./src/js/lib/modules/classes.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
 //формат вызова $("selector").addClass("class1", "class2", …)
// Добавление классов

_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.addClass = function (...classNames) {
  for (let i = 0; i < this.length; i++) {
    if (classNames.length === 0) {
      continue;
    }

    this[i].classList.add(...classNames);
  }

  return this;
}; //Удаление классов


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.removeClass = function (...classNames) {
  for (let i = 0; i < this.length; i++) {
    if (!this[i].classList.contains(classNames)) {
      continue;
    }

    this[i].classList.remove(...classNames);
  }

  return this;
}; // Переключение классов


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.toggleClass = function (className) {
  if (!className) {
    return this;
  }

  this[0].classList.toggle(className);
  return this;
}; // Проверка наличия класса


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.containsClass = function (className) {
  if (this[0].classList.contains(className)) {
    return true;
  } else {
    return false;
  }
};

/***/ }),

/***/ "./src/js/lib/modules/handlers.js":
/*!****************************************!*\
  !*** ./src/js/lib/modules/handlers.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
 // назначение обработчика события

_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.on = function (eventName, callback) {
  if (!eventName || !callback) {
    return this;
  }

  for (let i = 0; i < this.length; i++) {
    this[i].addEventListener(eventName, callback);
  }

  return this;
}; // удаление обработчика события


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.off = function (eventName, callback) {
  if (!eventName || !callback) {
    return this;
  }

  for (let i = 0; i < this.length; i++) {
    this[i].removeEventListener(eventName, callback);
  }

  return this;
}; // назначение обработчика события клик


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.click = function (handler) {
  for (let i = 0; i < this.length; i++) {
    if (handler) {
      this[i].addEventListener("click", handler);
    } else {
      this[i].click();
    }
  }

  return this;
};

/***/ }),

/***/ "./src/js/lib/modules/scroll.js":
/*!**************************************!*\
  !*** ./src/js/lib/modules/scroll.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
/* harmony import */ var animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! animejs/lib/anime.es.js */ "./node_modules/animejs/lib/anime.es.js");



_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.scrolling = function () {
  //получам селекторы меню и ссылок на секции
  const nav = this[0];
  const sections = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[0]).find(".refer").getElems("href");
  const links = Array.from((0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[0]).find(".refer")); //если секций несколько обрабатываем как меню

  if (sections.length > 1) {
    const navHeight = nav.scrollHeight; // подсветка пунктов меню при прокрутке

    const loop = () => {
      links.forEach((link, i) => {
        const {
          top,
          bottom
        } = sections[i].getBoundingClientRect();
        const navHeight = nav.scrollHeight;
        top - navHeight <= 0 && bottom - navHeight > 0 ? link.classList.add("has-text-info") : link.classList.remove("has-text-info");
      });
      window.requestAnimationFrame(loop);
    };

    loop(); // обработка переходов прокрутки

    const scrollToSection = (evt, i) => {
      evt.preventDefault();
      const {
        top
      } = sections[i].getBoundingClientRect();
      const scroolTo = top + window.pageYOffset - navHeight + 1;
      const scrollCoords = {
        y: window.pageYOffset
      };
      scroolHandler(scrollCoords, scroolTo);
    };

    links.forEach((link, i) => link.addEventListener("click", evt => scrollToSection(evt, i)));
  } else {
    //если секция 1 обрабатываем как прокрутка вверх до конца
    const scrollUp = (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[0])[0];
    window.addEventListener("scroll", () => {
      //показываем кнопку скролла при велечене более 1250px
      window.pageYOffset > 1250 ? (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[0]).removeClass("is-hidden") : (0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(this[0]).addClass("is-hidden");
    });
    scrollUp.addEventListener("click", e => {
      e.preventDefault();
      const scrollCoords = {
        y: window.pageYOffset
      };
      scroolHandler(scrollCoords, 0);
    });
  } // скроллинг


  function scroolHandler(from, to) {
    (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
      targets: from,
      y: to,
      duration: 1000,
      easing: "easeInOutCubic",
      update: () => window.scroll(0, from.y)
    });
  }
}; //вызов если есть меню


(0,_core__WEBPACK_IMPORTED_MODULE_0__["default"])(".navbar").scrolling(); //вызов если элемент up
//$(".up").scrolling();

/***/ }),

/***/ "./src/js/lib/services/just-validate.js":
/*!**********************************************!*\
  !*** ./src/js/lib/services/just-validate.js ***!
  \**********************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_web_immediate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/web.immediate.js */ "./node_modules/core-js/modules/web.immediate.js");
/* harmony import */ var core_js_modules_web_immediate_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_immediate_js__WEBPACK_IMPORTED_MODULE_0__);
/* module decorator */ module = __webpack_require__.hmd(module);




var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

(function () {
  var typesToPatch = ["DocumentType", "Element", "CharacterData"],
      remove = function remove() {
    // The check here seems pointless, since we're not adding this
    // method to the prototypes of any any elements that CAN be the
    // root of the DOM. However, it's required by spec (see point 1 of
    // https://dom.spec.whatwg.org/#dom-childnode-remove) and would
    // theoretically make a difference if somebody .apply()ed this
    // method to the DOM's root node, so let's roll with it.
    if (this.parentNode != null) {
      this.parentNode.removeChild(this);
    }
  };

  for (var i = 0; i < typesToPatch.length; i++) {
    var type = typesToPatch[i];

    if (window[type] && !window[type].prototype.remove) {
      window[type].prototype.remove = remove;
    }
  }
})();

(function (root) {
  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {} // Polyfill for Function.prototype.bind


  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (_typeof(this) !== "object") throw new TypeError("Promises must be constructed via new");
    if (typeof fn !== "function") throw new TypeError("not a function");
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];
    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }

    if (self._state === 0) {
      self._deferreds.push(deferred);

      return;
    }

    self._handled = true;

    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;

      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }

      var ret;

      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }

      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError("A promise cannot be resolved with itself.");

      if (newValue && ((typeof newValue === "undefined" ? "undefined" : _typeof(newValue)) === "object" || typeof newValue === "function")) {
        var then = newValue.then;

        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === "function") {
          doResolve(bind(then, newValue), self);
          return;
        }
      }

      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function () {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }

    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
    this.onRejected = typeof onRejected === "function" ? onRejected : null;
    this.promise = promise;
  }
  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */


  function doResolve(fn, self) {
    var done = false;

    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype["catch"] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new this.constructor(noop);
    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);
    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && ((typeof val === "undefined" ? "undefined" : _typeof(val)) === "object" || typeof val === "function")) {
            var then = val.then;

            if (typeof then === "function") {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }

          args[i] = val;

          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object" && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  }; // Use polyfill for setImmediate for performance gains


  Promise._immediateFn = typeof setImmediate === "function" && function (fn) {
    setImmediate(fn);
  } || function (fn) {
    setTimeoutFunc(fn, 0);
  };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== "undefined" && console) {
      console.warn("Possible Unhandled Promise Rejection:", err); // eslint-disable-line no-console
    }
  };
  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */


  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };
  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */


  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };

  if ( true && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }
})(window);
/* global Promise */


(function (window) {
  "use strict";

  if (!window.Promise) {
    window.Promise = Promise;
  }

  var RULE_REQUIRED = "required",
      RULE_EMAIL = "email",
      RULE_MINLENGTH = "minLength",
      RULE_MAXLENGTH = "maxLength",
      RULE_PASSWORD = "password",
      RULE_ZIP = "zip",
      RULE_PHONE = "phone",
      RULE_REMOTE = "remote",
      RULE_STRENGTH = "strength",
      RULE_FUNCTION = "function";

  var formatParams = function formatParams(params, method) {
    if (typeof params === "string") {
      return params;
    }

    var letter = method.toLowerCase() === "post" ? "" : "?";

    if (Array.isArray(params)) {
      return letter + params.map(function (obj) {
        return obj.name + "=" + obj.value;
      }).join("&");
    }

    return letter + Object.keys(params).map(function (key) {
      return key + "=" + params[key];
    }).join("&");
  };

  var ajax = function ajax(options) {
    var url = options.url,
        method = options.method,
        data = options.data,
        debug = options.debug,
        callback = options.callback,
        error = options.error;

    if (debug) {
      callback("test");
      return;
    }

    var async = options.async === false ? false : true;
    var xhr = new XMLHttpRequest();
    var params = formatParams(data, "get");
    var body = null;

    if (method.toLowerCase() === "post") {
      body = formatParams(data, "post");
      params = "";
    }

    xhr.open(method, url + params, async);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          callback(this.responseText);
        } else {
          error && error(this.responseText);
        }
      }
    };

    xhr.send(body);
  };

  var JustValidate = function JustValidate(selector, options) {
    this.options = options || {};
    this.rules = this.options.rules || {};
    this.messages = this.options.messages || undefined;
    this.colorWrong = this.options.colorWrong || "#B81111";
    this.result = {};
    this.elements = [];
    this.tooltip = this.options.tooltip || {};
    this.tooltipFadeOutTime = this.tooltip.fadeOutTime || 5000;
    this.tooltipFadeOutClass = this.tooltip.fadeOutClass || "just-validate-tooltip-hide";
    this.tooltipSelectorWrap = document.querySelectorAll(this.tooltip.selectorWrap).length ? document.querySelectorAll(this.tooltip.selectorWrap) : document.querySelectorAll(".just-validate-tooltip-container");
    this.bindHandlerKeyup = this.handlerKeyup.bind(this);
    this.submitHandler = this.options.submitHandler || undefined;
    this.invalidFormCallback = this.options.invalidFormCallback || undefined;
    this.promisesRemote = [];
    this.isValidationSuccess = false;
    this.focusWrongField = this.options.focusWrongField || false;
    this.REGEXP = {
      // eslint-disable-next-line max-len
      email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      zip: /^\d{5}(-\d{4})?$/,
      phone: /^([0-9]( |-)?)?(\(?[0-9]{3}\)?|[0-9]{3})( |-)?([0-9]{3}( |-)?[0-9]{4}|[a-zA-Z0-9]{7})$/,
      password: /[^\w\d]*(([0-9]+.*[A-Za-z]+.*)|[A-Za-z]+.*([0-9]+.*))/,
      strengthPass: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/
    };
    this.DEFAULT_REMOTE_ERROR = "Error";
    this.state = {
      tooltipsTimer: null
    };
    this.setForm(document.querySelector(selector));
  };

  JustValidate.prototype = {
    defaultRules: {
      email: {
        required: true,
        email: true
      },
      name: {
        required: true,
        minLength: 3,
        maxLength: 15
      },
      text: {
        required: true,
        maxLength: 300,
        minLength: 5
      },
      password: {
        required: true,
        password: true,
        minLength: 4,
        maxLength: 8
      },
      zip: {
        required: true,
        zip: true
      },
      phone: {
        phone: true
      }
    },
    defaultMessages: {
      required: "The field is required",
      email: "Please, type a valid email",
      maxLength: "The field must contain a maximum of :value characters",
      minLength: "The field must contain a minimum of :value characters",
      password: "Password is not valid",
      remote: "Email already exists",
      strength: "Password must contents at least one uppercase letter, one lowercase letter and one number",
      function: "Function returned false"
    },

    /**
     * Keyup handler
     * @param ev
     */
    handlerKeyup: function handlerKeyup(ev) {
      var elem = ev.target,
          item = {
        name: elem.getAttribute("data-validate-field"),
        value: elem.value
      };
      delete this.result[item.name];
      this.validateItem({
        name: item.name,
        value: item.value,
        group: [],
        isKeyupChange: true
      });
      this.renderErrors();
    },
    setterEventListener: function setterEventListener(item, event, handler, type) {
      if (event === "keyup") {
        handler = this.bindHandlerKeyup;
      }

      switch (type) {
        case "add":
          {
            item.addEventListener(event, handler);
            break;
          }

        case "remove":
          {
            item.removeEventListener(event, handler);
            break;
          }
      }
    },
    getElementsRealValue: function getElementsRealValue() {
      var $elems = this.$form.querySelectorAll("*"),
          name = void 0,
          result = {};

      for (var i = 0, len = $elems.length; i < len; ++i) {
        name = $elems[i].getAttribute("name");

        if (name) {
          if ($elems[i].type === "checkbox") {
            result[name] = $elems[i].checked;
            continue;
          }

          result[name] = $elems[i].value;
        }
      }

      return result;
    },
    validationFailed: function validationFailed() {
      if (this.invalidFormCallback) {
        this.invalidFormCallback(this.result);
      }

      var $firstErrorField = document.querySelector(".js-validate-error-field");

      if (this.focusWrongField && $firstErrorField && $firstErrorField.focus) {
        $firstErrorField.focus();
      }
    },
    validationSuccess: function validationSuccess() {
      if (Object.keys(this.result).length === 0) {
        this.isValidationSuccess = false;

        if (this.submitHandler) {
          var realValues = this.getElementsRealValue();
          this.submitHandler(this.$form, realValues, ajax);
          return;
        }

        this.$form.submit();
      }
    },
    setForm: function setForm(form) {
      var _this = this;

      this.$form = form;
      this.$form.setAttribute("novalidate", "novalidate");
      this.$form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        _this.result = [];

        _this.getElements();

        if (!_this.promisesRemote.length) {
          if (_this.isValidationSuccess) {
            _this.validationSuccess();
          } else {
            _this.validationFailed();
          }

          return;
        }

        Promise.all(_this.promisesRemote).then(function () {
          _this.promisesRemote = [];

          if (_this.isValidationSuccess) {
            _this.validationSuccess();
          } else {
            _this.validationFailed();
          }
        });
      });
    },
    isEmail: function isEmail(email) {
      return this.REGEXP.email.test(email);
    },
    isZip: function isZip(zip) {
      return this.REGEXP.zip.test(zip);
    },
    isPhone: function isPhone(phone) {
      return this.REGEXP.phone.test(phone);
    },
    isPassword: function isPassword(password) {
      return this.REGEXP.password.test(password);
    },
    isEmpty: function isEmpty(val) {
      var newVal = val;

      if (val.trim) {
        newVal = val.trim();
      }

      return !newVal;
    },
    checkLengthMax: function checkLengthMax(text, max) {
      return text.length <= max;
    },
    checkLengthMin: function checkLengthMin(text, min) {
      return text.length >= min;
    },
    checkStrengthPass: function checkStrengthPass(password) {
      return this.REGEXP.strengthPass.test(password);
    },
    getElements: function getElements() {
      var _this2 = this;

      var elems = this.$form.querySelectorAll("[data-validate-field]");
      this.elements = [];

      var _loop = function _loop(i, len) {
        var item = elems[i],
            name = item.getAttribute("data-validate-field"),
            value = item.value,
            isElemInGroup = false,
            group = [];

        if (item.type === "checkbox") {
          value = item.checked || "";
          item.addEventListener("change", function (ev) {
            var elem = ev.target,
                item = {
              name: elem.getAttribute("data-validate-field"),
              value: elem.checked
            };
            delete _this2.result[item.name];

            _this2.validateItem({
              name: item.name,
              value: item.value,
              group: []
            });

            _this2.renderErrors();
          });
        }

        if (item.type === "radio") {
          var findElem = _this2.elements.filter(function (item) {
            if (item.name === name) {
              return item;
            }
          })[0];

          if (findElem) {
            findElem.group.push(item.checked);
            isElemInGroup = true;
          } else {
            group.push(item.checked);
          }

          item.addEventListener("change", function (ev) {
            var elem = ev.target,
                item = {
              name: elem.getAttribute("data-validate-field"),
              value: elem.checked
            };
            delete _this2.result[item.name];

            _this2.validateItem({
              name: item.name,
              value: item.value,
              group: []
            });

            _this2.renderErrors();
          });
        }

        _this2.setterEventListener(item, "keyup", _this2.handlerKeyup, "add");

        if (!isElemInGroup) {
          _this2.elements.push({
            name: name,
            value: value,
            group: group
          });
        }
      };

      for (var i = 0, len = elems.length; i < len; ++i) {
        _loop(i, len);
      }

      this.validateElements();
    },

    /**
     * Validate Required field
     * @param {string} value Value for validate
     * @returns {boolean} True if validate is OK
     */
    validateRequired: function validateRequired(value) {
      return !this.isEmpty(value);
    },

    /**
     * Validate Email field
     * @param {string} value Value for validate
     * @returns {boolean} True if validate is OK
     */
    validateEmail: function validateEmail(value) {
      return this.isEmail(value);
    },

    /**
     * Validate Phone field
     * @param {string} value Value for validate
     * @returns {boolean} True if validate is OK
     */
    validatePhone: function validatePhone(value) {
      return this.isPhone(value);
    },

    /**
     * Validate field for Min Length
     * @param {string} value Value for validate
     * @param {integer} min
     * @returns {boolean} True if validate is OK
     */
    validateMinLength: function validateMinLength(value, min) {
      return this.checkLengthMin(value, min);
    },

    /**
     * Validate field for Max Length
     * @param {string} value Value for validate
     * @param {integer} max
     * @returns {boolean} True if validate is OK
     */
    validateMaxLength: function validateMaxLength(value, max) {
      return this.checkLengthMax(value, max);
    },

    /**
     * Validate field for strength password
     * @param {string} password Value for validate
     * @returns {boolean} True if validate is OK
     */
    validateStrengthPass: function validateStrengthPass(password) {
      return this.checkStrengthPass(password);
    },

    /**
     * Validate Password field
     * @param {string} value Value for validate
     * @returns {boolean} True if validate is OK
     */
    validatePassword: function validatePassword(value) {
      return this.isPassword(value);
    },

    /**
     * Validate ZIP field
     * @param {string} value Value for validate
     * @returns {boolean} True if validate is OK
     */
    validateZip: function validateZip(value) {
      return this.isZip(value);
    },

    /**
     * Validate for remote check
     * @param value
     * @param name
     * @param {string} url
     * @param {string} successAnswer
     * @returns {boolean} True if validate is OK
     */
    validateRemote: function validateRemote(_ref) {
      var value = _ref.value,
          name = _ref.name,
          url = _ref.url,
          successAnswer = _ref.successAnswer,
          sendParam = _ref.sendParam,
          method = _ref.method;
      return new Promise(function (resolve) {
        ajax({
          url: url,
          method: method,
          data: _defineProperty({}, sendParam, value),
          async: true,
          callback: function callback(data) {
            if (data.toLowerCase() === successAnswer.toLowerCase()) {
              resolve("ok");
            }

            resolve({
              type: "incorrect",
              name: name
            });
          },
          error: function error() {
            resolve({
              type: "error",
              name: name
            });
          }
        });
      });
    },
    generateMessage: function generateMessage(rule, name, value) {
      var messages = this.messages || this.defaultMessages;
      var customMessage = messages[name] && messages[name][rule] || this.messages && typeof this.messages[name] === "string" && messages[name] || // (messages[name][rule]) ||
      this.defaultMessages[rule] || this.DEFAULT_REMOTE_ERROR;

      if (value) {
        customMessage = customMessage.replace(":value", value.toString());
      }

      this.result[name] = {
        message: customMessage
      };
    },
    validateElements: function validateElements() {
      var _this3 = this;

      this.lockForm();
      this.elements.forEach(function (item) {
        _this3.validateItem({
          name: item.name,
          value: item.value,
          group: item.group
        });
      });

      if (!this.promisesRemote.length) {
        this.renderErrors();
        return;
      }

      Promise.all(this.promisesRemote).then(function (resp) {
        resp.forEach(function (result) {
          if (result === "ok") {
            _this3.renderErrors();

            return;
          }

          if (result.type === "error") {
            alert("Server error occured. Please try later.");
          }

          _this3.generateMessage(RULE_REMOTE, result.name);

          _this3.renderErrors();
        });
      });
    },
    validateItem: function validateItem(_ref2) {
      var _this4 = this;

      var name = _ref2.name,
          group = _ref2.group,
          value = _ref2.value,
          isKeyupChange = _ref2.isKeyupChange;
      var rules = this.rules[name] || this.defaultRules[name] || false;

      if (!rules) {
        return;
      }

      for (var rule in rules) {
        var ruleValue = rules[rule];

        if (rule !== RULE_REQUIRED && rule !== RULE_FUNCTION && value == "") {
          return;
        }

        switch (rule) {
          case RULE_FUNCTION:
            {
              if (typeof ruleValue !== "function") {
                break;
              }

              if (ruleValue(name, value)) {
                break;
              }

              this.generateMessage(RULE_FUNCTION, name, ruleValue);
              return;
            }

          case RULE_REQUIRED:
            {
              if (!ruleValue) {
                break;
              }

              if (group.length) {
                var isSuccessValidateGroup = false; // At least one item in group

                group.forEach(function (item) {
                  if (_this4.validateRequired(item)) {
                    isSuccessValidateGroup = true;
                  }
                });

                if (isSuccessValidateGroup) {
                  break;
                }
              } else {
                if (this.validateRequired(value)) {
                  break;
                }
              }

              this.generateMessage(RULE_REQUIRED, name);
              return;
            }

          case RULE_EMAIL:
            {
              if (!ruleValue) {
                break;
              }

              if (this.validateEmail(value)) {
                break;
              }

              this.generateMessage(RULE_EMAIL, name);
              return;
            }

          case RULE_MINLENGTH:
            {
              if (!ruleValue) {
                break;
              }

              if (this.validateMinLength(value, ruleValue)) {
                break;
              }

              this.generateMessage(RULE_MINLENGTH, name, ruleValue);
              return;
            }

          case RULE_MAXLENGTH:
            {
              if (!ruleValue) {
                break;
              }

              if (this.validateMaxLength(value, ruleValue)) {
                break;
              }

              this.generateMessage(RULE_MAXLENGTH, name, ruleValue);
              return;
            }

          case RULE_PHONE:
            {
              if (!ruleValue) {
                break;
              }

              if (this.validatePhone(value)) {
                break;
              }

              this.generateMessage(RULE_PHONE, name);
              return;
            }

          case RULE_PASSWORD:
            {
              if (!ruleValue) {
                break;
              }

              if (this.validatePassword(value)) {
                break;
              }

              this.generateMessage(RULE_PASSWORD, name);
              return;
            }

          case RULE_STRENGTH:
            {
              if (!ruleValue || (typeof ruleValue === "undefined" ? "undefined" : _typeof(ruleValue)) !== "object") {
                break;
              }

              if (ruleValue.default && this.validateStrengthPass(value)) {
                break;
              }

              if (ruleValue.custom) {
                var regexp = void 0;

                try {
                  regexp = new RegExp(ruleValue.custom);
                } catch (e) {
                  regexp = this.REGEXP.strengthPass; // eslint-disable-next-line no-console

                  console.error("Custom regexp for strength rule is not valid. Default regexp was used.");
                }

                if (regexp.test(value)) {
                  break;
                }
              }

              this.generateMessage(RULE_STRENGTH, name);
              return;
            }

          case RULE_ZIP:
            {
              if (!ruleValue) {
                break;
              }

              if (this.validateZip(value)) {
                break;
              }

              this.generateMessage(RULE_ZIP, name);
              return;
            }

          case RULE_REMOTE:
            {
              if (isKeyupChange) {
                break;
              }

              if (!ruleValue) {
                break;
              }

              var url = ruleValue.url,
                  successAnswer = ruleValue.successAnswer,
                  method = ruleValue.method,
                  sendParam = ruleValue.sendParam;
              var $elem = this.$form.querySelector('input[data-validate-field="' + name + '"]');
              this.setterEventListener($elem, "keyup", this.handlerKeyup, "remove");
              this.promisesRemote.push(this.validateRemote({
                name: name,
                value: value,
                url: url,
                method: method,
                sendParam: sendParam,
                successAnswer: successAnswer
              }));
              return;
            }
        }
      }
    },
    clearErrors: function clearErrors() {
      var $elems = document.querySelectorAll(".js-validate-error-label");

      for (var i = 0, len = $elems.length; i < len; ++i) {
        $elems[i].remove();
      }

      $elems = document.querySelectorAll(".js-validate-error-field");

      for (var _i = 0, _len = $elems.length; _i < _len; ++_i) {
        $elems[_i].classList.remove("js-validate-error-field");

        $elems[_i].style.border = "";
        $elems[_i].style.color = "";
      }

      $elems = document.querySelectorAll(".fa-exclamation-triangle");

      for (let j = 0; j < $elems.length; ++j) {
        $elems[j].classList.add("is-hidden");

        if ($elems[j].parentNode.parentNode.querySelector("input").value.length > 1) {
          try {
            $elems[j].parentNode.querySelector(".fa-check").classList.remove("is-hidden");
          } catch (err) {}
        }
      }
    },
    renderErrors: function renderErrors() {
      var _this5 = this;

      this.clearErrors();
      this.unlockForm();
      this.isValidationSuccess = false;

      if (Object.keys(this.result).length === 0) {
        this.isValidationSuccess = true;
        return;
      }

      for (var _item in this.result) {
        var message = this.result[_item].message;
        var $elems = this.$form.querySelectorAll('[data-validate-field="' + _item + '"]');
        var $elem = $elems[$elems.length - 1];
        var div = document.createElement("div");
        div.innerHTML = message;
        div.className = "js-validate-error-label";
        div.setAttribute("style", "color: " + this.colorWrong); //$elem.style.border = "1px solid " + this.colorWrong;
        //$elem.style.color = "" + this.colorWrong;

        $elem.classList.add("js-validate-error-field");

        if ($elem.type === "checkbox" || $elem.type === "radio") {
          var $label = document.querySelector('label[for="' + $elem.getAttribute("id") + '"]');

          if ($elem.parentNode.tagName.toLowerCase() === "label") {
            $elem.parentNode.parentNode.insertBefore(div, null);
          } else if ($label) {
            $label.parentNode.insertBefore(div, $label.nextSibling);
          } else {
            $elem.parentNode.insertBefore(div, $elem.nextSibling);
          }
        } else {
          //$elem.parentNode.insertBefore(div, $elem.nextSibling);
          $elem.parentNode.querySelector(".fa-exclamation-triangle").classList.remove("is-hidden");
          $elem.parentNode.querySelector(".fa-check").classList.add("is-hidden");
        }
      }

      if (!this.tooltipSelectorWrap.length) {
        return;
      }

      this.state.tooltipsTimer = setTimeout(function () {
        _this5.hideTooltips();
      }, this.tooltipFadeOutTime);
    },
    hideTooltips: function hideTooltips() {
      var _this6 = this;

      var $elemsErrorLabel = document.querySelectorAll(".js-validate-error-label");
      $elemsErrorLabel.forEach(function (item) {
        item.classList.add(_this6.tooltipFadeOutClass);
      });
      this.state.tooltipsTimer = null;
    },
    lockForm: function lockForm() {
      var $elems = this.$form.querySelectorAll("input, textarea, button, select");

      for (var i = 0, len = $elems.length; i < len; ++i) {
        $elems[i].setAttribute("disabled", "disabled");
        $elems[i].style.pointerEvents = "none";
        $elems[i].style.webitFilter = "grayscale(100%)";
        $elems[i].style.filter = "grayscale(100%)";
      }
    },
    unlockForm: function unlockForm() {
      var $elems = this.$form.querySelectorAll("input, textarea, button, select");

      for (var i = 0, len = $elems.length; i < len; ++i) {
        $elems[i].removeAttribute("disabled");
        $elems[i].style.pointerEvents = "";
        $elems[i].style.webitFilter = "";
        $elems[i].style.filter = "";
      }
    }
  };
  window.JustValidate = JustValidate;
})(window);

/***/ }),

/***/ "./src/js/lib/services/maskPhone.js":
/*!******************************************!*\
  !*** ./src/js/lib/services/maskPhone.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function maskPhone(selector, masked = "+7 (___) ___-__-__") {
  const elems = document.querySelectorAll(selector);

  function mask(event) {
    const keyCode = event.keyCode;
    const template = masked,
          def = template.replace(/\D/g, ""),
          val = this.value.replace(/\D/g, "");
    console.log(template);
    let i = 0,
        newValue = template.replace(/[_\d]/g, function (a) {
      return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
    });
    i = newValue.indexOf("_");

    if (i !== -1) {
      newValue = newValue.slice(0, i);
    }

    let reg = template.substr(0, this.value.length).replace(/_+/g, function (a) {
      return "\\d{1," + a.length + "}";
    }).replace(/[+()]/g, "\\$&");
    reg = new RegExp("^" + reg + "$");

    if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) {
      this.value = newValue;
    }

    if (event.type === "blur" && this.value.length < 5) {
      this.value = "";
    }
  }

  for (const elem of elems) {
    elem.addEventListener("input", mask);
    elem.addEventListener("focus", mask);
    elem.addEventListener("blur", mask);
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (maskPhone); // use
// maskPhone('селектор элементов', 'маска, если маску не передать
// то будет работать стандартная + 7(___) ___ - __ - __');

/***/ }),

/***/ "./src/js/lib/services/requests.js":
/*!*****************************************!*\
  !*** ./src/js/lib/services/requests.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core */ "./src/js/lib/core.js");
 // получить данные с сервера

_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.get = async function (url, dataTypeAnswer = "json") {
  let res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Could not fetch ${url}, status: ${res.status}`);
  }

  switch (dataTypeAnswer) {
    case "json":
      return await res.json();

    case "text":
      return await res.text();

    case "blob":
      return await res.blob();
  }
}; // передать данные на сервер


_core__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.post = async function (url, data, dataTypeAnswer = "text") {
  let res = await fetch(url, {
    method: "POST",
    body: data
  });

  switch (dataTypeAnswer) {
    case "json":
      return await res.json();

    case "text":
      return await res.text();

    case "blob":
      return await res.blob();
  }
};

/***/ }),

/***/ "./node_modules/core-js/internals/a-callable.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/a-callable.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var tryToString = __webpack_require__(/*! ../internals/try-to-string */ "./node_modules/core-js/internals/try-to-string.js");

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw TypeError(tryToString(argument) + ' is not a function');
};


/***/ }),

/***/ "./node_modules/core-js/internals/an-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/an-object.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

// `Assert: Type(argument) is Object`
module.exports = function (argument) {
  if (isObject(argument)) return argument;
  throw TypeError(String(argument) + ' is not an object');
};


/***/ }),

/***/ "./node_modules/core-js/internals/array-includes.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/array-includes.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var toAbsoluteIndex = __webpack_require__(/*! ../internals/to-absolute-index */ "./node_modules/core-js/internals/to-absolute-index.js");
var lengthOfArrayLike = __webpack_require__(/*! ../internals/length-of-array-like */ "./node_modules/core-js/internals/length-of-array-like.js");

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),

/***/ "./node_modules/core-js/internals/classof-raw.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/classof-raw.js ***!
  \*******************************************************/
/***/ ((module) => {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ "./node_modules/core-js/internals/copy-constructor-properties.js":
/*!***********************************************************************!*\
  !*** ./node_modules/core-js/internals/copy-constructor-properties.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var ownKeys = __webpack_require__(/*! ../internals/own-keys */ "./node_modules/core-js/internals/own-keys.js");
var getOwnPropertyDescriptorModule = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "./node_modules/core-js/internals/object-get-own-property-descriptor.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/create-non-enumerable-property.js":
/*!**************************************************************************!*\
  !*** ./node_modules/core-js/internals/create-non-enumerable-property.js ***!
  \**************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "./node_modules/core-js/internals/create-property-descriptor.js":
/*!**********************************************************************!*\
  !*** ./node_modules/core-js/internals/create-property-descriptor.js ***!
  \**********************************************************************/
/***/ ((module) => {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "./node_modules/core-js/internals/descriptors.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/descriptors.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});


/***/ }),

/***/ "./node_modules/core-js/internals/document-create-element.js":
/*!*******************************************************************!*\
  !*** ./node_modules/core-js/internals/document-create-element.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ "./node_modules/core-js/internals/engine-is-ios.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/engine-is-ios.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var userAgent = __webpack_require__(/*! ../internals/engine-user-agent */ "./node_modules/core-js/internals/engine-user-agent.js");

module.exports = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent);


/***/ }),

/***/ "./node_modules/core-js/internals/engine-is-node.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/engine-is-node.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classof = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");

module.exports = classof(global.process) == 'process';


/***/ }),

/***/ "./node_modules/core-js/internals/engine-user-agent.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/engine-user-agent.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");

module.exports = getBuiltIn('navigator', 'userAgent') || '';


/***/ }),

/***/ "./node_modules/core-js/internals/engine-v8-version.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/engine-v8-version.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var userAgent = __webpack_require__(/*! ../internals/engine-user-agent */ "./node_modules/core-js/internals/engine-user-agent.js");

var process = global.process;
var Deno = global.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] < 4 ? 1 : match[0] + match[1];
} else if (userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

module.exports = version && +version;


/***/ }),

/***/ "./node_modules/core-js/internals/enum-bug-keys.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/enum-bug-keys.js ***!
  \*********************************************************/
/***/ ((module) => {

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),

/***/ "./node_modules/core-js/internals/export.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/export.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var getOwnPropertyDescriptor = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "./node_modules/core-js/internals/object-get-own-property-descriptor.js").f;
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");
var redefine = __webpack_require__(/*! ../internals/redefine */ "./node_modules/core-js/internals/redefine.js");
var setGlobal = __webpack_require__(/*! ../internals/set-global */ "./node_modules/core-js/internals/set-global.js");
var copyConstructorProperties = __webpack_require__(/*! ../internals/copy-constructor-properties */ "./node_modules/core-js/internals/copy-constructor-properties.js");
var isForced = __webpack_require__(/*! ../internals/is-forced */ "./node_modules/core-js/internals/is-forced.js");

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
  options.name        - the .name of the function if it does not match the key
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/fails.js":
/*!*************************************************!*\
  !*** ./node_modules/core-js/internals/fails.js ***!
  \*************************************************/
/***/ ((module) => {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/function-bind-context.js":
/*!*****************************************************************!*\
  !*** ./node_modules/core-js/internals/function-bind-context.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var aCallable = __webpack_require__(/*! ../internals/a-callable */ "./node_modules/core-js/internals/a-callable.js");

// optional / simple context binding
module.exports = function (fn, that, length) {
  aCallable(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "./node_modules/core-js/internals/function-name.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/function-name.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");

var FunctionPrototype = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

module.exports = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};


/***/ }),

/***/ "./node_modules/core-js/internals/get-built-in.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/get-built-in.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global[namespace]) : global[namespace] && global[namespace][method];
};


/***/ }),

/***/ "./node_modules/core-js/internals/get-method.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/get-method.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var aCallable = __webpack_require__(/*! ../internals/a-callable */ "./node_modules/core-js/internals/a-callable.js");

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (V, P) {
  var func = V[P];
  return func == null ? undefined : aCallable(func);
};


/***/ }),

/***/ "./node_modules/core-js/internals/global.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/global.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof __webpack_require__.g == 'object' && __webpack_require__.g) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();


/***/ }),

/***/ "./node_modules/core-js/internals/has-own-property.js":
/*!************************************************************!*\
  !*** ./node_modules/core-js/internals/has-own-property.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");

var hasOwnProperty = {}.hasOwnProperty;

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
module.exports = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty.call(toObject(it), key);
};


/***/ }),

/***/ "./node_modules/core-js/internals/hidden-keys.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/hidden-keys.js ***!
  \*******************************************************/
/***/ ((module) => {

module.exports = {};


/***/ }),

/***/ "./node_modules/core-js/internals/html.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/internals/html.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),

/***/ "./node_modules/core-js/internals/ie8-dom-define.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/ie8-dom-define.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var createElement = __webpack_require__(/*! ../internals/document-create-element */ "./node_modules/core-js/internals/document-create-element.js");

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- requied for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});


/***/ }),

/***/ "./node_modules/core-js/internals/indexed-object.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/indexed-object.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;


/***/ }),

/***/ "./node_modules/core-js/internals/inspect-source.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/inspect-source.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var store = __webpack_require__(/*! ../internals/shared-store */ "./node_modules/core-js/internals/shared-store.js");

var functionToString = Function.toString;

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

module.exports = store.inspectSource;


/***/ }),

/***/ "./node_modules/core-js/internals/internal-state.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/internal-state.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var NATIVE_WEAK_MAP = __webpack_require__(/*! ../internals/native-weak-map */ "./node_modules/core-js/internals/native-weak-map.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var shared = __webpack_require__(/*! ../internals/shared-store */ "./node_modules/core-js/internals/shared-store.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "./node_modules/core-js/internals/shared-key.js");
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store = shared.state || (shared.state = new WeakMap());
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    if (wmhas.call(store, it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-callable.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/is-callable.js ***!
  \*******************************************************/
/***/ ((module) => {

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
module.exports = function (argument) {
  return typeof argument === 'function';
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-forced.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-forced.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),

/***/ "./node_modules/core-js/internals/is-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-object.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : isCallable(it);
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-pure.js":
/*!***************************************************!*\
  !*** ./node_modules/core-js/internals/is-pure.js ***!
  \***************************************************/
/***/ ((module) => {

module.exports = false;


/***/ }),

/***/ "./node_modules/core-js/internals/is-symbol.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-symbol.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");
var USE_SYMBOL_AS_UID = __webpack_require__(/*! ../internals/use-symbol-as-uid */ "./node_modules/core-js/internals/use-symbol-as-uid.js");

module.exports = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && Object(it) instanceof $Symbol;
};


/***/ }),

/***/ "./node_modules/core-js/internals/length-of-array-like.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/length-of-array-like.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toLength = __webpack_require__(/*! ../internals/to-length */ "./node_modules/core-js/internals/to-length.js");

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
module.exports = function (obj) {
  return toLength(obj.length);
};


/***/ }),

/***/ "./node_modules/core-js/internals/native-symbol.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/native-symbol.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = __webpack_require__(/*! ../internals/engine-v8-version */ "./node_modules/core-js/internals/engine-v8-version.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol();
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});


/***/ }),

/***/ "./node_modules/core-js/internals/native-weak-map.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/native-weak-map.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var inspectSource = __webpack_require__(/*! ../internals/inspect-source */ "./node_modules/core-js/internals/inspect-source.js");

var WeakMap = global.WeakMap;

module.exports = isCallable(WeakMap) && /native code/.test(inspectSource(WeakMap));


/***/ }),

/***/ "./node_modules/core-js/internals/object-define-property.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/internals/object-define-property.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "./node_modules/core-js/internals/ie8-dom-define.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var toPropertyKey = __webpack_require__(/*! ../internals/to-property-key */ "./node_modules/core-js/internals/to-property-key.js");

// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-descriptor.js":
/*!******************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-descriptor.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var propertyIsEnumerableModule = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "./node_modules/core-js/internals/object-property-is-enumerable.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var toPropertyKey = __webpack_require__(/*! ../internals/to-property-key */ "./node_modules/core-js/internals/to-property-key.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "./node_modules/core-js/internals/ie8-dom-define.js");

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-names.js":
/*!*************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-names.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var internalObjectKeys = __webpack_require__(/*! ../internals/object-keys-internal */ "./node_modules/core-js/internals/object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "./node_modules/core-js/internals/enum-bug-keys.js");

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-symbols.js":
/*!***************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-symbols.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ "./node_modules/core-js/internals/object-keys-internal.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/object-keys-internal.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var indexOf = __webpack_require__(/*! ../internals/array-includes */ "./node_modules/core-js/internals/array-includes.js").indexOf;
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-property-is-enumerable.js":
/*!*************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-property-is-enumerable.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;


/***/ }),

/***/ "./node_modules/core-js/internals/ordinary-to-primitive.js":
/*!*****************************************************************!*\
  !*** ./node_modules/core-js/internals/ordinary-to-primitive.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
module.exports = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = fn.call(input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = fn.call(input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "./node_modules/core-js/internals/own-keys.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/internals/own-keys.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");
var getOwnPropertyNamesModule = __webpack_require__(/*! ../internals/object-get-own-property-names */ "./node_modules/core-js/internals/object-get-own-property-names.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "./node_modules/core-js/internals/object-get-own-property-symbols.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ "./node_modules/core-js/internals/redefine.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/internals/redefine.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var createNonEnumerableProperty = __webpack_require__(/*! ../internals/create-non-enumerable-property */ "./node_modules/core-js/internals/create-non-enumerable-property.js");
var setGlobal = __webpack_require__(/*! ../internals/set-global */ "./node_modules/core-js/internals/set-global.js");
var inspectSource = __webpack_require__(/*! ../internals/inspect-source */ "./node_modules/core-js/internals/inspect-source.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "./node_modules/core-js/internals/internal-state.js");
var CONFIGURABLE_FUNCTION_NAME = __webpack_require__(/*! ../internals/function-name */ "./node_modules/core-js/internals/function-name.js").CONFIGURABLE;

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  var name = options && options.name !== undefined ? options.name : key;
  var state;
  if (isCallable(value)) {
    if (String(name).slice(0, 7) === 'Symbol(') {
      name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
    }
    if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
      createNonEnumerableProperty(value, 'name', name);
    }
    state = enforceInternalState(value);
    if (!state.source) {
      state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
    }
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
});


/***/ }),

/***/ "./node_modules/core-js/internals/require-object-coercible.js":
/*!********************************************************************!*\
  !*** ./node_modules/core-js/internals/require-object-coercible.js ***!
  \********************************************************************/
/***/ ((module) => {

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ "./node_modules/core-js/internals/set-global.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/set-global.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");

module.exports = function (key, value) {
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty(global, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),

/***/ "./node_modules/core-js/internals/shared-key.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/shared-key.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var shared = __webpack_require__(/*! ../internals/shared */ "./node_modules/core-js/internals/shared.js");
var uid = __webpack_require__(/*! ../internals/uid */ "./node_modules/core-js/internals/uid.js");

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ "./node_modules/core-js/internals/shared-store.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/shared-store.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var setGlobal = __webpack_require__(/*! ../internals/set-global */ "./node_modules/core-js/internals/set-global.js");

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

module.exports = store;


/***/ }),

/***/ "./node_modules/core-js/internals/shared.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/shared.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "./node_modules/core-js/internals/is-pure.js");
var store = __webpack_require__(/*! ../internals/shared-store */ "./node_modules/core-js/internals/shared-store.js");

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.18.3',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ "./node_modules/core-js/internals/task.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/internals/task.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isCallable = __webpack_require__(/*! ../internals/is-callable */ "./node_modules/core-js/internals/is-callable.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var bind = __webpack_require__(/*! ../internals/function-bind-context */ "./node_modules/core-js/internals/function-bind-context.js");
var html = __webpack_require__(/*! ../internals/html */ "./node_modules/core-js/internals/html.js");
var createElement = __webpack_require__(/*! ../internals/document-create-element */ "./node_modules/core-js/internals/document-create-element.js");
var IS_IOS = __webpack_require__(/*! ../internals/engine-is-ios */ "./node_modules/core-js/internals/engine-is-ios.js");
var IS_NODE = __webpack_require__(/*! ../internals/engine-is-node */ "./node_modules/core-js/internals/engine-is-node.js");

var set = global.setImmediate;
var clear = global.clearImmediate;
var process = global.process;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var location, defer, channel, port;

try {
  // Deno throws a ReferenceError on `location` access without `--location` flag
  location = global.location;
} catch (error) { /* empty */ }

var run = function (id) {
  // eslint-disable-next-line no-prototype-builtins -- safe
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global.postMessage(String(id), location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set || !clear) {
  set = function setImmediate(fn) {
    var args = [];
    var argumentsLength = arguments.length;
    var i = 1;
    while (argumentsLength > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func -- spec requirement
      (isCallable(fn) ? fn : Function(fn)).apply(undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (IS_NODE) {
    defer = function (id) {
      process.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !IS_IOS) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = bind(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global.addEventListener &&
    isCallable(global.postMessage) &&
    !global.importScripts &&
    location && location.protocol !== 'file:' &&
    !fails(post)
  ) {
    defer = post;
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in createElement('script')) {
    defer = function (id) {
      html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

module.exports = {
  set: set,
  clear: clear
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-absolute-index.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/to-absolute-index.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toIntegerOrInfinity = __webpack_require__(/*! ../internals/to-integer-or-infinity */ "./node_modules/core-js/internals/to-integer-or-infinity.js");

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-indexed-object.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/to-indexed-object.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "./node_modules/core-js/internals/indexed-object.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-integer-or-infinity.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/internals/to-integer-or-infinity.js ***!
  \******************************************************************/
/***/ ((module) => {

var ceil = Math.ceil;
var floor = Math.floor;

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- safe
  return number !== number || number === 0 ? 0 : (number > 0 ? floor : ceil)(number);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-length.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/to-length.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toIntegerOrInfinity = __webpack_require__(/*! ../internals/to-integer-or-infinity */ "./node_modules/core-js/internals/to-integer-or-infinity.js");

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/to-object.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
module.exports = function (argument) {
  return Object(requireObjectCoercible(argument));
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-primitive.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/to-primitive.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var isSymbol = __webpack_require__(/*! ../internals/is-symbol */ "./node_modules/core-js/internals/is-symbol.js");
var getMethod = __webpack_require__(/*! ../internals/get-method */ "./node_modules/core-js/internals/get-method.js");
var ordinaryToPrimitive = __webpack_require__(/*! ../internals/ordinary-to-primitive */ "./node_modules/core-js/internals/ordinary-to-primitive.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
module.exports = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = exoticToPrim.call(input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-property-key.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/to-property-key.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPrimitive = __webpack_require__(/*! ../internals/to-primitive */ "./node_modules/core-js/internals/to-primitive.js");
var isSymbol = __webpack_require__(/*! ../internals/is-symbol */ "./node_modules/core-js/internals/is-symbol.js");

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : String(key);
};


/***/ }),

/***/ "./node_modules/core-js/internals/try-to-string.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/try-to-string.js ***!
  \*********************************************************/
/***/ ((module) => {

module.exports = function (argument) {
  try {
    return String(argument);
  } catch (error) {
    return 'Object';
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/uid.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/internals/uid.js ***!
  \***********************************************/
/***/ ((module) => {

var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};


/***/ }),

/***/ "./node_modules/core-js/internals/use-symbol-as-uid.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/use-symbol-as-uid.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/native-symbol */ "./node_modules/core-js/internals/native-symbol.js");

module.exports = NATIVE_SYMBOL
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';


/***/ }),

/***/ "./node_modules/core-js/internals/well-known-symbol.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/well-known-symbol.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var shared = __webpack_require__(/*! ../internals/shared */ "./node_modules/core-js/internals/shared.js");
var hasOwn = __webpack_require__(/*! ../internals/has-own-property */ "./node_modules/core-js/internals/has-own-property.js");
var uid = __webpack_require__(/*! ../internals/uid */ "./node_modules/core-js/internals/uid.js");
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/native-symbol */ "./node_modules/core-js/internals/native-symbol.js");
var USE_SYMBOL_AS_UID = __webpack_require__(/*! ../internals/use-symbol-as-uid */ "./node_modules/core-js/internals/use-symbol-as-uid.js");

var WellKnownSymbolsStore = shared('wks');
var Symbol = global.Symbol;
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!hasOwn(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == 'string')) {
    if (NATIVE_SYMBOL && hasOwn(Symbol, name)) {
      WellKnownSymbolsStore[name] = Symbol[name];
    } else {
      WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
    }
  } return WellKnownSymbolsStore[name];
};


/***/ }),

/***/ "./node_modules/core-js/modules/web.immediate.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/modules/web.immediate.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var task = __webpack_require__(/*! ../internals/task */ "./node_modules/core-js/internals/task.js");

var FORCED = !global.setImmediate || !global.clearImmediate;

// http://w3c.github.io/setImmediate/
$({ global: true, bind: true, enumerable: true, forced: FORCED }, {
  // `setImmediate` method
  // http://w3c.github.io/setImmediate/#si-setImmediate
  setImmediate: task.set,
  // `clearImmediate` method
  // http://w3c.github.io/setImmediate/#si-clearImmediate
  clearImmediate: task.clear
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_lib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/lib */ "./src/js/lib/lib.js");
/* harmony import */ var animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! animejs/lib/anime.es.js */ "./node_modules/animejs/lib/anime.es.js");
/* harmony import */ var _lib_components_tiny_slider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/components/tiny-slider */ "./src/js/lib/components/tiny-slider.js");



window.addEventListener("DOMContentLoaded", () => {
  // анимация заголовка siction hero
  function textHeroAnim() {
    const text = document.querySelector(".text");
    text.innerHTML = text.textContent.replace(/\S/g, "<span style ='display: inline-block;'>$&</span>");
    const targets = document.querySelectorAll(".text span");
    let tl = animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"].timeline({
      loop: true
    });
    tl.add({
      targets: targets,
      translateX: [0, -1000],
      scale: [1, 1],
      opacity: [1, 0],
      easing: "easeOutExpo",
      duration: 2000,
      delay: animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"].stagger(100)
    }).add({
      targets: targets,
      translateX: [1000, 0],
      scale: [1, 1],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: 2000,
      delay: animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"].stagger(100),
      endDelay: 5000
    });
  }

  textHeroAnim(); //анимация контента при скролле страницы

  const animItems = (0,_lib_lib__WEBPACK_IMPORTED_MODULE_0__["default"])(".anime");

  for (let i = 0; i < animItems.length; i++) {
    new IntersectionObserver(entries => {
      let direct,
          d = Math.round(Math.random());

      if (entries[0].isIntersecting === true) {
        if (entries[0].intersectionRatio === 1) {//("Target is fully visible in the screen");
        } else if (entries[0].intersectionRatio > 0.3) {//("More than 30% of target is visible in the screen");
        } else {
          //("Less than 30% of target is visible in the screen");
          if (d > 0) {
            direct = ["99%", 0];
          } else {
            direct = ["-99%", 0];
          }

          if (!animItems[i].classList.contains("shownd")) {
            (0,animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
              targets: animItems[i],
              translateX: direct,
              opacity: [0, 1],
              duration: 3000,
              easing: "easeOutElastic(1, 1.5)"
            });
          }

          animItems[i].classList.add("shownd");
        }
      } else {
        //("Target is not visible in the screen");
        if (animItems[i].classList.contains("shownd")) {
          animItems[i].classList.remove("shownd");
        }
      }
    }, {
      threshold: [0, 0.3, 1]
    }).observe(animItems[i]);
  } //карусель


  let slider = (0,_lib_components_tiny_slider__WEBPACK_IMPORTED_MODULE_2__.tns)({
    container: ".my-slider",
    items: 2,
    //количество для отображения
    gutter: 20,
    //расстояние между слайдами px
    slideBy: 2,
    //количество слайдов перекл за клик
    navPosition: "bottom",
    //расположение точек снизу
    mouseDrag: true,
    //смана слайдов перетаскиванием
    autoplay: true,
    //автолистание
    autoplayTimeout: 10000,
    //время между автолистанием
    autoplayButtonOutput: false,
    //кнопка autoplay, если autoplay=true не работает
    mode: "carousel",
    //режимы "carousel" | "gallery"
    speed: 1500,
    //скорость анимации слайдов (в "мс").
    controlsContainer: "#custom-control",
    //контейнер кнопок prev/next.
    //controls: false, //Управляет отображением и возможностями компонентов управления  prev/next
    //controlsPosition: "bottom",//положение элементов управления
    // nav: false,//отображение и возможности точек навигации
    edgePadding: 20,
    //пространство снаружи (в "px").
    loop: true //зацикливание перемещения по слайдам

    /*    responsive: {
    0: {
       items: 1,
       nav: false,
    },
    768: {
       items: 2,
       nav: true,
    },
    1440: {
       items: 3,
    },
    }, */

  }); //сдвиг карточек services

  function cardShift() {
    const fronts = document.querySelectorAll("#services .card-inner"),
          backs = document.querySelectorAll("#services .card-back"),
          duration = 500;
    fronts.forEach((front, i) => {
      front.querySelector("img").addEventListener("click", () => {
        //front.classList.add("is-hidden");
        //backs[i].classList.remove("is-hidden");
        pushUp(front, backs[i], duration);
      });
    });
    backs.forEach((back, i) => {
      back.addEventListener("click", () => {
        //fronts[i].classList.remove("is-hidden");
        //back.classList.add("is-hidden");
        pushDown(fronts[i], back, duration);
      });
    });
  }

  cardShift();

  function pushUp(target, targetBack, duration) {
    targetBack.classList.remove("is-hidden");
    var tl = animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"].timeline({
      targets: target,
      translateY: "-100%",
      opacity: [1, 0],
      duration: duration,
      easing: "easeInOutBack"
    });
    tl.add({
      targets: targetBack,
      translateY: "-100%",
      opacity: [0, 1],
      duration: duration,
      easing: "easeInOutBack"
    });
  }

  function pushDown(target, targetBack, duration) {
    target.querySelector("img").style.pointerEvents = "none";
    var tl = animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"].timeline({
      targets: target,
      translateY: "0%",
      opacity: [0, 1],
      duration: duration,
      easing: "easeInOutBack"
    });
    tl.add({
      targets: targetBack,
      translateY: "0%",
      opacity: [1, 0],
      duration: duration,
      easing: "easeInOutBack"
    });
    tl.add({
      complete: function () {
        targetBack.classList.add("is-hidden");
        target.querySelector("img").style.pointerEvents = "";
      }
    });
  } //поворот карточек features


  function cardRotate() {
    const cards = document.querySelectorAll("#features .card");
    cards.forEach(card => {
      const btn = card.querySelector("button");
      btn.addEventListener("click", () => {
        roteteCard(card, 1000);
      });
    });
  }

  cardRotate();

  function roteteCard(target, duration) {
    var tl = animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"].timeline({
      duration: duration,
      easing: "easeOutBounce"
    });
    tl.add({
      targets: target,
      rotateY: 180
    });
    tl.add({
      targets: target,
      rotateY: 0
    });
  } //анимация надписей цены


  function priceAnim() {
    const prices = document.querySelectorAll("#pricing .card");
    prices.forEach(price => {
      const btn = price.querySelector("button");
      btn.addEventListener("click", () => {
        animePrice(price, 1000);
      });
    });
  }

  priceAnim();

  function animePrice(target, duration) {
    const targets = target.querySelectorAll("p");
    var tl = animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"].timeline({
      duration: duration,
      easing: "easeOutBounce"
    });
    tl.add({
      targets: targets,
      translateX: ["-100%", "0"],
      scale: [1, 1],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: 2000,
      delay: animejs_lib_anime_es_js__WEBPACK_IMPORTED_MODULE_1__["default"].stagger(200)
    });
  }
});
})();

/******/ })()
;
//# sourceMappingURL=script.js.map