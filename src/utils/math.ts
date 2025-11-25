export const degToRad = (deg: number): number => (deg * Math.PI) / 180;

export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number): number =>
  from + (to - from) * t;

export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};
