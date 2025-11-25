// src/utils/math.ts

export const normalizeAngle = (a: number): number => {
  'worklet';
  let result = a % (Math.PI * 2);
  if (result < 0) result += Math.PI * 2;
  return result;
};

export const insideRing = (x: number, y: number, cx: number, cy: number, r: number): boolean => {
  'worklet';
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
};

export const clamp = (value: number, min: number, max: number): number => {
  'worklet';
  return Math.min(max, Math.max(min, value));
};

export const lerp = (from: number, to: number, t: number): number => {
  'worklet';
  return from + (to - from) * t;
};

export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  'worklet';
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

export const degToRad = (deg: number): number => {
  'worklet';
  return (deg * Math.PI) / 180;
};

export const radToDeg = (rad: number): number => {
  'worklet';
  return (rad * 180) / Math.PI;
};