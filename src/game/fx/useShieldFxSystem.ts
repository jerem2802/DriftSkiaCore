// src/game/fx/useShieldFxSystem.ts
import { SharedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { createShieldBoltPool, spawnBolt, wipePool } from './shieldFxBuffer';

type Params = {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
  shieldArmed: SharedValue<boolean>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  capacity?: number;
};

export const useShieldFxSystem = ({
  alive,
  isPaused,
  shieldArmed,
  ballX,
  ballY,
  capacity = 24,
}: Params) => {
  const boltPool = useSharedValue(createShieldBoltPool(capacity));
  const tick = useSharedValue(0);

  // temps + alpha pilotés UI-thread
  const t = useSharedValue(0);
  const a = useSharedValue(0);
  const prevArmed = useSharedValue(false);

  useFrameCallback((fi) => {
    'worklet';
    if (!alive.value) return;
    if (isPaused.value) return;

    const dtMs = fi.timeSincePreviousFrame ?? 16.67;
    const dt = dtMs / 1000;

    // time + alpha lerp
    t.value += dt;
    const target = shieldArmed.value ? 1 : 0;
    const speed = shieldArmed.value ? 14 : 22;
    a.value += (target - a.value) * Math.min(1, dt * speed);
    if (a.value < 0.001) a.value = 0;
    if (a.value > 0.999) a.value = 1;

    const pool = boltPool.value;

    // OFF -> wipe immédiat (évite “reste jusqu’au prochain shield”)
    if (prevArmed.value && !shieldArmed.value) {
      wipePool(pool, capacity);
    }
    prevArmed.value = shieldArmed.value;

    if (!shieldArmed.value) {
      tick.value = (tick.value + 1) % 1000000;
      return;
    }

    // spawn cadence douce
    pool.accMs += dtMs;
    if (pool.accMs >= 38) {
      pool.accMs = 0;
      spawnBolt(pool, capacity);
      // rare double (léger)
      if (Math.random() > 0.85) spawnBolt(pool, capacity);
    }

    // update: collé à la bille + vieillissement
    const bx = ballX.value;
    const by = ballY.value;
    const OFF = pool.OFFSCREEN;

    for (let i = 0; i < capacity; i++) {
      const life = pool.life[i];
      if (life <= 0) continue;

      pool.x[i] = bx + pool.ox[i];
      pool.y[i] = by + pool.oy[i];

      const age = (pool.age[i] += dt);
      if (age >= life) {
        pool.life[i] = 0;
        pool.x[i] = OFF;
        pool.y[i] = OFF;
      }
    }

    tick.value = (tick.value + 1) % 1000000;
  });

  return { capacity, boltPool, tick, t, a };
};
