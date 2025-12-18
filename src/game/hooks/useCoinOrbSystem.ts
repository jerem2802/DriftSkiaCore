// src/game/hooks/useCoinOrbSystem.ts
// Coin orb : attach au ring, collision, + trigger vers Coin FX (fly-to-HUD)

import { useDerivedValue, useAnimatedReaction } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

const COIN_ORB_OFFSET = -Math.PI / 2 + Math.PI / 6;

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

  // ✅ FX trigger (CoinFxSystem)
  coinFxPickupSeq: SharedValue<number>;
  coinFxPickupX: SharedValue<number>;
  coinFxPickupY: SharedValue<number>;
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
  coinFxPickupSeq,
  coinFxPickupX,
  coinFxPickupY,
}: UseCoinOrbSystemParams) => {
  const attachedX = useDerivedValue(() => {
    const a = gateAngle.value + COIN_ORB_OFFSET;
    return currentX.value + currentR.value * Math.cos(a);
  });

  const attachedY = useDerivedValue(() => {
    const a = gateAngle.value + COIN_ORB_OFFSET;
    return currentY.value + currentR.value * Math.sin(a);
  });

  const coinOrbVisible = useDerivedValue(() => (currentHasCoin.value ? 1 : 0));

  useAnimatedReaction(
    () => ({
      alive: alive.value,
      paused: isPaused.value,
      hasCoin: currentHasCoin.value,
      bx: ballX.value,
      by: ballY.value,
      ox: attachedX.value,
      oy: attachedY.value,
    }),
    (s) => {
      'worklet';

      if (!s.alive) {
        currentHasCoin.value = false;
        return;
      }
      if (s.paused) return;
      if (!s.hasCoin) return;

      const dx = s.bx - s.ox;
      const dy = s.by - s.oy;
      const distSq = dx * dx + dy * dy;

      if (distSq <= orbCollisionDist) {
        // hide attached coin
        currentHasCoin.value = false;

        // meta in-run
        coins.value = coins.value + 1;
        coinHudPulse.value = 1; // (si tu veux garder withSequence ici, dis-moi, sinon on migre aussi en FX)

        // trigger FX fly-to-HUD
        coinFxPickupX.value = s.ox;
        coinFxPickupY.value = s.oy;
        coinFxPickupSeq.value = coinFxPickupSeq.value + 1;
      }
    }
  );

  return {
    coinOrbVisible,
    coinOrbX: attachedX,
    coinOrbY: attachedY,
  };
};
