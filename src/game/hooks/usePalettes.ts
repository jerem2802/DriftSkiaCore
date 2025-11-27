// src/game/hooks/usePalettes.ts
// Gestion des palettes de couleurs pour les rings (version Skia)

import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { COLOR_PALETTES } from '../../constants/colors';

export type Palette = (typeof COLOR_PALETTES)[number];

export const usePalettes = () => {
  // Indices de palettes
  const currentPaletteIndex = useSharedValue(0);
  const nextPaletteIndex = useSharedValue(1);
  const fadingRingPaletteIndex = useSharedValue(0);

  /**
   * Retourne un index de palette :
   * - différent de `exclude`
   * - suffisamment éloigné en couleur (sur palette.main)
   */
  const getRandomPaletteIndex = (exclude?: number) => {
    'worklet';

    const max = COLOR_PALETTES.length;
    if (max <= 1) return 0;

    // seuil de différence de couleur (RGB) au carré
    // Plus tu veux de contraste, plus tu montes cette valeur
    const COLOR_DIFF_THRESHOLD_SQ = 50_000; // ~ distance > 224 en RGB

    const hexToRgb = (hex: string): [number, number, number] => {
      if (!hex) return [0, 0, 0];
      let c = hex.trim();
      if (c[0] === '#') c = c.slice(1);

      if (c.length === 3) {
        // #f0a -> #ff00aa
        const r = c[0];
        const g = c[1];
        const b = c[2];
        c = r + r + g + g + b + b;
      }
      if (c.length !== 6) return [0, 0, 0];

      const r = parseInt(c.slice(0, 2), 16);
      const g = parseInt(c.slice(2, 4), 16);
      const b = parseInt(c.slice(4, 6), 16);
      return [r, g, b];
    };

    const colorDistSq = (i1: number, i2: number): number => {
      const c1 = COLOR_PALETTES[i1].main;
      const c2 = COLOR_PALETTES[i2].main;
      const [r1, g1, b1] = hexToRgb(c1);
      const [r2, g2, b2] = hexToRgb(c2);
      const dr = r1 - r2;
      const dg = g1 - g2;
      const db = b1 - b2;
      return dr * dr + dg * dg + db * db;
    };

    let index = exclude != null ? exclude : -1;
    let tries = 0;

    while (true) {
      index = Math.floor(Math.random() * max);
      tries++;

      if (exclude == null) break;
      if (index === exclude) {
        if (tries > 20) {
          // sécurité : on sort quand même
          index = (exclude + 1) % max;
          break;
        }
        continue;
      }

      const distSq = colorDistSq(index, exclude);
      if (distSq >= COLOR_DIFF_THRESHOLD_SQ || tries > 20) {
        // assez différent ou trop de tentatives -> on accepte
        break;
      }
    }

    return index;
  };

  // Palettes dérivées à partir des indices
  const currentPalette = useDerivedValue<Palette>(
    () => COLOR_PALETTES[currentPaletteIndex.value]
  );

  const nextPalette = useDerivedValue<Palette>(
    () => COLOR_PALETTES[nextPaletteIndex.value]
  );

  const fadingPalette = useDerivedValue<Palette>(
    () => COLOR_PALETTES[fadingRingPaletteIndex.value]
  );

  return {
    currentPaletteIndex,
    nextPaletteIndex,
    fadingRingPaletteIndex,
    currentPalette,
    nextPalette,
    fadingPalette,
    getRandomPaletteIndex,
  };
};
