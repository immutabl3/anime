import { isFunction } from '@immutabl3/utils';
import spring from './spring.js';
import {
  isKey,
  isObj,
  isPth,
  mergeObjects,
} from './utils.js';

const rSpring = /^spring/;

const normalizePropertyTweens = (prop, tweenSettings) => {
  const settings = { ...tweenSettings };
  // override duration if easing is a spring
  if (rSpring.test(settings.easing)) settings.duration = spring(settings.easing);
  if (Array.isArray(prop)) {
    const l = prop.length;
    const isFromTo = (l === 2 && !isObj(prop[0]));
    if (!isFromTo) {
      // duration divided by the number of tweens
      if (!isFunction(tweenSettings.duration)) settings.duration = tweenSettings.duration / l;
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      // eslint-disable-next-line no-param-reassign
      prop = { value: prop };
    }
  }
  const propArray = Array.isArray(prop) ? prop : [prop];
  return propArray
    .map((v, i) => {
      const obj = isObj(v) && !isPth(v) ? v : { value: v };
      // default delay value should only be applied to the first tween
      if (obj.delay === undefined) obj.delay = !i ? tweenSettings.delay : 0;
      // default endDelay value should only be applied to the last tween
      if (obj.endDelay === undefined) obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0;
      return obj;
    })
    .map(k => mergeObjects(k, settings));
};

const flattenKeyframes = keyframes => {
  const propertyNames = Array.from(
    new Set(
      keyframes
        .map(key => Object.keys(key).filter(isKey))
        .flat()
    ).values()
  );
  const properties = {};
  for (const propName of propertyNames) {
    const newKey = {};
    for (const key of keyframes) {
      for (const p in key) {
        if (isKey(p)) {
          if (p === propName) newKey.value = key[p];
        } else {
          newKey[p] = key[p];
        }
      }
    }
    properties[propName] = newKey;
  }
  return properties;
};

export const getProperties = (tweenSettings, params) => {
  const properties = [];
  const { keyframes } = params;
  // eslint-disable-next-line no-param-reassign
  if (keyframes) params = mergeObjects(flattenKeyframes(keyframes), params);
  for (const p in params) {
    if (isKey(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
};