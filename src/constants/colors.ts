// src/constants/colors.ts

export const BACKGROUND_COLOR = '#000000';

export const RING_PALETTES = [
  {
    outer: '#06b6d4',
    mid: '#0891b2',
    main: '#0e7490',
    gate: '#22d3ee',
  },
  {
    outer: '#a855f7',
    mid: '#9333ea',
    main: '#7e22ce',
    gate: '#c084fc',
  },
  {
    outer: '#ec4899',
    mid: '#db2777',
    main: '#be185d',
    gate: '#f472b6',
  },
  {
    outer: '#f59e0b',
    mid: '#d97706',
    main: '#b45309',
    gate: '#fbbf24',
  },
  {
    outer: '#10b981',
    mid: '#059669',
    main: '#047857',
    gate: '#34d399',
  },
];

export const RAINBOW_PALETTE = {
  outer: '#fbbf24',
  mid: '#ec4899',
  main: '#8b5cf6',
  gate: '#22d3ee',
};

export const BALL_COLOR = '#10b981';
export const MISS_COLOR = '#ef4444';

export const getRandomPalette = () =>
  RING_PALETTES[Math.floor(Math.random() * RING_PALETTES.length)];