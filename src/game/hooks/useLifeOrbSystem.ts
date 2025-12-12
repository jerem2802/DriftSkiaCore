// src/game/hooks/useLifeOrbSystem.ts
// Gère l’orbe de vie : position + collision

import { useDerivedValue, useAnimatedReaction } from 'react-native-reanimated';
import { LIVES_MAX } from '../../constants/gameplay';
import type { GameState } from './useGameState';

const LIFE_ORB_OFFSET = Math.PI;

interface UseLifeOrbSystemParams {
  gameState: GameState;
  orbCollisionDist: number; // 625 (distance²)
}

export const useLifeOrbSystem = ({ gameState, orbCollisionDist }: UseLifeOrbSystemParams) => {
  const lifeOrbVisible = useDerivedValue(() => (gameState.currentHasLife.value ? 1 : 0));

  const lifeOrbAngle = useDerivedValue(() => gameState.gateAngle.value + LIFE_ORB_OFFSET);

  const lifeOrbX = useDerivedValue(
    () => gameState.currentX.value + gameState.currentR.value * Math.cos(lifeOrbAngle.value)
  );

  const lifeOrbY = useDerivedValue(
    () => gameState.currentY.value + gameState.currentR.value * Math.sin(lifeOrbAngle.value)
  );

  useAnimatedReaction(
    () => ({
      hasLife: gameState.currentHasLife.value,
      lives: gameState.lives.value,
      ballX: gameState.ballX.value,
      ballY: gameState.ballY.value,
      gateAngle: gameState.gateAngle.value,
      cx: gameState.currentX.value,
      cy: gameState.currentY.value,
      r: gameState.currentR.value,
    }),
    (s) => {
      'worklet';
      if (!s.hasLife) return;
      if (s.lives >= LIVES_MAX) return;

      const orbAngle = s.gateAngle + LIFE_ORB_OFFSET;
      const orbX = s.cx + s.r * Math.cos(orbAngle);
      const orbY = s.cy + s.r * Math.sin(orbAngle);

      const dx = s.ballX - orbX;
      const dy = s.ballY - orbY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= orbCollisionDist) {
        gameState.currentHasLife.value = false;
        gameState.lives.value = Math.min(LIVES_MAX, s.lives + 1);
      }
    }
  );

  return {
    lifeOrbVisible,
    lifeOrbX,
    lifeOrbY,
  };
};
