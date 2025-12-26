// src/game/logic/shieldBonus.ts
// Logique spécifique au bonus Bouclier / Safe Miss

import type { SharedValue } from 'react-native-reanimated';

// Probabilité qu'une orbe bouclier spawn sur un nouveau ring
const SHIELD_SPAWN_CHANCE = 0.5; // 50%

// Cap de charges
const MAX_CHARGES = 3;

// Décider si on tente un spawn de bouclier sur ce ring
export const shouldSpawnShield = (
  shieldChargesLeft: SharedValue<number>,
  currentHasShield: SharedValue<boolean>,
): boolean => {
  'worklet';

  // Orbe déjà présente sur le ring → pas de spawn
  if (currentHasShield.value) return false;

  // Déjà full (3/3) → pas de spawn
  if (shieldChargesLeft.value >= MAX_CHARGES) return false;

  return Math.random() < SHIELD_SPAWN_CHANCE;
};