// src/game/hooks/useShieldSystem.ts
// Gère TOUT le système de shield (orbe, halo, inventaire, charges)

import { useDerivedValue, useAnimatedReaction } from 'react-native-reanimated';
import type { GameState } from './useGameState';
import { SHIELD_COLLISION_DIST, grantShield } from '../logic/shieldBonus';
import { SHIELD_CHARGES_PER_ACTIVATION } from '../../constants/gameplay';

const SHIELD_ORB_OFFSET = -Math.PI / 2;

interface UseShieldSystemParams {
  gameState: GameState;
}

export const useShieldSystem = ({
  gameState,
}: UseShieldSystemParams) => {
  // ----- ORBE SHIELD SUR LE RING COURANT -----
  const shieldOrbVisible = useDerivedValue(
    () => (gameState.currentHasShield.value ? 1 : 0)
  );

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

  // ----- HALO AUTOUR DE LA BILLE QUAND SHIELD ARMÉ -----
  const shieldHaloVisible = useDerivedValue(
    () =>
      gameState.shieldArmed.value && gameState.shieldChargesLeft.value > 0 ? 1 : 0
  );

  // ----- 3 POINTS SOUS LES VIES POUR LES CHARGES -----
  const shieldCharge1Visible = useDerivedValue(
    () => (gameState.shieldChargesLeft.value >= 1 ? 1 : 0)
  );
  const shieldCharge2Visible = useDerivedValue(
    () => (gameState.shieldChargesLeft.value >= 2 ? 1 : 0)
  );
  const shieldCharge3Visible = useDerivedValue(
    () => (gameState.shieldChargesLeft.value >= 3 ? 1 : 0)
  );

  // ⚠️ IMPORTANT :
  // PAS de réaction qui remet shieldAvailable à false quand charges = 0.
  // Ça, c'est géré dans loseLife quand on consomme la dernière charge.

  // ----- COLLISION BILLE / ORBE SHIELD -----
  useAnimatedReaction(
    () => ({
      hasShieldOrb: gameState.currentHasShield.value,
      ballX: gameState.ballX.value,
      ballY: gameState.ballY.value,
      gateAngle: gameState.gateAngle.value,
    }),
    (state) => {
      if (!state.hasShieldOrb) return;

      const cx = gameState.currentX.value;
      const cy = gameState.currentY.value;
      const r = gameState.currentR.value;

      const orbAngle = state.gateAngle + SHIELD_ORB_OFFSET;
      const orbX = cx + r * Math.cos(orbAngle);
      const orbY = cy + r * Math.sin(orbAngle);

      const dx = state.ballX - orbX;
      const dy = state.ballY - orbY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= SHIELD_COLLISION_DIST) {
        // → orbe consommée, inventaire shield rempli
        grantShield(gameState.shieldAvailable, gameState.currentHasShield);
      }
    }
  );

  // ----- ACTIVATION DU SHIELD DEPUIS LE BOTTOM PANEL -----
  const onActivateShield = () => {
    'worklet';
    // Pas de shield en stock → rien
    if (!gameState.shieldAvailable.value) return;
    // Déjà armé → rien
    if (gameState.shieldArmed.value) return;

    // On consomme l'inventaire, on arme, on donne 3 chances
    gameState.shieldAvailable.value = false;
    gameState.shieldArmed.value = true;
    gameState.shieldChargesLeft.value = SHIELD_CHARGES_PER_ACTIVATION;
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
