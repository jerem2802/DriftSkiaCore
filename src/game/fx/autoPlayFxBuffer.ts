// src/game/fx/autoPlayFxBuffer.ts
export type AutoPlayTrailPool = {
  head: number;
  seed: number;
  accMs: number;

  OFFSCREEN: number;

  x: number[];
  y: number[];

  rot: number[];
  scale: number[];

  age: number[];
  life: number[];

  // pour calculer l'orientation à l’émission
  lastX: number;
  lastY: number;
  hasLast: boolean;
};

export const createAutoPlayTrailPool = (
  capacity: number,
  offscreen = -100000
): AutoPlayTrailPool => {
  return {
    head: 0,
    seed: 424242,
    accMs: 0,
    OFFSCREEN: offscreen,

    x: new Array<number>(capacity).fill(offscreen),
    y: new Array<number>(capacity).fill(offscreen),

    rot: new Array<number>(capacity).fill(0),
    scale: new Array<number>(capacity).fill(1),

    age: new Array<number>(capacity).fill(0),
    life: new Array<number>(capacity).fill(0),

    lastX: 0,
    lastY: 0,
    hasLast: false,
  };
};

// RNG identique au Shield (worklet-safe)
export const rand01 = (pool: AutoPlayTrailPool) => {
  'worklet';
  const MOD = 4294967296;
  pool.seed = (pool.seed * 1664525 + 1013904223) % MOD;
  return pool.seed / MOD;
};

export const wipePool = (pool: AutoPlayTrailPool, capacity: number) => {
  'worklet';
  const OFF = pool.OFFSCREEN;
  for (let i = 0; i < capacity; i++) {
    pool.life[i] = 0;
    pool.age[i] = 0;
    pool.x[i] = OFF;
    pool.y[i] = OFF;
  }
  pool.hasLast = false;
};

export const spawnTrailPoint = (
  pool: AutoPlayTrailPool,
  capacity: number,
  bx: number,
  by: number
) => {
  'worklet';
  const i = pool.head;
  pool.head = (pool.head + 1) % capacity;

  // direction basée sur le delta bille (donne l’angle de la traînée)
  let ang = 0;
  let speed = 0;

  if (pool.hasLast) {
    const dx = bx - pool.lastX;
    const dy = by - pool.lastY;
    speed = Math.sqrt(dx * dx + dy * dy);
    ang = Math.atan2(dy, dx);
  } else {
    pool.hasLast = true;
  }

  pool.lastX = bx;
  pool.lastY = by;

  // petit jitter pour “vibrer laser”
  const jitter = (rand01(pool) - 0.5) * 0.22;
  pool.rot[i] = ang + jitter;

  // scale “streak” (uniforme via RSXform) : plus la bille bouge, plus c’est “dense”
  // (uniforme = ça épaissit aussi, donc sprite de base restera fin)
  const s = 0.32 + Math.min(0.55, speed * 0.05) + rand01(pool) * 0.10;
  pool.scale[i] = s;

  pool.x[i] = bx;
  pool.y[i] = by;

  pool.age[i] = 0;
  // lifetime court = laser propre
  pool.life[i] = 0.10 + rand01(pool) * 0.14; // 100–240ms
};
