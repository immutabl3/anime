import { noop } from '@immutabl3/utils';

export const defaultInstanceSettings = {
  update: noop,
  begin: noop,
  loopBegin: noop,
  changeBegin: noop,
  change: noop,
  changeComplete: noop,
  loopComplete: noop,
  complete: noop,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};

export const defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0
};

export const validTransforms = new Set([
  'translateX',
  'translateY',
  'translateZ',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'skew',
  'skewX',
  'skewY',
  'perspective',
  'matrix',
  'matrix3d'
]);