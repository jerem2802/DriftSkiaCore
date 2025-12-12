// src/game/hooks/useShieldSystem.ts
// Système de bouclier Safe Miss – 100 % Reanimated (pas d'état React)

import { useDerivedValue, useAnimatedReaction } from 'react-native-reanimated';
import type { GameState } from './useGameState';

const SHIELD_ORB_OFFSET = -Math.PI / 2;
const MAX_CHARGES = 3;
const PICKUP_DIST = 625;

interface UseShieldSystemParams {
  gameState: GameState;
}

export const useShieldSystem = ({ gameState }: UseShieldSystemParams) => {
  // Orbe sur le ring courant (ne s'affiche pas si charges déjà full)
  const shieldOrbVisible = useDerivedValue(() => {
    const isFull = gameState.shieldChargesLeft.value >= MAX_CHARGES;
    return gameState.currentHasShield.value && !isFull ? 1 : 0;
  });

  const shieldOrbAngle = useDerivedValue(
    () => gameState.gateAngle.value + SHIELD_ORB_OFFSET
  );

  const shieldOrbX = useDerivedValue(
    () =>
      gameState.currentX.value +
      gameState.currentR.value * Math.cos(shieldOrbAngle.value)
  );

  const shieldOrbY = useDerivedValue(
    () =>
      gameState.currentY.value +
      gameState.currentR.value * Math.sin(shieldOrbAngle.value)
  );

  // Halo autour de la bille quand bouclier armé
  const shieldHaloVisible = useDerivedValue(
    () => (gameState.shieldArmed.value ? 1 : 0)
  );

  // Charges affichées (3 points)
  const shieldCharge1Visible = useDerivedValue(
    () => (gameState.shieldChargesLeft.value >= 1 ? 1 : 0.2)
  );
  const shieldCharge2Visible = useDerivedValue(
    () => (gameState.shieldChargesLeft.value >= 2 ? 1 : 0.2)
  );
  const shieldCharge3Visible = useDerivedValue(
    () => (gameState.shieldChargesLeft.value >= 3 ? 1 : 0.2)
  );

  // Sync robuste : shieldAvailable reflète TOUJOURS chargesLeft
  // => garantit que l'icône/bouton disparaît dès que charges = 0
  useAnimatedReaction(
    () => gameState.shieldChargesLeft.value,
    (charges) => {
      'worklet';
      const hasAny = charges > 0;

      gameState.shieldAvailable.value = hasAny;

      // Si plus de charges, on force désarmé (évite icône bloquée / état incohérent)
      if (!hasAny && gameState.shieldArmed.value) {
        gameState.shieldArmed.value = false;
      }
    }
  );

  // Pickup de l'orbe shield
  useAnimatedReaction(
    () => ({
      hasShieldOrb: gameState.currentHasShield.value,
      ballX: gameState.ballX.value,
      ballY: gameState.ballY.value,
      gateAngle: gameState.gateAngle.value,
      cx: gameState.currentX.value,
      cy: gameState.currentY.value,
      r: gameState.currentR.value,
      charges: gameState.shieldChargesLeft.value,
    }),
    (state) => {
      'worklet';
      if (!state.hasShieldOrb) return;

      // Si déjà full, on ne propose pas l'orbe : on la retire si elle existe
      if (state.charges >= MAX_CHARGES) {
        gameState.currentHasShield.value = false;
        return;
      }

      const orbAngle = state.gateAngle + SHIELD_ORB_OFFSET;
      const orbX = state.cx + state.r * Math.cos(orbAngle);
      const orbY = state.cy + state.r * Math.sin(orbAngle);

      const dx = state.ballX - orbX;
      const dy = state.ballY - orbY;
      const distSq = dx * dx + dy * dy;
      if (distSq > PICKUP_DIST) return;

      // Pickup → ajoute une charge (capée)
      gameState.currentHasShield.value = false;
      const newCharges = Math.min(MAX_CHARGES, state.charges + 1);
      gameState.shieldChargesLeft.value = newCharges;
      // shieldAvailable sera sync automatiquement par la réaction ci-dessus
    }
  );

  const onActivateShield = () => {
    'worklet';
    if (gameState.shieldArmed.value) return; // évite double armement
    if (gameState.shieldChargesLeft.value <= 0) return; // source de vérité
    // shieldAvailable est redondant ici mais ok si tu veux le garder
    if (!gameState.shieldAvailable.value) return;

    gameState.shieldArmed.value = true;
  };

  return {
    shieldOrbVisible,
    shieldOrbX,
    shieldOrbY,
    shieldHaloVisible,
    shieldCharge1Visible,
    shieldCharge2Visible,
    shieldCharge3Visible,
    onActivateShield,
  };
};
