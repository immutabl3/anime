const Timing = () => ({
  duration: 0,
  delay: 0,
  endDelay: 0,
});

export const getInstanceTimings = (animations, tweenSettings) => {
  const animLength = animations.length;
  const getTlOffset = anim => anim.timelineOffset ? anim.timelineOffset : 0;
  const timings = Timing();
  timings.duration = animLength
    ? Math.max(...animations.map(anim => getTlOffset(anim) + anim.duration))
    : tweenSettings.duration;
  timings.delay = animLength
    ? Math.min(...animations.map(anim => getTlOffset(anim) + anim.delay))
    : tweenSettings.delay;
  timings.endDelay = animLength
    ? timings.duration - Math.max(...animations.map(anim => getTlOffset(anim) + anim.duration - anim.endDelay))
    : tweenSettings.endDelay;
  return timings;
};