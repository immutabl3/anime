// Basic steps easing implementation
// https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function
import { isFunction } from '@immutabl3/utils';
import penner from './penner.js';
import bezier from './bezier.js';
import spring from './spring.js';
import { minMax } from './utils.js';

const steps = (steps = 10) => {
  return t => Math.ceil((minMax(t, 0.000001, 1)) * steps) * (1 / steps);
};

export const parseEasingParameters = string => {
  const match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(p => parseFloat(p)) : [];
};

export const parseEasings = (easing, duration) => {
  if (isFunction(easing)) return easing;
  const name = easing.split('(')[0];
  const ease = penner[name];
  const args = parseEasingParameters(easing);
  if (name === 'spring') return spring(easing, duration);
  if (name === 'cubicBezier') return bezier(...args);
  if (name === 'steps') return steps(...args);
  return ease(...args);
};