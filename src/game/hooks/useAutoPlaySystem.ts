// src/game/hooks/useAutoPlaySystem.ts
// Logique AUTO-PLAY : orbe, collision, inventaire, activation

import { useDerivedValue, useAnimatedReaction } from 'react-native-reanimated';
import { AUTO_PLAY_DURATION } from '../../constants/gameplay';

const AUTOPLAY_ORB_OFFSET = Math.PI / 2;

interface UseAutoPlaySystemParams {
  gameState: any;
  orbCollisionDist: number;
}

export const useAutoPlaySystem = ({
  gameState,
  orbCollisionDist,
}: UseAutoPlaySystemParams) => {
  // ----- ORBE AUTO-PLAY (violette, 90° de la gate) -----
  const autoPlayOrbVisible = useDerivedValue(
    () => (gameState.currentHasAutoPlay.value ? 1 : 0)
  );

  const autoPlayOrbAngle = useDerivedValue(
    () => gameState.gateAngle.value + AUTOPLAY_ORB_OFFSET
  );

  const autoPlayOrbX = useDerivedValue(
    () =>
      gameState.currentX.value +
      gameState.currentR.value * Math.cos(autoPlayOrbAngle.value)
  );

  const autoPlayOrbY = useDerivedValue(
    () =>
      gameState.currentY.value +
      gameState.currentR.value * Math.sin(autoPlayOrbAngle.value)
  );

  // Collision bille/orbe auto-play
  useAnimatedReaction(
    () => ({
      hasAutoPlay: gameState.currentHasAutoPlay.value,
      ballX: gameState.ballX.value,
      ballY: gameState.ballY.value,
      gateAngle: gameState.gateAngle.value,
      inInventory: gameState.autoPlayInInventory.value,
    }),
    (state) => {
      if (!state.hasAutoPlay || state.inInventory) return;

      const cx = gameState.currentX.value;
      const cy = gameState.currentY.value;
      const r = gameState.currentR.value;

      const orbAngle = state.gateAngle + AUTOPLAY_ORB_OFFSET;
      const orbX = cx + r * Math.cos(orbAngle);
      const orbY = cy + r * Math.sin(orbAngle);

      const dx = state.ballX - orbX;
      const dy = state.ballY - orbY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= orbCollisionDist) {
        gameState.currentHasAutoPlay.value = false;
        gameState.autoPlayInInventory.value = true;
      }
    }
  );

  // Activation via le bouton du bas (appelée côté JS, peu fréquent)
  const onActivateAutoPlay = () => {
    if (!gameState.autoPlayInInventory.value) {
      return;
    }

    gameState.autoPlayInInventory.value = false;
    gameState.autoPlayActive.value = true;
    gameState.autoPlayTimeLeft.value = AUTO_PLAY_DURATION;
  };

  return {
    autoPlayOrbVisible,
    autoPlayOrbX,
    autoPlayOrbY,
    onActivateAutoPlay,
  };
};
