// src/game/hooks/useLifeOrbSystem.ts
// Gère l’orbe de vie : position + collision
// + Fly-to-Lives HUD (linéaire)

import {
  useDerivedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LIVES_MAX, CANVAS_WIDTH } from '../../constants/gameplay';
import type { GameState } from './useGameState';

const LIFE_ORB_OFFSET = Math.PI;

// Curseur vitesse fly
const LIFE_FLY_DURATION_MS = 950;

// Target HUD vies (doit matcher DriftGame livesPositions : startX = CANVAS_WIDTH - 60, y = 70)
const LIFE_HUD_X = CANVAS_WIDTH - 60;
const LIFE_HUD_Y = 70;

interface UseLifeOrbSystemParams {
  gameState: GameState;
  orbCollisionDist: number; // 625 (distance²)
}

export const useLifeOrbSystem = ({ gameState, orbCollisionDist }: UseLifeOrbSystemParams) => {
  // 0=attached, 1=flying
  const flying = useSharedValue(0);
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);

  const lifeOrbAngle = useDerivedValue(() => gameState.gateAngle.value + LIFE_ORB_OFFSET);

  const attachedX = useDerivedValue(
    () => gameState.currentX.value + gameState.currentR.value * Math.cos(lifeOrbAngle.value)
  );

  const attachedY = useDerivedValue(
    () => gameState.currentY.value + gameState.currentR.value * Math.sin(lifeOrbAngle.value)
  );

  const lifeOrbX = useDerivedValue(() => (flying.value === 1 ? flyX.value : attachedX.value));
  const lifeOrbY = useDerivedValue(() => (flying.value === 1 ? flyY.value : attachedY.value));

  const lifeOrbVisible = useDerivedValue(() => {
    if (flying.value === 1) return 1;
    return gameState.currentHasLife.value ? 1 : 0;
  });

  // Cleanup dur si game over / restart
  useAnimatedReaction(
    () => gameState.alive.value,
    (alive, prevAlive) => {
      'worklet';
      if (alive === prevAlive) return;

      cancelAnimation(flyX);
      cancelAnimation(flyY);
      flying.value = 0;

      if (!alive) {
        gameState.currentHasLife.value = false;
      }
    }
  );

  // Collision + fly
  useAnimatedReaction(
    () => ({
      hasLife: gameState.currentHasLife.value,
      lives: gameState.lives.value,
      bx: gameState.ballX.value,
      by: gameState.ballY.value,
      cx: gameState.currentX.value,
      cy: gameState.currentY.value,
      r: gameState.currentR.value,
      gateAngle: gameState.gateAngle.value,
      flying: flying.value,
      alive: gameState.alive.value,
    }),
    (s) => {
      'worklet';
      if (!s.alive) return;
      if (!s.hasLife) return;
      if (s.flying === 1) return;
      if (s.lives >= LIVES_MAX) return;

      const orbAngle = s.gateAngle + LIFE_ORB_OFFSET;
      const orbX = s.cx + s.r * Math.cos(orbAngle);
      const orbY = s.cy + s.r * Math.sin(orbAngle);

      const dx = s.bx - orbX;
      const dy = s.by - orbY;
      const distSq = dx * dx + dy * dy;

      if (distSq > orbCollisionDist) return;

      // pickup logique immédiat
      gameState.currentHasLife.value = false;
      gameState.lives.value = Math.min(LIVES_MAX, s.lives + 1);

      // fly visuel vers HUD vies
      flying.value = 1;
      flyX.value = orbX;
      flyY.value = orbY;

      flyX.value = withTiming(
        LIFE_HUD_X,
        { duration: LIFE_FLY_DURATION_MS, easing: Easing.linear },
        (finished) => {
          if (!finished) return;
          flying.value = 0;
        }
      );

      flyY.value = withTiming(LIFE_HUD_Y, { duration: LIFE_FLY_DURATION_MS, easing: Easing.linear });
    }
  );

  return {
    lifeOrbVisible,
    lifeOrbX,
    lifeOrbY,
  };
};
