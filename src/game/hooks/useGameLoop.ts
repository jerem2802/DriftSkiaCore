// src/game/hooks/useGameLoop.ts
// Boucle de jeu 100% Reanimated (aucun re-render Canvas)
// Dash centre → centre, vitesse en fonction de la progression/combo
// + MoveRings à partir d'un certain nombre de rings passés

import { useFrameCallback } from 'react-native-reanimated';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DASH_BASE,
  DASH_EXTRA_MAX,
  DASH_CAP,
  GODLIKE_SCORE,
  RING_RADIUS,
  MOVE_RINGS_RINGS_THRESHOLD,
} from '../../constants/gameplay';
import { completeRing } from '../logic/gameLifecycle';

// Même courbe de difficulté que dans l'ancien projet
const expo01 = (t: number) => {
  'worklet';
  const K = 4.0;
  const x = Math.max(0, Math.min(1, t));
  return (Math.exp(K * x) - 1) / (Math.exp(K * 1) - 1);
};

// t = progression normalisée (ici basée sur ringsCleared / GODLIKE_SCORE)
const diffFactor = (s: number) => {
  'worklet';
  return expo01(s / GODLIKE_SCORE);
};

export const useGameLoop = (params: any) => {
  useFrameCallback((frameInfo) => {
    'worklet';

    const {
      // état principal
      alive,
      mode,
      isPaused,
      angle,
      speed,

      // rings
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

      // balle
      ballX,
      ballY,

      // gate
      gateAngle,
      gateWidth,
      dashStartTime,

      // fading ring
      fadingRingX,
      fadingRingY,
      fadingRingR,
      fadingRingScale,
      fadingRingOpacity,

      // scoring / vies
      score,
      ringsCleared,
      streak,
      combo,
      lives,
      currentHasLife,
      nextHasLife,
      currentHasAutoPlay,

      // bouclier
      currentHasShield,
      shieldAvailable,

      // auto-play
      autoPlayActive,
      autoPlayTimeLeft,

      // palettes
      currentPaletteIndex,
      nextPaletteIndex,
      getRandomPaletteIndex,
    } = params;

    if (!alive.value) {
      return;
    }

    // PAUSE : on freeze toute la boucle
    if (isPaused && isPaused.value) {
      return;
    }

    const dt =
      frameInfo.timeSincePreviousFrame != null
        ? frameInfo.timeSincePreviousFrame / 1000
        : 1 / 60;

       // --------------------
    // MOVE RINGS : drift des anneaux à partir de MOVE_RINGS_RINGS_THRESHOLD
    // avec accélération progressive selon ringsCleared
    // --------------------
    if (ringsCleared.value >= MOVE_RINGS_RINGS_THRESHOLD) {
      // Progression MoveRings :
      // - à partir du threshold → facteur 1
      // - sur ~40 rings → monte doucement jusqu'à 2x
      const MOVE_RINGS_RAMP = 40; // nb de rings pour atteindre la vitesse max
      const rawProgress =
        (ringsCleared.value - MOVE_RINGS_RINGS_THRESHOLD) / MOVE_RINGS_RAMP;
      const progress = Math.min(Math.max(rawProgress, 0), 1); // clamp 0..1
      const speedFactor = 1 + progress; // 1 → 2

      // Déplacement avec facteur de vitesse
      currentX.value += currentVX.value * speedFactor * dt;
      currentY.value += currentVY.value * speedFactor * dt;
      nextX.value += nextVX.value * speedFactor * dt;
      nextY.value += nextVY.value * speedFactor * dt;

      // Rebond simple sur les bords pour le current ring
      const marginCurrent = currentR.value;
      if (currentX.value < marginCurrent || currentX.value > CANVAS_WIDTH - marginCurrent) {
        currentVX.value = -currentVX.value;
        if (currentX.value < marginCurrent) currentX.value = marginCurrent;
        if (currentX.value > CANVAS_WIDTH - marginCurrent) {
          currentX.value = CANVAS_WIDTH - marginCurrent;
        }
      }
      if (currentY.value < marginCurrent || currentY.value > CANVAS_HEIGHT - marginCurrent) {
        currentVY.value = -currentVY.value;
        if (currentY.value < marginCurrent) currentY.value = marginCurrent;
        if (currentY.value > CANVAS_HEIGHT - marginCurrent) {
          currentY.value = CANVAS_HEIGHT - marginCurrent;
        }
      }

      // Rebond pour le next ring
      const marginNext = nextR.value;
      if (nextX.value < marginNext || nextX.value > CANVAS_WIDTH - marginNext) {
        nextVX.value = -nextVX.value;
        if (nextX.value < marginNext) nextX.value = marginNext;
        if (nextX.value > CANVAS_WIDTH - marginNext) {
          nextX.value = CANVAS_WIDTH - marginNext;
        }
      }
      if (nextY.value < marginNext || nextY.value > CANVAS_HEIGHT - marginNext) {
        nextVY.value = -nextVY.value;
        if (nextY.value < marginNext) nextY.value = marginNext;
        if (nextY.value > CANVAS_HEIGHT - marginNext) {
          nextY.value = CANVAS_HEIGHT - marginNext;
        }
      }
    }


    // --------------------
    // AUTO-PLAY: décrémenter timer
    // --------------------
    if (autoPlayActive.value && autoPlayTimeLeft.value > 0) {
      autoPlayTimeLeft.value = Math.max(0, autoPlayTimeLeft.value - dt * 1000);

      if (autoPlayTimeLeft.value === 0) {
        autoPlayActive.value = false;
      }
    }

    // --------------------
    // AUTO-PLAY: tap automatique parfait dans la gate
    // --------------------
    if (mode.value === 'orbit' && autoPlayActive.value) {
      const angleDiff = Math.abs(angle.value - gateAngle.value);
      const normalizedDiff =
        angleDiff > Math.PI ? 2 * Math.PI - angleDiff : angleDiff;

      if (normalizedDiff < 0.05) {
        mode.value = 'dash';
        dashStartTime.value = Date.now();
      }
    }

    // --------------------
    // ORBIT : la bille tourne autour du ring courant
    // --------------------
    if (mode.value === 'orbit') {
      angle.value = angle.value + speed.value * dt;
      ballX.value = currentX.value + currentR.value * Math.cos(angle.value);
      ballY.value = currentY.value + currentR.value * Math.sin(angle.value);
      return;
    }

    // --------------------
    // DASH : centre → centre, dashSpeed dépend de la progression + combo
    // --------------------
    if (mode.value === 'dash') {
      // 1) Vitesse de dash : base + progression (ringsCleared) + combo
      const comboDash = Math.min(combo.value * 12, 999);
      const extra = DASH_EXTRA_MAX * diffFactor(ringsCleared.value);
      const dashSpeed = Math.min(DASH_BASE + extra + comboDash, DASH_CAP);

      // 2) Direction : centre du ring courant → centre du ring suivant
      const dx = nextX.value - ballX.value;
      const dy = nextY.value - ballY.value;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // 3) Avance de la bille
      const step = dashSpeed * dt;

      if (dist > step) {
        ballX.value += (dx / dist) * step;
        ballY.value += (dy / dist) * step;
      } else {
        // snap propre au centre du ring suivant
        ballX.value = nextX.value;
        ballY.value = nextY.value;
      }

      // 4) Détection d'entrée dans le ring suivant
      const dist2 =
        (ballX.value - nextX.value) * (ballX.value - nextX.value) +
        (ballY.value - nextY.value) * (ballY.value - nextY.value);

      const insideNext =
        dist2 <= (nextR.value - 6) * (nextR.value - 6);

      if (insideNext) {
        completeRing({
          // Palettes
          currentPaletteIndex,
          nextPaletteIndex,
          getRandomPaletteIndex,

          // Fading ring
          fadingRingX,
          fadingRingY,
          fadingRingR,
          fadingRingScale,
          fadingRingOpacity,

          // Rings
          currentX,
          currentY,
          currentR,
          nextX,
          nextY,
          nextR,

          // Vitesses
          currentVX,
          currentVY,
          nextVX,
          nextVY,

          // Ball & gate
          score,
          ringsCleared,
          speed,
          gateAngle,
          gateWidth,
          angle,
          ballX,
          ballY,

          // Mode & timing
          mode,
          dashStartTime,

          // Scoring / vies
          streak,
          combo,
          lives,

          // Vie sur ring
          currentHasLife,
          nextHasLife,

          // Auto-play
          currentHasAutoPlay,

          // Shield
          currentHasShield,
          shieldAvailable,

          // Divers
          isPerfect: false,
          RING_RADIUS,
        });
      }
    }
  });
};
