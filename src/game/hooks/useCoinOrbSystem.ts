// src/game/hooks/useCoinOrbSystem.ts
// Coin orb : attach au ring (SUR la trajectoire), collision, fly-to-HUD + pulse compteur

import {
  useSharedValue,
  useDerivedValue,
  useAnimatedReaction,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

// ✅ Offset dédié pour éviter superposition (Life = PI, AutoPlay = +PI/2)
const COIN_ORB_OFFSET = -Math.PI / 2;

// ✅ Curseur vitesse (plus petit = plus rapide)
const COIN_FLY_DURATION_MS = 950;

interface UseCoinOrbSystemParams {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;

  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  currentR: SharedValue<number>;
  gateAngle: SharedValue<number>;

  ballX: SharedValue<number>;
  ballY: SharedValue<number>;

  currentHasCoin: SharedValue<boolean>;

  coins: SharedValue<number>;
  coinHudPulse: SharedValue<number>;

  orbCollisionDist: number; // distance²

  targetX: number;
  targetY: number;
}

export const useCoinOrbSystem = ({
  alive,
  isPaused,
  currentX,
  currentY,
  currentR,
  gateAngle,
  ballX,
  ballY,
  currentHasCoin,
  coins,
  coinHudPulse,
  orbCollisionDist,
  targetX,
  targetY,
}: UseCoinOrbSystemParams) => {
  // 0=attached, 1=flying
  const flying = useSharedValue(0);
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);

  // Attach SUR le ring
  const attachedX = useDerivedValue(() => {
    const a = gateAngle.value + COIN_ORB_OFFSET;
    return currentX.value + currentR.value * Math.cos(a);
  });

  const attachedY = useDerivedValue(() => {
    const a = gateAngle.value + COIN_ORB_OFFSET;
    return currentY.value + currentR.value * Math.sin(a);
  });

  const coinOrbVisible = useDerivedValue(() => {
    if (currentHasCoin.value) {
      return 1;
    }
    if (flying.value === 1) {
      return 1;
    }
    return 0;
  });

  const coinOrbX = useDerivedValue(() => {
    if (flying.value === 1) {
      return flyX.value;
    }
    return attachedX.value;
  });

  const coinOrbY = useDerivedValue(() => {
    if (flying.value === 1) {
      return flyY.value;
    }
    return attachedY.value;
  });

  useAnimatedReaction(
    () => ({
      alive: alive.value,
      paused: isPaused.value,
      hasCoin: currentHasCoin.value,
      flying: flying.value,
      bx: ballX.value,
      by: ballY.value,
      ox: attachedX.value,
      oy: attachedY.value,
    }),
    (s) => {
      'worklet';

      if (!s.alive) {
        flying.value = 0;
        currentHasCoin.value = false;
        return;
      }

      if (s.paused) {
        return;
      }

      if (!s.hasCoin) {
        return;
      }

      if (s.flying === 1) {
        return;
      }

      const dx = s.bx - s.ox;
      const dy = s.by - s.oy;
      const distSq = dx * dx + dy * dy;

      if (distSq <= orbCollisionDist) {
        currentHasCoin.value = false;
        flying.value = 1;

        flyX.value = s.ox;
        flyY.value = s.oy;

        flyX.value = withTiming(
          targetX,
          { duration: COIN_FLY_DURATION_MS, easing: Easing.linear },
          (finished) => {
            if (finished) {
              flying.value = 0;
            }
          }
        );

        flyY.value = withTiming(targetY, {
          duration: COIN_FLY_DURATION_MS,
          easing: Easing.linear,
        });

        coins.value = coins.value + 1;
        coinHudPulse.value = withSequence(
          withTiming(1, { duration: 80, easing: Easing.linear }),
          withTiming(0, { duration: 160, easing: Easing.linear })
        );
      }
    }
  );

  return {
    coinOrbVisible,
    coinOrbX,
    coinOrbY,
  };
};
