// src/game/logic/shieldBonus.ts
// Logique spécifique au bonus Bouclier / Safe Miss

import type { SharedValue } from 'react-native-reanimated';

// Probabilité qu'une orbe bouclier spawn sur un nouveau ring
const SHIELD_SPAWN_CHANCE = 0.5; // 50%

// Distance de collision bille/orbe bouclier (au carré, comme pour les autres orbes)
export const SHIELD_COLLISION_DIST = 625;

// Décider si on tente un spawn de bouclier sur ce ring
export const shouldSpawnShield = (
  shieldAvailable: SharedValue<boolean>,
  currentHasShield: SharedValue<boolean>,
): boolean => {
  'worklet';
  // Si le joueur a déjà un bouclier en réserve ou une orbe déjà présente → pas de spawn
  if (shieldAvailable.value || currentHasShield.value) {
    return false;
  }
  return Math.random() < SHIELD_SPAWN_CHANCE;
};

// Appelé quand la bille touche l'orbe bouclier
export const grantShield = (
  shieldAvailable: SharedValue<boolean>,
  currentHasShield: SharedValue<boolean>,
) => {
  'worklet';
  // On consomme l'orbe sur le ring et on donne un bouclier en inventaire
  currentHasShield.value = false;
  shieldAvailable.value = true;
};
