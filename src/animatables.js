import {
  getElementTransforms,
} from './values.js';
import {
  toArray,
} from './utils.js';

const isItemInPosition = (item, pos, collection) => (
  collection.indexOf(item) === pos
);

export const parseTargets = targets => {
  const targetsArray = targets
    ? Array.isArray(targets)
      ? targets.map(toArray).flat(Infinity)
      : toArray(targets).flat(Infinity)
    : [];
  return targetsArray.filter(isItemInPosition);
};

const Animatable = (t, i, collection) => ({
  id: i,
  target: t,
  total: collection.length,
  transforms: getElementTransforms(t),
});

export const getAnimatables = targets => {
  return parseTargets(targets)
    .map(Animatable);
};