// src/game/hooks/useGameLoop.ts
// Boucle de jeu 100% Reanimated (aucun re-render Canvas)
// Comportement de dash calqué sur l'ancien projet (centre → centre, vitesse en fonction du score/combo)

import { useFrameCallback } from 'react-native-reanimated';
import {
  CANVAS_WIDTH,
  DASH_BASE,
  DASH_EXTRA_MAX,
  DASH_CAP,
  GODLIKE_SCORE,
} from '../../constants/gameplay';
import { completeRing } from '../logic/gameLifecycle';

const RING_RADIUS = CANVAS_WIDTH * 0.25;

// Même courbe de difficulté que dans l'ancien projet
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
      // état principal
      alive,
      mode,
      angle,
      speed,

      currentX,
      currentY,
      currentR,

      nextX,
      nextY,
      nextR,

      ballX,
      ballY,

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
      streak,
      combo,
      lives,
      currentHasLife,
      nextHasLife,
      currentHasAutoPlay,

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

    const dt =
      frameInfo.timeSincePreviousFrame != null
        ? frameInfo.timeSincePreviousFrame / 1000
        : 1 / 60;

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
      const normalizedDiff = angleDiff > Math.PI ? 2 * Math.PI - angleDiff : angleDiff;
      
      if (normalizedDiff < 0.05) { // Tap parfait
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
    // DASH : comportement "ancien projet"
    // centre → centre, dashSpeed dépend de score + combo
    // --------------------
    if (mode.value === 'dash') {
      // 1) Vitesse de dash comme avant
      const comboDash = Math.min(combo.value * 12, 999);
      const extra = DASH_EXTRA_MAX * diffFactor(score.value);
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
          currentHasLife,
          nextHasLife,
          currentHasAutoPlay,
          isPerfect: false,
          RING_RADIUS,
        });
      }
    }
  });
};