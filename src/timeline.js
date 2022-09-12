import {
  mergeObjects,
} from './utils.js';
import {
  defaultTweenSettings,
} from './defaults.js';
import {
  getInstanceTimings,
} from './instances.js';
import {
  getRelativeValue,
} from './values.js';
import {
  activeInstances,
} from './constants.js';

export default function Timeline(params, anime) {
  const tl = anime(params);
  tl.duration = 0;
  tl.add = function(instanceParams, timelineOffset) {
    const { children } = tl;
    if (activeInstances.has(tl)) activeInstances.delete(tl);
    const passThrough = ins => (ins.passThrough = true);
    for (const child of children.values()) passThrough(child);
    const insParams = mergeObjects(instanceParams, { ...defaultTweenSettings, ...params });
    insParams.targets = insParams.targets || params.targets;
    const tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = timelineOffset !== undefined ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    const ins = anime(insParams);
    passThrough(ins);
    // const totalDuration = ins.duration + insParams.timelineOffset;
    children.add(ins);
    const timings = getInstanceTimings(Array.from(children.values()), params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();
    if (tl.autoplay) tl.play();
    return tl;
  };
  return tl;
};