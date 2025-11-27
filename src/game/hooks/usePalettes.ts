// src/game/hooks/usePalettes.ts
// Gestion des palettes (indices SharedValue + derived values)

import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { RING_PALETTES } from '../../constants/colors';

const getRandomPaletteIndex = (exclude: number = -1): number => {
  'worklet';
  const max = RING_PALETTES.length;
  let newIndex = Math.floor(Math.random() * max);
  let attempts = 0;
  while (newIndex === exclude && attempts < 10) {
    newIndex = Math.floor(Math.random() * max);
    attempts++;
  }
  return newIndex;
};

export const usePalettes = () => {
  // Indices des palettes (SharedValue)
  const currentPaletteIndex = useSharedValue(0);
  const nextPaletteIndex = useSharedValue(1);
  const fadingRingPaletteIndex = useSharedValue(0);

  // Palettes dérivées (réactives dans Skia)
  const currentPalette = useDerivedValue(() => RING_PALETTES[currentPaletteIndex.value]);
  const nextPalette = useDerivedValue(() => RING_PALETTES[nextPaletteIndex.value]);
  const fadingPalette = useDerivedValue(() => RING_PALETTES[fadingRingPaletteIndex.value]);

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