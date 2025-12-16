// src/game/fx/useAutoPlayFxSystem.ts
import { SharedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { createAutoPlayTrailPool, spawnTrailPoint, wipePool } from './autoPlayFxBuffer';

type Params = {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
  autoPlayActive: SharedValue<boolean>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  capacity?: number;
};

export const useAutoPlayFxSystem = ({
  alive,
  isPaused,
  autoPlayActive,
  ballX,
  ballY,
  capacity = 48,
}: Params) => {
  const trailPool = useSharedValue(createAutoPlayTrailPool(capacity));
  const tick = useSharedValue(0);

  const prevActive = useSharedValue(false);

  useFrameCallback((fi) => {
    'worklet';
    if (!alive.value) return;
    if (isPaused.value) return;

    const dtMs = fi.timeSincePreviousFrame ?? 16.67;
    const dt = dtMs / 1000;

    const pool = trailPool.value;

    // OFF -> wipe immédiat (cohérent Shield)
    if (prevActive.value && !autoPlayActive.value) {
      wipePool(pool, capacity);
    }
    prevActive.value = autoPlayActive.value;

    // update aging
    const OFF = pool.OFFSCREEN;
    for (let i = 0; i < capacity; i++) {
      const life = pool.life[i];
      if (life <= 0) continue;

      const age = (pool.age[i] += dt);
      if (age >= life) {
        pool.life[i] = 0;
        pool.x[i] = OFF;
        pool.y[i] = OFF;
      }
    }

    if (!autoPlayActive.value) {
      tick.value = (tick.value + 1) % 1000000;
      return;
    }

    // spawn : 1 point toutes ~16ms (laser fluide)
    pool.accMs += dtMs;
    while (pool.accMs >= 16) {
      pool.accMs -= 16;
      spawnTrailPoint(pool, capacity, ballX.value, ballY.value);
    }

    tick.value = (tick.value + 1) % 1000000;
  });

  return { capacity, trailPool, tick };
};
