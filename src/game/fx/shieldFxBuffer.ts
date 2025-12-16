// src/game/fx/shieldFxBuffer.ts
export type ShieldBoltPool = {
  head: number;
  seed: number;
  accMs: number;

  OFFSCREEN: number;

  // world positions
  x: number[];
  y: number[];

  // local offsets (collés à la bille)
  ox: number[];
  oy: number[];

  rot: number[];
  scale: number[];

  age: number[];
  life: number[];
};

export const createShieldBoltPool = (
  capacity: number,
  offscreen = -100000
): ShieldBoltPool => {
  return {
    head: 0,
    seed: 777777,
    accMs: 0,
    OFFSCREEN: offscreen,

    x: new Array<number>(capacity).fill(offscreen),
    y: new Array<number>(capacity).fill(offscreen),

    ox: new Array<number>(capacity).fill(0),
    oy: new Array<number>(capacity).fill(0),

    rot: new Array<number>(capacity).fill(0),
    scale: new Array<number>(capacity).fill(1),

    age: new Array<number>(capacity).fill(0),
    life: new Array<number>(capacity).fill(0),
  };
};

// RNG sans bitwise (évite "no-bitwise", reste stable)
export const rand01 = (pool: ShieldBoltPool) => {
  'worklet';
  const MOD = 4294967296; // 2^32
  pool.seed = (pool.seed * 1664525 + 1013904223) % MOD;
  return pool.seed / MOD;
};

export const wipePool = (pool: ShieldBoltPool, capacity: number) => {
  'worklet';
  const OFF = pool.OFFSCREEN;
  for (let i = 0; i < capacity; i++) {
    pool.life[i] = 0;
    pool.age[i] = 0;
    pool.x[i] = OFF;
    pool.y[i] = OFF;
    pool.ox[i] = 0;
    pool.oy[i] = 0;
  }
};

export const spawnBolt = (pool: ShieldBoltPool, capacity: number) => {
  'worklet';
  const i = pool.head;
  pool.head = (pool.head + 1) % capacity;

  const a = rand01(pool) * Math.PI * 2;
  const r = 6 + rand01(pool) * 6; // collé à la bille

  pool.ox[i] = Math.cos(a) * r;
  pool.oy[i] = Math.sin(a) * r;

  pool.rot[i] = a + (rand01(pool) - 0.5) * 0.6;
  pool.scale[i] = 0.35 + rand01(pool) * 0.35;

  pool.age[i] = 0;
  pool.life[i] = 0.02 + rand01(pool) * 0.04;
};
