// src/utils/path.ts

export const createArcPath = (
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number
): string => {
  'worklet'; // ← AJOUTE ÇA
  const largeArc = end - start > Math.PI ? 1 : 0;
  const x0 = cx + r * Math.cos(start);
  const y0 = cy + r * Math.sin(start);
  const x1 = cx + r * Math.cos(end);
  const y1 = cy + r * Math.sin(end);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`;
};