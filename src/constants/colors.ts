// src/constants/colors.ts
// Palettes néon + logique de distance entre couleurs pour éviter les combos trop proches

export type Palette = {
  outer: string;
  mid: string;
  main: string;
  gate: string;
};

export const COLOR_PALETTES: Palette[] = [
  // 0 - Vert / turquoise
  {
    outer: '#6ee7b7',
    mid: '#5eead4',
    main: '#14b8a6',
    gate: '#22d3ee',
  },
  // 1 - Rose / rouge
  {
    outer: '#fda4af',
    mid: '#fb7185',
    main: '#f43f5e',
    gate: '#fbbf24',
  },
  // 2 - Bleu clair
  {
    outer: '#7dd3fc',
    mid: '#38bdf8',
    main: '#0ea5e9',
    gate: '#06b6d4',
  },
  // 3 - Vert
  {
    outer: '#86efac',
    mid: '#4ade80',
    main: '#22c55e',
    gate: '#10b981',
  },
  // 4 - Violet / magenta
  {
    outer: '#d8b4fe',
    mid: '#c084fc',
    main: '#a855f7',
    gate: '#ec4899',
  },
  // 5 - Cyan
  {
    outer: '#67e8f9',
    mid: '#22d3ee',
    main: '#06b6d4',
    gate: '#0891b2',
  },
  // 6 - Jaune / orange
  {
    outer: '#fcd34d',
    mid: '#fbbf24',
    main: '#f59e0b',
    gate: '#ea580c',
  },
  // 7 - Orange / mandarine
  {
    outer: '#fed7aa',
    mid: '#fdba74',
    main: '#fb923c',
    gate: '#f97316',
  },
  // 8 - Violet
  {
    outer: '#c4b5fd',
    mid: '#a78bfa',
    main: '#8b5cf6',
    gate: '#a855f7',
  },
  // 9 - Indigo / bleu nuit
  {
    outer: '#a5b4fc',
    mid: '#818cf8',
    main: '#6366f1',
    gate: '#4f46e5',
  },
];

export const BALL_COLOR = '#ffffff';

// Approximation de la teinte principale (H° sur le cercle chromatique) pour chaque palette
const PALETTE_HUES: number[] = [
  160, // 0 vert/turquoise
  350, // 1 rose/rouge
  200, // 2 bleu clair
  135, // 3 vert
  300, // 4 violet/magenta
  190, // 5 cyan
  45,  // 6 jaune/orange
  30,  // 7 orange
  265, // 8 violet
  225, // 9 indigo/bleu nuit
];
export const SHIELD_HALO_COLOR = '#38bdf8'; // bleu néon pour le halo shield


// Distance minimale pour considérer 2 palettes "vraiment différentes"
const MIN_HUE_DIFF = 70;

export const getRandomPaletteIndex = (exclude?: number): number => {
  const total = COLOR_PALETTES.length;
  const candidates: number[] = [];

  for (let i = 0; i < total; i++) {
    if (typeof exclude === 'number' && i === exclude) {
      continue;
    }

    if (typeof exclude === 'number') {
      const h1 = PALETTE_HUES[exclude];
      const h2 = PALETTE_HUES[i];

      let diff = Math.abs(h1 - h2);
      if (diff > 180) diff = 360 - diff; // distance circulaire

      // Couleurs trop proches -> on skip
      if (diff < MIN_HUE_DIFF) continue;
    }

    candidates.push(i);
  }

  // Sécurité : si on a filtré trop fort, on tombe juste sur "différent de exclude"
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
