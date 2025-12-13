// src/constants/colors.ts
// Palettes néon + logique de distance entre couleurs pour éviter les combos trop proches

export type Palette = {
  outer: string;
  mid: string;
  main: string;
  gate: string;
};

export const COLOR_PALETTES: Palette[] = [
  // 0 - Neon Cyan
  { outer: '#A6F8FF', mid: '#4DEEFF', main: '#00E5FF', gate: '#00FF5A' },

  // 1 - Neon Magenta
  { outer: '#FFB3F0', mid: '#FF4DEB', main: '#FF00E5', gate: '#F8FF00' },

  // 2 - Acid Yellow
  { outer: '#FDFFB3', mid: '#FBFF4D', main: '#F8FF00', gate: '#FF00E5' },

  // 3 - Neon Orange
  { outer: '#FFD1A6', mid: '#FF9E4D', main: '#FF7A00', gate: '#00E5FF' },

  // 4 - Neon Red
  { outer: '#FFB3C4', mid: '#FF4D7A', main: '#FF003D', gate: '#F8FF00' },

  // 5 - Neon Green
  { outer: '#B3FFCF', mid: '#4DFF8A', main: '#00FF5A', gate: '#00E5FF' },

  // 6 - Neon Purple
  { outer: '#D1B3FF', mid: '#A24DFF', main: '#7C00FF', gate: '#A6FF00' },

  // 7 - Neon Lime
  { outer: '#E7FFB3', mid: '#C6FF4D', main: '#A6FF00', gate: '#FF00E5' },

  // 8 - Neon Mint
  { outer: '#B3FFEF', mid: '#4DFFD9', main: '#00FFC8', gate: '#FF7A00' },

  // 9 - Neon Blue (plus “franc” et séparé du violet)
  { outer: '#B3C9FF', mid: '#4D84FF', main: '#005BFF', gate: '#F8FF00' },
];

export const BALL_COLOR = '#ffffff';

// Approximation de la teinte principale (H°) pour chaque palette (si jamais tu utilises la version hue-based)
const PALETTE_HUES: number[] = [
  190, // 0 cyan
  310, // 1 magenta
  60,  // 2 yellow
  30,  // 3 orange
  350, // 4 red
  140, // 5 green
  260, // 6 purple
  80,  // 7 lime
  170, // 8 mint
  220, // 9 blue
];

export const SHIELD_HALO_COLOR = '#38bdf8'; // inchangé

// Distance minimale (en degrés) pour considérer 2 palettes "vraiment différentes"
const MIN_HUE_DIFF = 75;

export const getRandomPaletteIndex = (exclude?: number): number => {
  'worklet';

  const total = COLOR_PALETTES.length;
  const candidates: number[] = [];

  for (let i = 0; i < total; i++) {
    if (typeof exclude === 'number' && i === exclude) continue;

    if (typeof exclude === 'number') {
      const h1 = PALETTE_HUES[exclude];
      const h2 = PALETTE_HUES[i];

      let diff = Math.abs(h1 - h2);
      if (diff > 180) diff = 360 - diff;

      if (diff < MIN_HUE_DIFF) continue;
    }

    candidates.push(i);
  }

  if (candidates.length === 0) {
    for (let i = 0; i < total; i++) {
      if (i !== exclude) candidates.push(i);
    }
  }

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
};

export const getRandomPalette = () =>
  COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
