import {
  last,
} from '@immutabl3/utils';
import {
  getAnimationType,
} from './values.js';
import {
  normalizeTweens,
} from './tweens.js';

const Animation = (animType, prop, animatable, tweens) => ({
  type: animType,
  property: prop.name,
  animatable,
  tweens,
  duration: last(tweens).end,
  delay: tweens[0].delay,
  endDelay: last(tweens).endDelay
});

export const getAnimations = (animatables, properties) => {
  const result = [];
  for (const animatable of animatables) {
    for (const prop of properties) {
      const animType = getAnimationType(animatable.target, prop.name);
      if (!animType) continue;
      result.push(
        Animation(
          animType,
          prop,
          animatable,
          normalizeTweens(prop, animatable),
        )
      );
    }
  }
  return result;
};
