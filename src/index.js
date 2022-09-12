import penner from './penner.js';
import stagger from './stagger.js';
import Timeline from './timeline.js';
import Engine from './engine.js';
import {
  uniqueId,
} from '@immutabl3/utils';
import {
  setProgressValue,
} from './tweens.js';
import {
  parseEasings,
} from './easing.js';
import {
  getProperties,
} from './properties.js';
import {
  setTargetsValue,
} from './helpers.js';
import {
  parseTargets,
  getAnimatables,
} from './animatables.js';
import {
  getAnimations,
} from './animations.js';
import {
  defaultTweenSettings,
  defaultInstanceSettings,
} from './defaults.js';
import {
  minMax,
  replaceObjectProps,
} from './utils.js';
import {
  setDashoffset,
  getPath,
  getPathProgress,
} from './maths.js';
import {
  activeInstances,
  ON_DOCUMENT_VISIBILITY,
} from './constants.js';
import {
  getInstanceTimings,
} from './instances.js';
import {
  convertPxToUnit,
  getOriginalTargetValue,
} from './values.js';

const anime = function anime(params = {}) {
  // eslint-disable-next-line no-use-before-define
  return new Anime(params);
};

anime.speed = 1;
anime.suspendWhenDocumentHidden = true;

const engine = Engine(anime);

