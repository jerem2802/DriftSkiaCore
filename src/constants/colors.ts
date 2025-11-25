// src/constants/colors.ts

export const BACKGROUND_COLOR = '#000000';

export const RING_PALETTES = [
  // Cyan family
  { outer: '#06b6d4', mid: '#0891b2', main: '#0e7490', gate: '#22d3ee' },
  { outer: '#22d3ee', mid: '#06b6d4', main: '#0284c7', gate: '#67e8f9' },
  
  // Purple family
  { outer: '#a855f7', mid: '#9333ea', main: '#7e22ce', gate: '#c084fc' },
  { outer: '#c084fc', mid: '#a855f7', main: '#9333ea', gate: '#e9d5ff' },
  
  // Pink family
  { outer: '#ec4899', mid: '#db2777', main: '#be185d', gate: '#f472b6' },
  { outer: '#f472b6', mid: '#ec4899', main: '#db2777', gate: '#fbcfe8' },
  
  // Orange family
  { outer: '#f59e0b', mid: '#d97706', main: '#b45309', gate: '#fbbf24' },
  { outer: '#fb923c', mid: '#f97316', main: '#ea580c', gate: '#fdba74' },
  
  // Green family
  { outer: '#10b981', mid: '#059669', main: '#047857', gate: '#34d399' },
  { outer: '#34d399', mid: '#10b981', main: '#059669', gate: '#6ee7b7' },
  
  // Blue family
  { outer: '#3b82f6', mid: '#2563eb', main: '#1d4ed8', gate: '#60a5fa' },
  { outer: '#60a5fa', mid: '#3b82f6', main: '#2563eb', gate: '#93c5fd' },
  
  // Red family
  { outer: '#ef4444', mid: '#dc2626', main: '#b91c1c', gate: '#f87171' },
  
  // Yellow family
  { outer: '#eab308', mid: '#ca8a04', main: '#a16207', gate: '#facc15' },
  
  // Teal family
  { outer: '#14b8a6', mid: '#0d9488', main: '#0f766e', gate: '#2dd4bf' },
];

export const RAINBOW_PALETTE = {
  outer: '#fbbf24',
  mid: '#ec4899',
  main: '#8b5cf6',
  gate: '#22d3ee',
};

export const BALL_COLOR = '#10b981';
export const MISS_COLOR = '#ef4444';

let lastPaletteIndex = -1;

export const getRandomPalette = () => {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * RING_PALETTES.length);
  } while (newIndex === lastPaletteIndex && RING_PALETTES.length > 1);
  
  lastPaletteIndex = newIndex;
  return RING_PALETTES[newIndex];
};