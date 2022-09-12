import { isFunction } from '@immutabl3/utils';
import {
  css as cssCache,
} from './constants.js';
import {
  validTransforms,
} from './defaults.js';
import {
  colorToRgb,
} from './colors.js';
import {
  getUnit,
  getTransformUnit,
} from './units.js';
import {
  isNil,
  isSvg,
  isDom,
  isColor,
  isHtmlInput,
} from './utils.js';

export const getFunctionValue = (val, animatable) => {
  if (!isFunction(val)) return val;
  return val(animatable.target, animatable.id, animatable.total);
};

export const getAttribute = (el, prop) => el.getAttribute(prop);

const validUnits = new Set(['deg', 'rad', 'turn']);

export const convertPxToUnit = (el, value, unit) => {
  const valueUnit = getUnit(value);
  if (valueUnit === unit || validUnits.has(valueUnit)) return value;
  const cached = cssCache.get(value + unit);
  if (cached !== undefined) return cached;
  const baseline = 100;
  const tempEl = document.createElement(el.tagName);
  const parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  const factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  const convertedUnit = factor * parseFloat(value);
  cssCache.set(value + unit, convertedUnit);
  return convertedUnit;
};

const hasCSSValue = (el, prop) => {
  if (prop in el.style) return true;
  return false;
};

const getCSSValue = (el, prop, unit) => {
  if (!hasCSSValue(el, prop)) return '';
  const uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
  return unit ? convertPxToUnit(el, value, unit) : value;
};

export const getAnimationType = (el, prop) => {
  if (isDom(el) && !isHtmlInput(el) && (!isNil(getAttribute(el, prop)) || (isSvg(el) && el[prop]))) return 'attribute';
  if (isDom(el) && validTransforms.has(prop)) return 'transform';
  if (isDom(el) && (prop !== 'transform' && hasCSSValue(el, prop))) return 'css';
  // eslint-disable-next-line eqeqeq
  if (el[prop] != null) return 'object';
  return '';
};

export const getElementTransforms = el => {
  if (!isDom(el)) return;
  const str = el.style.transform || '';
  const reg = /(\w+)\(([^)]*)\)/g;
  const transforms = new Map();
  let m;
  while (m = reg.exec(str)) transforms.set(m[1], m[2]);
  return transforms;
};

const getTransformValue = (el, propName, animatable, unit) => {
  const defaultVal = propName.includes('scale')
    ? 1
    : 0 + getTransformUnit(propName);
  const value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.set(propName, value);
    animatable.transforms.last = propName;
  }
  return unit
    ? convertPxToUnit(el, value, unit)
    : value;
};

export const getOriginalTargetValue = (target, propName, unit, animatable) => {
  const type = getAnimationType(target, propName);
  if (type === 'transform') return getTransformValue(target, propName, animatable, unit);
  if (type === 'css') return getCSSValue(target, propName, unit);
  if (type === 'attribute') return getAttribute(target, propName);
  return target[propName] || 0;
};

export const getRelativeValue = (to, from) => {
  const operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) return to;
  const u = getUnit(to) || 0;
  const x = parseFloat(from);
  const y = parseFloat(to.replace(operator[0], ''));
  const o = operator[0][0];
  if (o === '+') return x + y + u;
  if (o === '-') return x - y + u;
  if (o === '*') return x * y + u;
};

export const validateValue = (val, unit) => {
  if (isColor(val)) return colorToRgb(val);
  if (/\s/g.test(val)) return val;
  const originalUnit = getUnit(val);
  const unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) return unitLess + unit;
  return unitLess;
};
