// Based on jQuery UI's implemenation of easing equations
// from Robert Penner (http://www.robertpenner.com/easing)
import { minMax } from './utils.js';

const eases = {
  linear: () => t => t
};

const functionEasings = {
  Sine: () => t => 1 - Math.cos(t * Math.PI / 2),
  Circ: () => t => 1 - Math.sqrt(1 - t * t),
  Back: () => t => t * t * (3 * t - 2),
  Bounce: () => t => {
    let pow2; let b = 4;
    while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) {};
    return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
  },
  Elastic: (amplitude = 1, period = .5) => {
    const a = minMax(amplitude, 1, 10);
    const p = minMax(period, .1, 2);
    return t => {
      return (t === 0 || t === 1) ? t : 
        -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
    };
  },
  Quad: () => t => Math.pow(t, 2),
  Cubic: () => t => Math.pow(t, 3),
  Quart: () => t => Math.pow(t, 4),
  Quint: () => t => Math.pow(t, 5),
  Expo: () => t => Math.pow(t, 6),
};

Object.keys(functionEasings).forEach(name => {
  const easeIn = functionEasings[name];
  eases[`easeIn${name}`] = easeIn;
  eases[`easeOut${name}`] = (a, b) => t => 1 - easeIn(a, b)(1 - t);
  eases[`easeInOut${name}`] = (a, b) => t => t < 0.5
    ? easeIn(a, b)(t * 2) / 2
    : 1 - easeIn(a, b)(t * -2 + 2) / 2;
  eases[`easeOutIn${name}`] = (a, b) => t => t < 0.5
    ? (1 - easeIn(a, b)(1 - t * 2)) / 2
    : (easeIn(a, b)(t * 2 - 1) + 1) / 2;
});

export default eases;