import {
  isPth,
  isSvg,
  isColor,
} from './utils';
import {
  getUnit,
} from './units';
import {
  parseEasings,
} from './easing.js';
import {
  getRelativeValue,
  getFunctionValue,
  getOriginalTargetValue,
} from './values.js';
import {
  decomposeValue,
} from './maths.js';

const normalizeTweenValues = (tween, animatable) => {
  for (const key in tween) {
    let value = getFunctionValue(tween[key], animatable);
    if (Array.isArray(value)) {
      const arr = [];
      for (const v of value) {
        arr.push(getFunctionValue(v, animatable));
      }
      value = arr.length === 1 ? arr[0] : arr;
    }
    tween[key] = value;
  }
  tween.duration = parseFloat(tween.duration);
  tween.delay = parseFloat(tween.delay);
  return tween;
};

export const normalizeTweens = (prop, animatable) => {
  let previousTween;
  return prop.tweens.map(t => {
    const tween = normalizeTweenValues(t, animatable);
    const tweenValue = tween.value;
    let to = Array.isArray(tweenValue) ? tweenValue[1] : tweenValue;
    const toUnit = getUnit(to);
    const originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    const previousValue = previousTween ? previousTween.to.original : originalValue;
    const from = Array.isArray(tweenValue) ? tweenValue[0] : previousValue;
    const fromUnit = getUnit(from) || getUnit(originalValue);
    const unit = toUnit || fromUnit;
    if (to === undefined) to = previousValue;
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = isPth(tweenValue);
    tween.isPathTargetInsideSVG = tween.isPath && isSvg(animatable.target);
    tween.isColor = isColor(tween.from.original);
    if (tween.isColor) tween.round = 1;
    previousTween = tween;
    return tween;
  });
};

export const setProgressValue = {
  css: (t, p, v) => (t.style[p] = v),
  attribute: (t, p, v) => t.setAttribute(p, v),
  object: (t, p, v) => (t[p] = v),
  transform: (t, p, v, transforms, manual) => {
    transforms.set(p, v);
    if (p === transforms.last || manual) {
      let str = '';
      for (const [prop, value] of transforms.entries()) {
        str += `${prop}(${value}) `;
      }
      t.style.transform = str;
    }
  }
};
