import { isString } from '@immutabl3/utils';
import {
  defaultTweenSettings,
  defaultInstanceSettings,
} from './defaults.js';

export const isKey = a => !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes';
export const isHsl = a => /^hsl/.test(a);
export const isRgb = a => /^rgb/.test(a);
export const isHex = a => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
export const isObj = a => Object.prototype.toString.call(a).includes('Object');
export const isPth = a => isObj(a) && a.hasOwnProperty('totalLength');
export const isHtmlInput = a => a instanceof HTMLInputElement;
export const isSvg = a => a instanceof globalThis.SVGElement;
export const isDom = a => a.nodeType || isSvg(a);
export const isNil = a => a === undefined || a === null;
export const isColor = a => (isHex(a) || isRgb(a) || isHsl(a));

export const minMax = (val, min, max) => {
  return Math.min(Math.max(val, min), max);
};

export const qsa = str => {
  try {
    return document.querySelectorAll(str);
  } catch {
    return;
  }
};

export const toArray = o => {
  if (Array.isArray(o)) return o;
  // eslint-disable-next-line no-param-reassign
  if (isString(o)) o = qsa(o) || o;
  if (o instanceof globalThis.NodeList || o instanceof globalThis.HTMLCollection) return [...o];
  return [o];
};

export const replaceObjectProps = (o1, o2) => {
  const o = { ...o1 };
  for (const p in o1) o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
  return o;
};

export const mergeObjects = (o1, o2) => {
  const o = { ...o1 };
  for (const p in o2) o[p] = o1[p] === undefined ? o2[p] : o1[p];
  return o;
};