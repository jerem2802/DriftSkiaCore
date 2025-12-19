// src/game/balls/useWaterTrailSystem.ts

import { SharedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { createWaterTrailPool, spawnDroplet } from './waterTrailBuffer';

type Params = {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  capacity?: number;
};

export const useWaterTrailSystem = ({
  alive,
  isPaused,
  ballX,
  ballY,
  capacity = 32,
}: Params) => {
  const trailPool = useSharedValue(createWaterTrailPool(capacity));
  const tick = useSharedValue(0);
  
  useFrameCallback((fi) => {
    'worklet';
    
    if (!alive.value) return;
    if (isPaused.value) return;
    
    const dtMs = fi.timeSincePreviousFrame ?? 16.67;
    const dt = dtMs / 1000;
    
    const pool = trailPool.value;
    const bx = ballX.value;
    const by = ballY.value;
    
    // Détecte le mouvement de la bille
    const dx = bx - pool.prevBallX;
    const dy = by - pool.prevBallY;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    
    pool.prevBallX = bx;
    pool.prevBallY = by;
    
    // Spawn seulement si la bille bouge (speed > seuil)
    const SPEED_THRESHOLD = 50; // pixels/sec
    
    if (speed > SPEED_THRESHOLD) {
      pool.accMs += dtMs;
      
      // Spawn rate : plus la bille va vite, plus de gouttes
      const spawnInterval = Math.max(20, 60 - speed * 0.1);
      
      if (pool.accMs >= spawnInterval) {
        pool.accMs = 0;
        
        spawnDroplet(pool, capacity, bx, by, dx / dt, dy / dt);
        
        // Double spawn si très rapide
        if (speed > 400 && Math.random() > 0.6) {
          spawnDroplet(pool, capacity, bx, by, dx / dt, dy / dt);
        }
      }
    }
    
    // Update droplets
    const OFF = pool.OFFSCREEN;
    const GRAVITY = 80; // pixels/sec²
    
    for (let i = 0; i < capacity; i++) {
      const life = pool.life[i];
      if (life <= 0) continue;
      
      // Physics
      pool.x[i] += pool.vx[i] * dt;
      pool.y[i] += pool.vy[i] * dt;
      
      // Gravité
      pool.vy[i] += GRAVITY * dt;
      
      // Friction
      pool.vx[i] *= 0.98;
      pool.vy[i] *= 0.98;
      
      // Age
      const age = (pool.age[i] += dt);
      if (age >= life) {
        pool.life[i] = 0;
        pool.x[i] = OFF;
        pool.y[i] = OFF;
      }
    }
    
    tick.value = (tick.value + 1) % 1000000;
  });
  
  return { capacity, trailPool, tick };
};