const removeTargetsFromAnimations = (targetsArray, animations) => {
  for (let a = animations.length; a--;) {
    if (targetsArray.includes(animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
};

const removeTargetsFromInstance = (targetsArray, instance) => {
  const {
    children,
    animations,
  } = instance;
  removeTargetsFromAnimations(targetsArray, animations);
  for (const child of children.values()) {
    const childAnimations = child.animations;
    removeTargetsFromAnimations(targetsArray, childAnimations);
    if (!childAnimations.length && !child.children.size) children.delete(child);
  }
  if (!animations.length && !children.size) instance.pause();
};

const removeTargetsFromActiveInstances = targets => {
  const targetsArray = parseTargets(targets);
  for (const instance of activeInstances.values()) {
    removeTargetsFromInstance(targetsArray, instance);
  }
};

class Anime {
  constructor(params = {}) {
    this.id = uniqueId();
    this.children = new Set();
    this.state = {
      now: 0,
      startTime: 0,
      lastTime: 0,
    };

    const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
    const properties = getProperties(tweenSettings, params);

    this.animatables = getAnimatables(params.targets);
    this.animations = getAnimations(this.animatables, properties);
    
    const timings = getInstanceTimings(this.animations, tweenSettings);
    this.duration = timings.duration;
    this.delay = timings.delay;
    this.endDelay = timings.endDelay;

    const instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
    this.update = instanceSettings.update;
    this.begin = instanceSettings.begin;
    this.loopBegin = instanceSettings.loopBegin;
    this.changeBegin = instanceSettings.changeBegin;
    this.change = instanceSettings.change;
    this.changeComplete = instanceSettings.changeComplete;
    this.loopComplete = instanceSettings.loopComplete;
    this.complete = instanceSettings.complete;
    this.loop = instanceSettings.loop;
    this.direction = instanceSettings.direction;
    this.autoplay = instanceSettings.autoplay;
    this.timelineOffset = instanceSettings.timelineOffset;

    this.passThrough = false;
    this.currentTime = 0;
    this.progress = 0;
    this.paused = true;
    this.began = false;
    this.loopBegan = false;
    this.changeBegan = false;
    this.completed = false;
    this.changeCompleted = false;
    this.reversePlayback = false;
    this.reversed = this.direction === 'reverse';
    this.remaining = this.loop;
    for (const child of this.children.values()) child.reset();
    if (this.reversed && this.loop !== true || (this.direction === 'alternate' && this.loop === 1)) this.remaining++;
    this.setAnimationsProgress(this.reversed ? this.duration : 0);

    if (this.autoplay) this.play();
  }

  resetTime() {
    this.startTime = 0;
    this.lastTime = this.adjustTime(this.currentTime) * (1 / anime.speed);
  }
  [ON_DOCUMENT_VISIBILITY]() {
    this.resetTime();
  }

  reset() {
    const direction = this.direction;
    this.passThrough = false;
    this.currentTime = 0;
    this.progress = 0;
    this.paused = true;
    this.began = false;
    this.loopBegan = false;
    this.changeBegan = false;
    this.completed = false;
    this.changeCompleted = false;
    this.reversePlayback = false;
    this.reversed = direction === 'reverse';
    this.remaining = this.loop;
    for (let i = this.childrenLength; i--;) this.children[i].reset();
    if (this.reversed && this.loop !== true || (direction === 'alternate' && this.loop === 1)) this.remaining++;
    this.setAnimationsProgress(this.reversed ? this.duration : 0);

    if (this.autoplay) this.play();

    return this;
  }

  set(targets, properties) {
    setTargetsValue(targets, properties);
    return this;
  }

  tick(t) {
    const now = this.state.now = t;
    if (!this.state.startTime) this.state.startTime = now;
    this.setInstanceProgress(
      (now + (this.state.lastTime - this.state.startTime)) * anime.speed
    );
  }

  seek(time) {
    this.setInstanceProgress(
      this.adjustTime(time)
    );
  }

  pause() {
    this.paused = true;
    this.resetTime();
  }

  play() {
    if (!this.paused) return;
    if (this.completed) this.reset();
    this.paused = false;
    activeInstances.add(this);
    this.resetTime();
  }

  reverse() {
    this.toggleInstanceDirection();
    this.completed = this.reversed ? false : true;
    this.resetTime();
  };

  restart() {
    this.reset();
    this.play();
  }

  remove(targets) {
    const targetsArray = parseTargets(targets);
    removeTargetsFromInstance(targetsArray, this);
  }

  toggleInstanceDirection() {
    const { direction, children } = this;
    if (direction !== 'alternate') {
      this.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    this.reversed = !this.reversed;
    for (const child of children.values()) {
      child.reversed = this.reversed;
    }
  }

  adjustTime(time) {
    return this.reversed ? this.duration - time : time;
  };

  seekChild(time, child) {
    if (child) child.seek(time - child.timelineOffset);
  };

  syncInstanceChildren(time) {
    const { children } = this;
    if (!this.reversePlayback) {
      for (const child of children.values()) {
        this.seekChild(time, child);
      }
      return;
    }
    
    const reversedChildren = Array.from(children.values()).reverse();
    for (const child of reversedChildren) {
      this.seekChild(time, child);
    }
  }

  countIteration() {
    if (this.remaining && this.remaining !== true) {
      this.remaining--;
    }
  }

  setAnimationsProgress(insTime) {
    let i = 0;
    const { animations } = this;
    const animationsLength = animations.length;
    while (i < animationsLength) {
      const anim = animations[i];
      const animatable = anim.animatable;
      const tweens = anim.tweens;
      const tweenLength = tweens.length - 1;
      let tween = tweens[tweenLength];
      // only check for keyframes if there is more than one tween
      if (tweenLength) tween = tweens.filter(t => (insTime < t.end))[0] || tween;
      const elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      const eased = Number.isNaN(elapsed) ? 1 : tween.easing(elapsed);
      const strings = tween.to.strings;
      const round = tween.round;
      const numbers = [];
      const toNumbersLength = tween.to.numbers.length;
      let progress;
      for (let n = 0; n < toNumbersLength; n++) {
        let value;
        const toNumber = tween.to.numbers[n];
        const fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + (eased * (toNumber - fromNumber));
        } else {
          value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // manual Array.reduce for better performances
      const stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (let s = 0; s < stringsLength; s++) {
          // const a = strings[s];
          const b = strings[s + 1];
          const n = numbers[s];
          if (!isNaN(n)) {
            if (!b) {
              progress += `${n} `;
            } else {
              progress += n + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  setCallback(key) {
    if (this[key] && !this.passThrough) this[key](this);
  }

  setInstanceProgress(engineTime) {
    const insDuration = this.duration;
    const insDelay = this.delay;
    const insEndDelay = insDuration - this.endDelay;
    const insTime = this.adjustTime(engineTime);
    this.progress = minMax((insTime / insDuration) * 100, 0, 100);
    this.reversePlayback = insTime < this.currentTime;
    this.syncInstanceChildren(insTime);
    if (!this.began) {
    // if (!instance.began && instance.currentTime > 0) {
      this.began = true;
      this.setCallback('begin');
    }
    if (!this.loopBegan) {
    // if (!instance.loopBegan && instance.currentTime > 0) {
      this.loopBegan = true;
      this.setCallback('loopBegin');
    }
    if (insTime <= insDelay) {
    // if (insTime <= insDelay && instance.currentTime !== 0) {
      this.setAnimationsProgress(0);
    }
    if ((insTime >= insEndDelay && this.currentTime !== insDuration) || !insDuration) {
      this.setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!this.changeBegan) {
        this.changeBegan = true;
        this.changeCompleted = false;
        this.setCallback('changeBegin');
      }
      this.setCallback('change');
      this.setAnimationsProgress(insTime);
    } else if (this.changeBegan) {
      this.changeCompleted = true;
      this.changeBegan = false;
      this.setCallback('changeComplete');
    }
    this.currentTime = minMax(insTime, 0, insDuration);
    if (this.began) this.setCallback('update');
    if (engineTime >= insDuration) {
      this.lastTime = 0;
      this.countIteration();
      if (!this.remaining) {
        this.paused = true;
        if (!this.completed) {
          this.completed = true;
          this.setCallback('loopComplete');
          this.setCallback('complete');
        }
      } else {
        this.state.startTime = this.state.now;
        this.setCallback('loopComplete');
        this.loopBegan = false;
        if (this.direction === 'alternate') {
          this.toggleInstanceDirection();
        }
      }
    }
  }
};

const timeline = (params = {}) => Timeline(params, anime);

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export {
  anime,
  engine,
  stagger,
  penner,
  random,
  timeline,
  setDashoffset,
  getPath as path,
  parseEasings as easing,
  setTargetsValue as set,
  activeInstances as running,
  convertPxToUnit as convertPx,
  getOriginalTargetValue as get,
  removeTargetsFromActiveInstances as remove,
};