import {
  getUnit,
} from './units.js';
import {
  validateValue,
  getAnimationType,
  getFunctionValue,
  getRelativeValue,
  getOriginalTargetValue,
} from './values.js';
import {
  getAnimatables,
} from './animatables.js';
import {
  setProgressValue,
} from './tweens.js';

export const setTargetsValue = (targets, properties) => {
  const animatables = getAnimatables(targets);
  for (const animatable of animatables) {
    const { target, transforms } = animatable;
    for (const property in properties) {
      const value = getFunctionValue(properties[property], animatable);
      const valueUnit = getUnit(value);
      const originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      const unit = valueUnit || getUnit(originalValue);
      const to = getRelativeValue(validateValue(value, unit), originalValue);
      const animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, transforms, true);
    }
  }
};