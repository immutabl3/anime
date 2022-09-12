export const getUnit = val => {
  const split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
  if (split) return split[1];
};

export const getTransformUnit = propName => {
  if (propName.includes('translate') || propName === 'perspective') return 'px';
  if (propName.includes('rotate') || propName.includes('skew')) return 'deg';
};
