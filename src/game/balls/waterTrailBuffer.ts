// src/game/balls/waterTrailBuffer.ts

export type WaterTrailPool = {
  head: number;
  seed: number;
  accMs: number;
  
  prevBallX: number;
  prevBallY: number;
  
  OFFSCREEN: number;
  
  x: number[];
  y: number[];
  
  vx: number[];
  vy: number[];
  
  age: number[];
  life: number[];
  scale: number[];
};

export const createWaterTrailPool = (
  capacity: number,
  offscreen = -100000
): WaterTrailPool => {
  return {
    head: 0,
    seed: 888888,
    accMs: 0,
    
    prevBallX: 0,
    prevBallY: 0,
    
    OFFSCREEN: offscreen,
    
    x: new Array<number>(capacity).fill(offscreen),
    y: new Array<number>(capacity).fill(offscreen),
    
    vx: new Array<number>(capacity).fill(0),
    vy: new Array<number>(capacity).fill(0),
    
    age: new Array<number>(capacity).fill(0),
    life: new Array<number>(capacity).fill(0),
    scale: new Array<number>(capacity).fill(1),
  };
};

export const rand01 = (pool: WaterTrailPool) => {
  'worklet';
  const MOD = 4294967296;
  pool.seed = (pool.seed * 1664525 + 1013904223) % MOD;
  return pool.seed / MOD;
};

export const spawnDroplet = (
  pool: WaterTrailPool,
  capacity: number,
  ballX: number,
  ballY: number,
  ballVx: number,
  ballVy: number
) => {
  'worklet';
  
  const i = pool.head;
  pool.head = (pool.head + 1) % capacity;
  
  // Spawn légèrement en retrait de la bille
  const offsetAngle = Math.atan2(ballVy, ballVx) + Math.PI; // Direction opposée
  const offsetDist = 8 + rand01(pool) * 4;
  
  pool.x[i] = ballX + Math.cos(offsetAngle) * offsetDist;
  pool.y[i] = ballY + Math.sin(offsetAngle) * offsetDist;
  
  // Vélocité : hérite partiellement du mouvement de la bille
  pool.vx[i] = ballVx * 0.3 + (rand01(pool) - 0.5) * 20;
  pool.vy[i] = ballVy * 0.3 + (rand01(pool) - 0.5) * 20;
  
  // Gravité (les gouttes tombent légèrement)
  pool.vy[i] += 30;
  
  pool.age[i] = 0;
  pool.life[i] = 0.3 + rand01(pool) * 0.2; // 300-500ms
  
  pool.scale[i] = 0.6 + rand01(pool) * 0.4;
};

export const wipeTrailPool = (pool: WaterTrailPool, capacity: number) => {
  'worklet';
  const OFF = pool.OFFSCREEN;
  for (let i = 0; i < capacity; i++) {
    pool.life[i] = 0;
    pool.age[i] = 0;
    pool.x[i] = OFF;
    pool.y[i] = OFF;
  }
};