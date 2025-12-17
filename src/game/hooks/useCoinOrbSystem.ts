// src/game/hooks/useCoinOrbSystem.ts
// Coin orb : attach au ring (sur la circonférence), collision, fly-to-HUD + pulse compteur

import {
  useSharedValue,
  useDerivedValue,
  useAnimatedReaction,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

interface UseCoinOrbSystemParams {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;

  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  currentR: SharedValue<number>;

  gateAngle: SharedValue<number>;

  ballX: SharedValue<number>;
  ballY: SharedValue<number>;

  // Spawn flag
  currentHasCoin: SharedValue<boolean>;

  // Currency + HUD pulse
  coins: SharedValue<number>;
  coinHudPulse: SharedValue<number>;

  // Collision (distance²)
  orbCollisionDist: number;

  // HUD target position (top-left)
  targetX: number;
  targetY: number;

  // ✅ curseur vitesse fly (ms)
  flyDurationMs?: number;
}

// ⚠️ Offset ANGULAIRE DÉDIÉ (différent de Life (π) et AutoPlay (π/2))
// Ajuste si ton shield utilise un offset proche.
const COIN_ORB_OFFSET = -Math.PI / 3;

// ✅ Ajustement radial fin (0 = exactement sur le rayon du ring)
const COIN_RING_RADIUS_OFFSET_PX = 0;

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
  flyDurationMs = 950,
}: UseCoinOrbSystemParams) => {
  // 0=attached (sur ring), 1=flying (vers HUD)
  const flying = useSharedValue(0);

  // position de vol (quand flying=1)
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);

  // Angle du coin (attaché au ring)
  const coinOrbAngle = useDerivedValue(() => gateAngle.value + COIN_ORB_OFFSET);

  // Visible si spawn sur ring OU en vol
  const coinOrbVisible = useDerivedValue(() =>
    currentHasCoin.value || flying.value === 1 ? 1 : 0
  );

  // Position coin (attaché sur la circonférence) OU en vol
  const coinOrbX = useDerivedValue(() => {
    if (flying.value === 1) return flyX.value;
    const rr = currentR.value + COIN_RING_RADIUS_OFFSET_PX;
    return currentX.value + rr * Math.cos(coinOrbAngle.value);
  });

  const coinOrbY = useDerivedValue(() => {
    if (flying.value === 1) return flyY.value;
    const rr = currentR.value + COIN_RING_RADIUS_OFFSET_PX;
    return currentY.value + rr * Math.sin(coinOrbAngle.value);
  });

  useAnimatedReaction(
    () => ({
      alive: alive.value,
      paused: isPaused.value,
      hasCoin: currentHasCoin.value,
      flying: flying.value,
      bx: ballX.value,
      by: ballY.value,
      cx: currentX.value,
      cy: currentY.value,
      r: currentR.value,
      gateA: gateAngle.value,
    }),
    (s) => {
      'worklet';

      // Game over -> extinction (évite coin qui reste visible)
      if (!s.alive) {
        flying.value = 0;
        currentHasCoin.value = false;
        return;
      }

      if (s.paused) return;

      // Coin doit être présent sur le ring et pas déjà en vol
      if (!s.hasCoin) return;
      if (s.flying === 1) return;

      // Coin sur la circonférence (comme les autres orbs)
      const rr = s.r + COIN_RING_RADIUS_OFFSET_PX;
      const a = s.gateA + COIN_ORB_OFFSET;
      const orbX = s.cx + rr * Math.cos(a);
      const orbY = s.cy + rr * Math.sin(a);

      const dx = s.bx - orbX;
      const dy = s.by - orbY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= orbCollisionDist) {
        // pickup -> détache et fly vers HUD
        currentHasCoin.value = false;
        flying.value = 1;

        // départ du vol = position réelle de pickup
        flyX.value = orbX;
        flyY.value = orbY;

        flyX.value = withTiming(targetX, { duration: flyDurationMs }, (finished) => {
          if (!finished) return;
          flying.value = 0;
        });
        flyY.value = withTiming(targetY, { duration: flyDurationMs });

        // +1 coin + pulse HUD
        coins.value = coins.value + 1;
        coinHudPulse.value = withSequence(
          withTiming(1, { duration: 80 }),
          withTiming(0, { duration: 160 })
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
