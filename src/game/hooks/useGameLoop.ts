// src/game/hooks/useGameLoop.ts
// Boucle de jeu 100% Reanimated (aucun re-render Canvas)

import { useFrameCallback } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { DASH_SPEED, CANVAS_WIDTH } from '../../constants/gameplay';
import { completeRing } from '../logic/gameLifecycle';

const RING_RADIUS = CANVAS_WIDTH * 0.25;

type Mode = 'orbit' | 'dash';

interface UseGameLoopParams {
  // Game state principal
  alive: SharedValue<boolean>;
  mode: SharedValue<Mode>;
  angle: SharedValue<number>;
  speed: SharedValue<number>;

  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  currentR: SharedValue<number>;

  nextX: SharedValue<number>;
  nextY: SharedValue<number>;
  nextR: SharedValue<number>;

  ballX: SharedValue<number>;
  ballY: SharedValue<number>;

  gateAngle: SharedValue<number>;
  gateWidth: SharedValue<number>;

  dashStartTime: SharedValue<number>;

  // Fading ring
  fadingRingX: SharedValue<number>;
  fadingRingY: SharedValue<number>;
  fadingRingR: SharedValue<number>;
  fadingRingScale: SharedValue<number>;
  fadingRingOpacity: SharedValue<number>;

  // Scoring / vies
  score: SharedValue<number>;
  streak: SharedValue<number>;
  combo: SharedValue<number>;
  lives: SharedValue<number>;

  // Orbe de vie
  currentHasLife: SharedValue<boolean>;
  nextHasLife: SharedValue<boolean>;

  // Palettes
  currentPaletteIndex: SharedValue<number>;
  nextPaletteIndex: SharedValue<number>;
  getRandomPaletteIndex: (exclude?: number) => number;
}

export const useGameLoop = (params: UseGameLoopParams) => {
  useFrameCallback((frameInfo) => {
    'worklet';

    const {
      alive,
      mode,
      angle,
      speed,
      currentX,
      currentY,
      currentR,
      nextX,
      nextY,
      nextR,
      ballX,
      ballY,
      gateAngle,
      gateWidth,
      dashStartTime,
      fadingRingX,
      fadingRingY,
      fadingRingR,
      fadingRingScale,
      fadingRingOpacity,
      score,
      streak,
      combo,
      lives,
      currentHasLife,
      nextHasLife,
      currentPaletteIndex,
      nextPaletteIndex,
      getRandomPaletteIndex,
    } = params;

    if (!alive.value) {
      return;
    }

    const dt =
      frameInfo.timeSincePreviousFrame != null
        ? frameInfo.timeSincePreviousFrame / 1000
        : 1 / 60;

    // ORBIT : la bille tourne autour du ring courant
    if (mode.value === 'orbit') {
      angle.value = angle.value + speed.value * dt;
      ballX.value = currentX.value + currentR.value * Math.cos(angle.value);
      ballY.value = currentY.value + currentR.value * Math.sin(angle.value);
      return;
    }

    // DASH : la bille va vers le ring suivant en ligne droite
    if (mode.value === 'dash') {
      const dx = nextX.value - ballX.value;
      const dy = nextY.value - ballY.value;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.5) {
        ballX.value = ballX.value + (dx / dist) * DASH_SPEED * dt;
        ballY.value = ballY.value + (dy / dist) * DASH_SPEED * dt;
      }

      // Quand la bille atteint le centre du ring suivant → ring complété
      if (dist <= 4) {
        const isPerfect = false; // on ajustera plus tard la fenêtre "perfect"

        completeRing({
          currentPaletteIndex,
          nextPaletteIndex,
          getRandomPaletteIndex,
          fadingRingX,
          fadingRingY,
          fadingRingR,
          fadingRingScale,
          fadingRingOpacity,
          currentX,
          currentY,
          currentR,
          nextX,
          nextY,
          nextR,
          score,
          speed,
          gateAngle,
          gateWidth,
          angle,
          ballX,
          ballY,
          mode,
          dashStartTime,
          streak,
          combo,
          lives,
          currentHasLife,
          nextHasLife,
          isPerfect,
          RING_RADIUS,
        });
      }
    }
  });
};
