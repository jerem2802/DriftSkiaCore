// src/game/hooks/useGameLoop.ts
// Boucle de jeu 100% Reanimated (aucun re-render Canvas)
// Dash centre → centre, vitesse en fonction de la progression
// MoveRings + SpinRings + AutoPlay

import { useFrameCallback } from 'react-native-reanimated';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DASH_BASE,
  DASH_EXTRA_MAX,
  DASH_CAP,
  GODLIKE_SCORE,
  RING_RADIUS,
  MOVE_RINGS_SCORE_THRESHOLD,
  SPIN_RINGS_RINGS_THRESHOLD,
  SPIN_RINGS_RAMP,
  SPIN_SPEED_MIN,
  SPIN_SPEED_MAX,
} from '../../constants/gameplay';
import { completeRing } from '../logic/gameLifecycle';

const expo01 = (t: number) => {
  'worklet';
  const K = 4.0;
  const x = Math.max(0, Math.min(1, t));
  return (Math.exp(K * x) - 1) / (Math.exp(K * 1) - 1);
};

const diffFactor = (s: number) => {
  'worklet';
  return expo01(s / GODLIKE_SCORE);
};

export const useGameLoop = (params: any) => {
  useFrameCallback((frameInfo) => {
    'worklet';

    const {
      alive,
      mode,
      isPaused,
      angle,
      speed,

      currentX,
      currentY,
      currentR,
      currentVX,
      currentVY,

      nextX,
      nextY,
      nextR,
      nextVX,
      nextVY,

      ballX,
      ballY,

      gateAngle,
      gateWidth,
      dashStartTime,

      fadingRingX,
      fadingRingY,
      fadingRingR,
      fadingRingScale,
      fadingRingOpacity,

      score,
      ringsCleared,
      streak,
      combo,
      lives,
      currentHasLife,
      nextHasLife,
      currentHasAutoPlay,

      currentHasCoin, // ✅

      currentHasShield,
      shieldAvailable,
      shieldChargesLeft,

      autoPlayActive,
      autoPlayTimeLeft,

      currentPaletteIndex,
      nextPaletteIndex,
      getRandomPaletteIndex,

      scorePopupText,
      scorePopupOpacity,
      scorePopupX,
      scorePopupY,
    } = params;

    if (!alive.value) return;
    if (isPaused && isPaused.value) return;

    const dt =
      frameInfo.timeSincePreviousFrame != null
        ? frameInfo.timeSincePreviousFrame / 1000
        : 1 / 60;

    // SPIN RINGS
    if (ringsCleared.value >= SPIN_RINGS_RINGS_THRESHOLD) {
      const ringsOver = ringsCleared.value - SPIN_RINGS_RINGS_THRESHOLD;
      let progress = ringsOver / SPIN_RINGS_RAMP;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      const spinSpeed = SPIN_SPEED_MIN + (SPIN_SPEED_MAX - SPIN_SPEED_MIN) * progress;
      gateAngle.value = gateAngle.value + spinSpeed * dt;
    }

    // MOVE RINGS
    if (ringsCleared.value >= MOVE_RINGS_SCORE_THRESHOLD) {
      const MOVE_RINGS_RAMP = 40;
      const rawProgress =
        (ringsCleared.value - MOVE_RINGS_SCORE_THRESHOLD) / MOVE_RINGS_RAMP;
      const progress = Math.min(Math.max(rawProgress, 0), 1);
      const speedFactor = 1 + progress;

      currentX.value += currentVX.value * speedFactor * dt;
      currentY.value += currentVY.value * speedFactor * dt;
      nextX.value += nextVX.value * speedFactor * dt;
      nextY.value += nextVY.value * speedFactor * dt;

      const marginCurrent = currentR.value;
      if (currentX.value < marginCurrent || currentX.value > CANVAS_WIDTH - marginCurrent) {
        currentVX.value = -currentVX.value;
        if (currentX.value < marginCurrent) currentX.value = marginCurrent;
        if (currentX.value > CANVAS_WIDTH - marginCurrent) currentX.value = CANVAS_WIDTH - marginCurrent;
      }
      if (currentY.value < marginCurrent || currentY.value > CANVAS_HEIGHT - marginCurrent) {
        currentVY.value = -currentVY.value;
        if (currentY.value < marginCurrent) currentY.value = marginCurrent;
        if (currentY.value > CANVAS_HEIGHT - marginCurrent) currentY.value = CANVAS_HEIGHT - marginCurrent;
      }

      const marginNext = nextR.value;
      if (nextX.value < marginNext || nextX.value > CANVAS_WIDTH - marginNext) {
        nextVX.value = -nextVX.value;
        if (nextX.value < marginNext) nextX.value = marginNext;
        if (nextX.value > CANVAS_WIDTH - marginNext) nextX.value = CANVAS_WIDTH - marginNext;
      }
      if (nextY.value < marginNext || nextY.value > CANVAS_HEIGHT - marginNext) {
        nextVY.value = -nextVY.value;
        if (nextY.value < marginNext) nextY.value = marginNext;
        if (nextY.value > CANVAS_HEIGHT - marginNext) nextY.value = CANVAS_HEIGHT - marginNext;
      }
    }

    // AUTO-PLAY timer
    if (autoPlayActive.value && autoPlayTimeLeft.value > 0) {
      autoPlayTimeLeft.value = Math.max(0, autoPlayTimeLeft.value - dt * 1000);
      if (autoPlayTimeLeft.value === 0) autoPlayActive.value = false;
    }

    // AUTO-PLAY: tap auto
    if (mode.value === 'orbit' && autoPlayActive.value) {
      const angleDiff = Math.abs(angle.value - gateAngle.value);
      const normalizedDiff = angleDiff > Math.PI ? 2 * Math.PI - angleDiff : angleDiff;
      if (normalizedDiff < 0.05) {
        mode.value = 'dash';
        dashStartTime.value = Date.now();
      }
    }

    // ORBIT
    if (mode.value === 'orbit') {
      angle.value = angle.value + speed.value * dt;
      ballX.value = currentX.value + currentR.value * Math.cos(angle.value);
      ballY.value = currentY.value + currentR.value * Math.sin(angle.value);
      return;
    }

    // DASH
    if (mode.value === 'dash') {
      const comboDash = Math.min(combo.value * 12, 999);
      const extra = DASH_EXTRA_MAX * diffFactor(ringsCleared.value);
      const dashSpeed = Math.min(DASH_BASE + extra + comboDash, DASH_CAP);

      const dx = nextX.value - ballX.value;
      const dy = nextY.value - ballY.value;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const step = dashSpeed * dt;

      if (dist > step) {
        ballX.value += (dx / dist) * step;
        ballY.value += (dy / dist) * step;
      } else {
        ballX.value = nextX.value;
        ballY.value = nextY.value;
      }

      const dist2 =
        (ballX.value - nextX.value) * (ballX.value - nextX.value) +
        (ballY.value - nextY.value) * (ballY.value - nextY.value);

      const insideNext = dist2 <= (nextR.value - 6) * (nextR.value - 6);

      if (insideNext) {
        completeRing({
          currentPaletteIndex,
          nextPaletteIndex,
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

          currentVX,
          currentVY,
          nextVX,
          nextVY,

          score,
          speed,
          gateAngle,
          gateWidth,
          angle,
          ballX,
          ballY,

          mode,
          dashStartTime,

          streak,
          combo,
          lives,
          ringsCleared,

          currentHasLife,
          nextHasLife,

          currentHasAutoPlay,

          currentHasShield,
          shieldAvailable,
          shieldChargesLeft,

          currentHasCoin, // ✅

          scorePopupText,
          scorePopupOpacity,
          scorePopupX,
          scorePopupY,

          isPerfect: false,
          RING_RADIUS,
        });
      }
    }
  });
};
