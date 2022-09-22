import { useRef, useEffect } from 'react';
import { anime, remove, set } from '../src/index.js';

// shallow equality check
const isEqual = (obj1, obj2) => {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
  
  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
};

const animatables = new Set([
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
  'top',
  'right',
  'bottom',
  'left',
  'borderRadius',
  'opacity',
  'color',
  'backgroundColor',
  'points',
  'strokeDashoffset',
  'width',
  'height'
]);

const consolidateAnimatables = config => {
  const properties = {};
  for (const key of animatables.keys()) {
    if (config[key] === undefined) continue;
    properties[key] = config[key];
  }
  return properties;
};

const createAnime = (ref, aniRef, targetRef, configRef, hasRenderedRef) => {
  // pause the current animation
  aniRef?.current?.pause();
  aniRef.current = undefined;
  
  // remove the animation
  if (targetRef.current) {
    try {
      remove(targetRef.current);
    } catch {}
    targetRef.current = undefined;
  }
  
  const elem = ref.current;
  
  if (!elem) return;

  // save the target
  targetRef.current = elem;

  const config = configRef.current;

  if (!hasRenderedRef.current) {
    set(elem, consolidateAnimatables(config));
    hasRenderedRef.current = 1;
  }

  aniRef.current = anime({
    ...config,
    targets: elem,
  });
};

export const useAnime = function(config) {
  // render check
  const hasRenderedRef = useRef(0);
  // current anime instance
  const aniRef = useRef();
  // current ref
  const ref = useRef();
  // target ref
  const targetRef = useRef();
  // track changes
  const configRef = useRef(config);

  const hasChanged = !isEqual(configRef.current, config);
  if (hasChanged) configRef.current = config;
  
  useEffect(() => {
    createAnime(ref, aniRef, targetRef, configRef, hasRenderedRef);
  }, [configRef.current]);

  return ref;
}