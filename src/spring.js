// Spring solver inspired by Webkit Copyright © 2016 Apple Inc.
// All rights reserved. https://webkit.org/demos/spring/spring.js
import { minMax } from './utils.js';
import { springs as springsCache } from './constants.js';
import { parseEasingParameters } from './easing.js';

export default function spring(string, duration) {
  const params = parseEasingParameters(string);
  const mass = minMax(params[0] === undefined ? 1 : params[0], .1, 100);
  const stiffness = minMax(params[1] === undefined ? 100 : params[1], .1, 100);
  const damping = minMax(params[2] === undefined ? 10 : params[2], .1, 100);
  const velocity = minMax(params[3] === undefined ? 0 : params[3], .1, 100);
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  const a = 1;
  const b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  const solver = t => {
    let progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) return t;
    return 1 - progress;
  };

  const getDuration = () => {
    const cached = springsCache.get(string);
    if (cached) return cached;
    const frame = 1 / 6;
    let elapsed = 0;
    let rest = 0;
    while (true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) break;
      } else {
        rest = 0;
      }
    }
    const duration = elapsed * frame * 1000;
    springsCache.set(string, duration);
    return duration;
  };

  return duration ? solver : getDuration;
};
