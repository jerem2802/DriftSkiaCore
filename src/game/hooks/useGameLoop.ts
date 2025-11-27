// src/game/hooks/useGameLoop.ts
// Game loop principal (orbit + dash)

import { useFrameCallback } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { insideRing, isPerfectTap } from '../logic/collisionDetection';
import { completeRing, loseLife } from '../logic/gameLifecycle';
import { DASH_SPEED, DASH_TIMEOUT } from '../../constants/gameplay';

interface UseGameLoopParams {
  alive: SharedValue<boolean>;
  mode: SharedValue<'orbit' | 'dash'>;
  score: SharedValue<number>;
  angle: SharedValue<number>;
  speed: SharedValue<number>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  currentR: SharedValue<number>;
  nextX: SharedValue<number>;
  nextY: SharedValue<number>;
  nextR: SharedValue<number>;
  dashStartTime: SharedValue<number>;
  lives: SharedValue<number>;
  gateAngle: SharedValue<number>;
  gateWidth: SharedValue<number>;
  streak: SharedValue<number>;
  combo: SharedValue<number>;
  fadingRingX: SharedValue<number>;
  fadingRingY: SharedValue<number>;
  fadingRingR: SharedValue<number>;
  fadingRingScale: SharedValue<number>;
  fadingRingOpacity: SharedValue<number>;
  currentPaletteIndex: SharedValue<number>;
  nextPaletteIndex: SharedValue<number>;
  fadingRingPaletteIndex: SharedValue<number>;
  getRandomPaletteIndex: (exclude?: number) => number;
  setDisplayScoreUI: (score: number) => void;
  setLivesUI: (lives: number) => void;
  setAliveUI: (alive: boolean) => void;
  RING_RADIUS: number;
}

export const useGameLoop = (params: UseGameLoopParams) => {
  const {
    alive,
    mode,
    score,
    angle,
    speed,
    ballX,
    ballY,
    currentX,
    currentY,
    currentR,
    nextX,
    nextY,
    nextR,
    dashStartTime,
    lives,
    gateAngle,
    gateWidth,
    streak,
    combo,
    fadingRingX,
    fadingRingY,
    fadingRingR,
    fadingRingScale,
    fadingRingOpacity,
    currentPaletteIndex,
    nextPaletteIndex,
    fadingRingPaletteIndex,
    getRandomPaletteIndex,
    setAliveUI,
    RING_RADIUS,
  } = params;

  useFrameCallback((frameInfo) => {
    'worklet';
    if (!alive.value) {
      return;
    }

    const dt = frameInfo.timeSincePreviousFrame ? frameInfo.timeSincePreviousFrame / 1000 : 0.016;
    const now = Date.now();

    if (mode.value === 'orbit') {
      angle.value = angle.value + speed.value * dt;
      ballX.value = currentX.value + currentR.value * Math.cos(angle.value);
      ballY.value = currentY.value + currentR.value * Math.sin(angle.value);
    } else if (mode.value === 'dash') {
      const dx = nextX.value - ballX.value;
      const dy = nextY.value - ballY.value;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        ballX.value = ballX.value + (dx / dist) * DASH_SPEED * dt;
        ballY.value = ballY.value + (dy / dist) * DASH_SPEED * dt;
      }

      if (insideRing(ballX.value, ballY.value, nextX.value, nextY.value, nextR.value)) {
        const wasPerfect = isPerfectTap(angle.value, gateAngle.value);
        
        completeRing({
          currentPaletteIndex,
          nextPaletteIndex,
          fadingRingPaletteIndex,
          getRandomPaletteIndex,
          fadingRingX,
          fadingRingY,
          fadingRingR,
          fadingRingScale,
          fadingRingOpacity,
          currentX,
          currentY,
          currentR,
          nextX,
          nextY,
          nextR,
          score,
          speed,
          gateAngle,
          gateWidth,
          angle,
          mode,
          dashStartTime,
          streak,
          combo,
          lives,
          isPerfect: wasPerfect,
          RING_RADIUS,
        });
      }

      if (dashStartTime.value > 0 && now - dashStartTime.value > DASH_TIMEOUT) {
        loseLife({
          lives,
          alive,
          streak,
          combo,
          setLivesUI: () => {},
          setAliveUI: (a) => setAliveUI(a),
        });
        mode.value = 'orbit';
        dashStartTime.value = 0;
      }
    }
  }, true);
};