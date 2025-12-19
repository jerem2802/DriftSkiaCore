// src/game/balls/useBallSystem.ts
import { SharedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { getBallTrailConfig } from './ballTrailConfigs';

export type ParticlePool = {
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
  rotation: number[];
  initialScale: number[];
  isSecondary: boolean[];
};

const createParticlePool = (capacity: number, offscreen = -100000): ParticlePool => {
  return {
    head: 0,
    seed: 999999,
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
    rotation: new Array<number>(capacity).fill(0),
    initialScale: new Array<number>(capacity).fill(1),
    isSecondary: new Array<boolean>(capacity).fill(false),
  };
};

const rand01 = (pool: ParticlePool) => {
  'worklet';
  const MOD = 4294967296;
  pool.seed = (pool.seed * 1664525 + 1013904223) % MOD;
  return pool.seed / MOD;
};

const spawnParticle = (
  pool: ParticlePool,
  capacity: number,
  ballX: number,
  ballY: number,
  ballVx: number,
  ballVy: number,
  ballId: string,
  isSecondary: boolean
) => {
  'worklet';
  const config = getBallTrailConfig(ballId);
  const layer = isSecondary && config.secondary ? config.secondary : config.primary;

  const i = pool.head;
  pool.head = (pool.head + 1) % capacity;

  // OFFSET de spawn (derrière la bille)
  const offsetAngle = Math.atan2(ballVy, ballVx) + Math.PI;
  const offsetDist = 8 + rand01(pool) * 4;
  pool.x[i] = ballX + Math.cos(offsetAngle) * offsetDist;
  pool.y[i] = ballY + Math.sin(offsetAngle) * offsetDist;

  // ========== NOUVELLE LOGIQUE DE VÉLOCITÉ ==========
  // Au lieu de suivre la bille, on EXPLOSE dans toutes les directions
  const spreadAngle = (rand01(pool) - 0.5) * Math.PI;  // ±90°
  const spreadMagnitude = layer.randomSpread * (0.5 + rand01(pool) * 1.5);

  // Composante héritée (suit la bille)
  const inheritVx = ballVx * layer.velocityInherit;
  const inheritVy = ballVy * layer.velocityInherit;

  // Composante latérale (perpendiculaire au mouvement)
  const perpAngle = Math.atan2(ballVy, ballVx) + Math.PI / 2;
  const lateralVx = Math.cos(perpAngle + spreadAngle) * spreadMagnitude;
  const lateralVy = Math.sin(perpAngle + spreadAngle) * spreadMagnitude;

  pool.vx[i] = inheritVx + lateralVx;
  pool.vy[i] = inheritVy + lateralVy;

  if(layer.type === 'flames') {
    pool.vy[i] -= 50;
  }

  pool.age[i] = 0;
  pool.life[i] = layer.lifeMin + rand01(pool) * (layer.lifeMax - layer.lifeMin);
  const baseScale = layer.scaleMin + rand01(pool) * (layer.scaleMax - layer.scaleMin);
  pool.scale[i] = baseScale;
  pool.initialScale[i] = baseScale;
  pool.rotation[i] = rand01(pool) * Math.PI * 2;
  pool.isSecondary[i] = isSecondary;
};

type Params = {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  ballId: string;
  capacity?: number;
};

export const useBallSystem = ({
  alive,
  isPaused,
  ballX,
  ballY,
  ballId,
  capacity = 48,
}: Params) => {
  const particlePool = useSharedValue(createParticlePool(capacity));
  const tick = useSharedValue(0);
  const time = useSharedValue(0);
  const prevBallX = useSharedValue(ballX.value);
  const prevBallY = useSharedValue(ballY.value);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  useFrameCallback((fi) => {
    'worklet';
    if (!alive.value) return;
    if (isPaused.value) return;
    const dtMs = fi.timeSincePreviousFrame ?? 16.67;
    const dt = dtMs / 1000;
    time.value += dt;
    const pool = particlePool.value;
    const bx = ballX.value;
    const by = ballY.value;
    const dx = bx - prevBallX.value;
    const dy = by - prevBallY.value;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    velocityX.value = dx / dt;
    velocityY.value = dy / dt;
    prevBallX.value = bx;
    prevBallY.value = by;
    const config = getBallTrailConfig(ballId);
    const SPEED_THRESHOLD = 50;
    if (speed > SPEED_THRESHOLD) {
      pool.accMs += dtMs;
      const primaryRate = config.primary.spawnRate;
      if (pool.accMs >= primaryRate) {
        pool.accMs = 0;
        spawnParticle(pool, capacity, bx, by, dx / dt, dy / dt, ballId, false);
        if (config.secondary) {
          spawnParticle(pool, capacity, bx, by, dx / dt, dy / dt, ballId, true);
          if (speed > 400 && Math.random() > 0.7) {
            spawnParticle(pool, capacity, bx, by, dx / dt, dy / dt, ballId, true);
          }
        }
        if (speed > 400 && Math.random() > 0.6) {
          spawnParticle(pool, capacity, bx, by, dx / dt, dy / dt, ballId, false);
        }
      }
    }
    const OFF = pool.OFFSCREEN;
    for (let i = 0; i < capacity; i++) {
      const life = pool.life[i];
      if (life <= 0) continue;
      const isSecondary = pool.isSecondary[i];
      const layer = isSecondary && config.secondary ? config.secondary : config.primary;
      pool.x[i] += pool.vx[i] * dt;
      pool.y[i] += pool.vy[i] * dt;
      pool.vy[i] += layer.gravity * dt;
      pool.vx[i] *= layer.friction * (layer.dragX ?? 1.0);
      pool.vy[i] *= layer.friction * (layer.dragY ?? 1.0);
      if ((layer.zigzag ?? 0) > 0) {
        const zigzagOffset = Math.sin(pool.age[i] * 20) * (layer.zigzag ?? 0) * dt;
        pool.x[i] += zigzagOffset;
      }
      if ((layer.rotationSpeed ?? 0) !== 0) {
        pool.rotation[i] += (layer.rotationSpeed ?? 0) * dt;
      }
      if (layer.scaleOverLife ?? false) {
        const t = pool.age[i] / life;
        const growthFactor = 1.0 + t * 0.8;
        pool.scale[i] = pool.initialScale[i] * growthFactor;
      }
      const age = (pool.age[i] += dt);
      if (age >= life) {
        pool.life[i] = 0;
        pool.x[i] = OFF;
        pool.y[i] = OFF;
      }
    }
    tick.value = (tick.value + 1) % 1000000;
  });

  return {
    capacity,
    particlePool,
    tick,
    time,
    velocityX,
    velocityY,
  };
};