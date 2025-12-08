// src/game/hooks/useLifeOrbSystem.ts
// Gère l’orbe de vie : position + collision

import { useDerivedValue, useAnimatedReaction } from 'react-native-reanimated';
import { LIVES_MAX } from '../../constants/gameplay';
import type { useGameState } from './useGameState';

type GameState = ReturnType<typeof useGameState>;

const LIFE_ORB_OFFSET = Math.PI;

interface UseLifeOrbSystemParams {
  gameState: GameState;
  orbCollisionDist: number; // 625 (comme avant)
}

export const useLifeOrbSystem = ({
  gameState,
  orbCollisionDist,
}: UseLifeOrbSystemParams) => {
  // Visible si le ring courant porte une orbe de vie
  const lifeOrbVisible = useDerivedValue(
    () => (gameState.currentHasLife.value ? 1 : 0)
  );

  // Angle de l’orbe = gate + π (à l’opposé)
  const lifeOrbAngle = useDerivedValue(
    () => gameState.gateAngle.value + LIFE_ORB_OFFSET
  );

  // Position de l’orbe sur le ring courant
  const lifeOrbX = useDerivedValue(
    () =>
      gameState.currentX.value +
      gameState.currentR.value * Math.cos(lifeOrbAngle.value)
  );
  const lifeOrbY = useDerivedValue(
    () =>
      gameState.currentY.value +
      gameState.currentR.value * Math.sin(lifeOrbAngle.value)
  );

  // Collision bille / orbe de vie
  useAnimatedReaction(
    () => ({
      hasLife: gameState.currentHasLife.value,
      ballX: gameState.ballX.value,
      ballY: gameState.ballY.value,
      lives: gameState.lives.value,
      gateAngle: gameState.gateAngle.value,
    }),
    (state) => {
      if (!state.hasLife) return;
      if (state.lives >= LIVES_MAX) return;

      const cx = gameState.currentX.value;
      const cy = gameState.currentY.value;
      const r = gameState.currentR.value;

      const orbAngle = state.gateAngle + LIFE_ORB_OFFSET;
      const orbX = cx + r * Math.cos(orbAngle);
      const orbY = cy + r * Math.sin(orbAngle);

      const dx = state.ballX - orbX;
      const dy = state.ballY - orbY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= orbCollisionDist) {
        gameState.currentHasLife.value = false;
        gameState.lives.value = Math.min(LIVES_MAX, state.lives + 1);
      }
    }
  );

  return {
    lifeOrbVisible,
    lifeOrbX,
    lifeOrbY,
  };
};
