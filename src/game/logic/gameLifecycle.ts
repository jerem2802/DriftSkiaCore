// src/game/logic/gameLifecycle.ts
// Logique du cycle de vie du jeu (completeRing, loseLife, restart)

import { withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { generateNextRing } from './ringGenerator';
import { shouldSpawnShield } from './shieldBonus';
import { triggerScorePopup } from './scorePopup';
import { computeGainedPoints } from './scoreRules';

import {
  SPEED_INC_PER_RING,
  SPEED_CAP,
  MIN_GATE_WIDTH,
  SHRINK_PER_RING,
  STREAK_FOR_LIFE,
  LIVES_MAX,
  AUTOPLAY_SPAWN_CHANCE,
} from '../../constants/gameplay';

interface CompleteRingParams {
  // Palettes
  currentPaletteIndex: SharedValue<number>;
  nextPaletteIndex: SharedValue<number>;
  getRandomPaletteIndex: (exclude?: number) => number;

  // Fading ring
  fadingRingX: SharedValue<number>;
  fadingRingY: SharedValue<number>;
  fadingRingR: SharedValue<number>;
  fadingRingScale: SharedValue<number>;
  fadingRingOpacity: SharedValue<number>;

  // Rings
  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  currentR: SharedValue<number>;
  nextX: SharedValue<number>;
  nextY: SharedValue<number>;
  nextR: SharedValue<number>;

  // Vitesse des rings
  currentVX: SharedValue<number>;
  currentVY: SharedValue<number>;
  nextVX: SharedValue<number>;
  nextVY: SharedValue<number>;

  // Ball & gate
  score: SharedValue<number>;
  speed: SharedValue<number>;
  gateAngle: SharedValue<number>;
  gateWidth: SharedValue<number>;
  angle: SharedValue<number>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;

  // Mode & timing
  mode: SharedValue<'orbit' | 'dash'>;
  dashStartTime: SharedValue<number>;

  // Scoring / vies
  streak: SharedValue<number>;
  combo: SharedValue<number>;
  lives: SharedValue<number>;
  ringsCleared: SharedValue<number>;

  // Vie sur ring
  currentHasLife: SharedValue<boolean>;
  nextHasLife: SharedValue<boolean>;

  // Auto-play bonus
  currentHasAutoPlay: SharedValue<boolean>;

  // Shield bonus
  currentHasShield: SharedValue<boolean>;
  shieldAvailable: SharedValue<boolean>;
  shieldChargesLeft: SharedValue<number>;

  // Popup score (dans le secondary ring)
  scorePopupText: SharedValue<string>;
  scorePopupOpacity: SharedValue<number>;
  scorePopupX: SharedValue<number>;
  scorePopupY: SharedValue<number>;

  // Divers
  isPerfect: boolean;
  RING_RADIUS: number;
}

export const completeRing = (params: CompleteRingParams) => {
  'worklet';
  const {
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

    // Vitesses rings
    currentVX,
    currentVY,
    nextVX,
    nextVY,

    // Ball & gate
    score,
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
    ringsCleared,

    // Vie sur ring
    currentHasLife,
    nextHasLife,

    // Auto-play bonus
    currentHasAutoPlay,

    // Shield bonus
    currentHasShield,
    shieldAvailable,
    shieldChargesLeft,

    // Popup score
    scorePopupText,
    scorePopupOpacity,
    scorePopupX,
    scorePopupY,

    // Divers
    isPerfect,
    RING_RADIUS,
  } = params;

// 1) SCORE : base + perfect, puis multiplicateur sur streak
const nextStreak = streak.value + 1; // streak après ce ring
const basePoints = 1 + (isPerfect ? 1 : 0);

if (isPerfect) {
  combo.value = combo.value + 1;
} else {
  combo.value = 0;
}

const gained = computeGainedPoints({
  basePoints,
  streakAfterThisRing: nextStreak,
});

score.value = score.value + gained;


  // 2) Orbes non prises → reset
  if (currentHasLife.value) {
    currentHasLife.value = false;
  }
  nextHasLife.value = false;

  if (currentHasAutoPlay.value) {
    currentHasAutoPlay.value = false;
  }

  // Bouclier sur le ring courant : consommé/raté
  currentHasShield.value = false;

  // 3) STREAK + compteur de rings
  streak.value = streak.value + 1;
  ringsCleared.value = ringsCleared.value + 1;

  // 4) PALETTES (jamais 2 rings de la même couleur)
  currentPaletteIndex.value = nextPaletteIndex.value;
  const newIndex = getRandomPaletteIndex(currentPaletteIndex.value);
  nextPaletteIndex.value = newIndex;

  // 5) FADING RING
  fadingRingX.value = currentX.value;
  fadingRingY.value = currentY.value;
  fadingRingR.value = currentR.value;
  fadingRingScale.value = 1;
  fadingRingOpacity.value = 1;

  fadingRingOpacity.value = withTiming(0, { duration: 400 });
  fadingRingScale.value = withTiming(1.25, { duration: 400 });

  // 6) ANGLE D'ARRIVÉE (avant de modifier current !)
  angle.value = Math.atan2(ballY.value - nextY.value, ballX.value - nextX.value);

  // 7) TRANSITION : NEXT → CURRENT
  currentX.value = nextX.value;
  currentY.value = nextY.value;
  currentR.value = nextR.value;
  currentVX.value = nextVX.value;
  currentVY.value = nextVY.value;

  // 8) GÉNÉRATION NOUVEAU RING "NEXT"
  const next = generateNextRing(
    currentX.value,
    currentY.value,
    currentR.value,
    RING_RADIUS
  );
  nextX.value = next.x;
  nextY.value = next.y;
  nextR.value = next.r;
  nextVX.value = next.vx;
  nextVY.value = next.vy;

  // 9) SPEED / GATE
  speed.value = Math.min(speed.value + SPEED_INC_PER_RING, SPEED_CAP);
  gateWidth.value = Math.max(gateWidth.value - SHRINK_PER_RING, MIN_GATE_WIDTH);
  gateAngle.value = Math.atan2(nextY.value - currentY.value, nextX.value - currentX.value);

  // 10) PLACER LA BILLE SUR LE NOUVEAU RING
  ballX.value = currentX.value + currentR.value * Math.cos(angle.value);
  ballY.value = currentY.value + currentR.value * Math.sin(angle.value);

  mode.value = 'orbit';
  dashStartTime.value = 0;

  // 11) POPUP DE SCORE dans le ring (ex-secondary devenu current)
  triggerScorePopup({
    gained,
    currentX,
    currentY,
    scorePopupText,
    scorePopupOpacity,
    scorePopupX,
    scorePopupY,
  });

  // Synchronisation "disponible" ← charges (évite tout état incohérent)
  shieldAvailable.value = shieldChargesLeft.value > 0;

  // 12) SPAWN ORBE DE VIE
  if (
    streak.value >= STREAK_FOR_LIFE &&
    lives.value < LIVES_MAX &&
    !currentHasLife.value
  ) {
    streak.value = 0;
    currentHasLife.value = true;
  }

  // 13) SPAWN AUTO-PLAY
  if (Math.random() < AUTOPLAY_SPAWN_CHANCE && !currentHasAutoPlay.value) {
    currentHasAutoPlay.value = true;
  }

  // 14) SPAWN SHIELD (autorisé tant que charges < 3)
  if (shouldSpawnShield(shieldChargesLeft, currentHasShield)) {
    currentHasShield.value = true;
  }
};

interface LoseLifeParams {
  lives: SharedValue<number>;
  alive: SharedValue<boolean>;
  streak: SharedValue<number>;
  combo: SharedValue<number>;
  currentHasLife: SharedValue<boolean>;
  nextHasLife: SharedValue<boolean>;
  currentHasAutoPlay: SharedValue<boolean>;
  shieldAvailable: SharedValue<boolean>;
  shieldArmed: SharedValue<boolean>;
  shieldChargesLeft: SharedValue<number>;
}

export const loseLife = (params: LoseLifeParams) => {
  'worklet';
  const {
    lives,
    alive,
    streak,
    combo,
    currentHasLife,
    nextHasLife,
    currentHasAutoPlay,
    shieldAvailable,
    shieldArmed,
    shieldChargesLeft,
  } = params;

  // 1) Reset scoring / orbes
  streak.value = 0;
  combo.value = 0;
  currentHasLife.value = false;
  nextHasLife.value = false;
  currentHasAutoPlay.value = false;

  // 2) Safe miss via shield (1 charge consommée, puis désarmement)
  if (shieldArmed.value && shieldChargesLeft.value > 0) {
    shieldChargesLeft.value = Math.max(0, shieldChargesLeft.value - 1);

    // IMPORTANT: 1 activation = 1 safe miss
    shieldArmed.value = false;

    // Disponible tant qu'il reste des charges
    shieldAvailable.value = shieldChargesLeft.value > 0;

    return; // pas de perte de vie
  }


  // 3) Perte de vie classique
  if (lives.value <= 1) {
    lives.value = 0;
    alive.value = false;
    return;
  }

  lives.value = lives.value - 1;
};

// Restart : reset complet
interface RestartParams {
  alive: SharedValue<boolean>;
  lives: SharedValue<number>;
  score: SharedValue<number>;

  speed: SharedValue<number>;
  gateWidth: SharedValue<number>;
  mode: SharedValue<'orbit' | 'dash'>;
  isPaused: SharedValue<boolean>;
  streak: SharedValue<number>;
  combo: SharedValue<number>;
  ringsCleared: SharedValue<number>;
  comboTier: SharedValue<number>;
  comboLabelOpacity: SharedValue<number>;
  bgPulse: SharedValue<number>;

  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  currentR: SharedValue<number>;
  nextX: SharedValue<number>;
  nextY: SharedValue<number>;
  nextR: SharedValue<number>;

  currentVX: SharedValue<number>;
  currentVY: SharedValue<number>;
  nextVX: SharedValue<number>;
  nextVY: SharedValue<number>;

  gateAngle: SharedValue<number>;
  angle: SharedValue<number>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;

  fadingRingOpacity: SharedValue<number>;

  currentPaletteIndex: SharedValue<number>;
  nextPaletteIndex: SharedValue<number>;
  currentHasLife: SharedValue<boolean>;
  nextHasLife: SharedValue<boolean>;
  currentHasAutoPlay: SharedValue<boolean>;
  currentHasShield: SharedValue<boolean>;
  autoPlayInInventory: SharedValue<boolean>;
  autoPlayActive: SharedValue<boolean>;
  autoPlayTimeLeft: SharedValue<number>;
  shieldAvailable: SharedValue<boolean>;
  shieldArmed: SharedValue<boolean>;
  shieldChargesLeft: SharedValue<number>;
  scorePopupText: SharedValue<string>;
  scorePopupOpacity: SharedValue<number>;
  scorePopupX: SharedValue<number>;
  scorePopupY: SharedValue<number>;
  getRandomPaletteIndex: (exclude?: number) => number;

  CENTER_X: number;
  CENTER_Y: number;
  RING_RADIUS: number;
  START_ORBIT_SPEED: number;
  START_GATE_WIDTH: number;
}

export const restart = (params: RestartParams) => {
  'worklet';
  const {
    alive,
    lives,
    score,
    speed,
    gateWidth,
    mode,
    isPaused,
    streak,
    combo,
    ringsCleared,
    comboTier,
    comboLabelOpacity,
    bgPulse,
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
    gateAngle,
    angle,
    ballX,
    ballY,
    fadingRingOpacity,
    currentPaletteIndex,
    nextPaletteIndex,
    currentHasLife,
    nextHasLife,
    currentHasAutoPlay,
    currentHasShield,
    autoPlayInInventory,
    autoPlayActive,
    autoPlayTimeLeft,
    shieldAvailable,
    shieldArmed,
    shieldChargesLeft,
    scorePopupText,
    scorePopupOpacity,
    scorePopupX,
    scorePopupY,
    getRandomPaletteIndex,
    CENTER_X,
    CENTER_Y,
    RING_RADIUS,
    START_ORBIT_SPEED,
    START_GATE_WIDTH,
  } = params;

  alive.value = true;
  lives.value = LIVES_MAX;
  score.value = 0;
  speed.value = START_ORBIT_SPEED;
  gateWidth.value = START_GATE_WIDTH;
  mode.value = 'orbit';
  isPaused.value = false;

  streak.value = 0;
  combo.value = 0;
  ringsCleared.value = 0;
  comboTier.value = 0;
  comboLabelOpacity.value = 0;
  bgPulse.value = 0;

  currentHasLife.value = false;
  nextHasLife.value = false;
  currentHasAutoPlay.value = false;
  currentHasShield.value = false;

  autoPlayInInventory.value = false;
  autoPlayActive.value = false;
  autoPlayTimeLeft.value = 0;

  shieldAvailable.value = false;
  shieldArmed.value = false;
  shieldChargesLeft.value = 0;

  scorePopupText.value = '';
  scorePopupOpacity.value = 0;
  scorePopupX.value = CENTER_X;
  scorePopupY.value = CENTER_Y;

  currentX.value = CENTER_X;
  currentY.value = CENTER_Y;
  currentR.value = RING_RADIUS;

  currentVX.value = 0;
  currentVY.value = 0;
  nextVX.value = 0;
  nextVY.value = 0;

  nextX.value = CENTER_X;
  nextY.value = CENTER_Y - 200;
  nextR.value = RING_RADIUS * 0.9;

  gateAngle.value = Math.atan2(nextY.value - currentY.value, nextX.value - currentX.value);
  angle.value = 0;
  ballX.value = currentX.value + currentR.value;
  ballY.value = currentY.value;

  fadingRingOpacity.value = 0;

  currentPaletteIndex.value = getRandomPaletteIndex();
  nextPaletteIndex.value = getRandomPaletteIndex(currentPaletteIndex.value);
};
