import {
  activeInstances,
  ON_DOCUMENT_VISIBILITY,
} from './constants.js';

const isDocumentHidden = () => !!globalThis.document?.hidden;

export default function Engine(anime) {
  const step = t => {
    if (isDocumentHidden() && anime.suspendWhenDocumentHidden) return;

    for (const instance of activeInstances.values()) {
      if (!instance.paused) {
        instance.tick(t);
      } else {
        activeInstances.delete(instance);
      }
    }
  };

  const handleVisibilityChange = () => {
    if (!anime.suspendWhenDocumentHidden) return;

    if (!isDocumentHidden()) {
      // first adjust animations to consider the time that ticks were suspended
      for (const instance of activeInstances.values()) {
        instance[ON_DOCUMENT_VISIBILITY]();
      }
    }
  };

  if (globalThis?.document) {
    globalThis.document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return {
    step,
  };
};