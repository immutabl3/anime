// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744
import { isString } from '@immutabl3/utils';
import {
  getAttribute,
  validateValue,
} from './values.js';
import {
  qsa,
  isSvg,
  isPth,
} from './utils.js';

const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const getCircleLength = el => {
  return Math.PI * 2 * getAttribute(el, 'r');
};

const getRectLength = el => {
  return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
};

const getLineLength = el => {
  return getDistance(
    { x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1') }, 
    { x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2') }
  );
};

const getPolylineLength = el => {
  const points = el.points;
  let totalLength = 0;
  let previousPos;
  for (let i = 0 ; i < points.numberOfItems; i++) {
    const currentPos = points.getItem(i);
    if (i > 0) totalLength += getDistance(previousPos, currentPos);
    previousPos = currentPos;
  }
  return totalLength;
};

const getPolygonLength = el => {
  const { points } = el;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
};

// Path animation

const getTotalLength = el => {
  if (el.getTotalLength) return el.getTotalLength();
  const tagName = el.tagName.toLowerCase();
  if (tagName === 'circle') return getCircleLength(el);
  if (tagName === 'rect') return getRectLength(el);
  if (tagName === 'line') return getLineLength(el);
  if (tagName === 'polyline') return getPolylineLength(el);
  if (tagName === 'polygon') return getPolygonLength(el);
};

export const setDashoffset = el => {
  const pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
};

// Motion path

const getParentSvgEl = el => {
  let parentEl = el.parentNode;
  while (isSvg(parentEl)) {
    if (!isSvg(parentEl.parentNode)) break;
    parentEl = parentEl.parentNode;
  }
  return parentEl;
};

const getParentSvg = (pathEl, svgData) => {
  const svg = svgData || {};
  const parentSvgEl = svg.el || getParentSvgEl(pathEl);
  const rect = parentSvgEl.getBoundingClientRect();
  const viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  const width = rect.width;
  const height = rect.height;
  const viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width,
    h: height,
    vW: viewBox[2],
    vH: viewBox[3]
  };
};

export const getPath = (path, percent) => {
  const pathEl = isString(path) ? qsa(path)[0] : path;
  const p = percent || 100;
  return function(property) {
    return {
      property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    };
  };
};

export const getPathProgress = (path, progress, isPathTargetInsideSVG) => {
  const point = (offset = 0) => {
    const l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  };
  const svg = getParentSvg(path.el, path.svg);
  const p = point();
  const p0 = point(-1);
  const p1 = point(+1);
  const scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
  const scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
  if (path.property === 'x') return (p.x - svg.x) * scaleX;
  if (path.property === 'y') return (p.y - svg.y) * scaleY;
  if (path.property === 'angle') return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
};

// handles basic numbers and exponent notation
const rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
export const decomposeValue = (val, unit) => {
  const value = `${validateValue(isPth(val) ? val.totalLength : val, unit)}`;
  const match = value.match(rgx);
  return {
    original: value,
    numbers: match ? match.map(Number) : [0],
    strings: isString(val) || unit ? value.split(rgx) : []
  };
};
