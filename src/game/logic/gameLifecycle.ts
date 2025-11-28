// src/game/logic/gameLifecycle.ts
// Logique du cycle de vie du jeu (completeRing, loseLife, restart)

import { withTiming, runOnJS } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { generateNextRing } from './ringGenerator';
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

  // Scoring / streak
  streak: SharedValue<number>;
  combo: SharedValue<number>;
  lives: SharedValue<number>;

  // Vie sur ring
  currentHasLife: SharedValue<boolean>;
  nextHasLife: SharedValue<boolean>;

  // Auto-play bonus
  currentHasAutoPlay: SharedValue<boolean>;

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

    // Scoring / streak
    streak,
    combo,
    lives,

    // Vie sur ring
    currentHasLife,
    nextHasLife,

    // Auto-play bonus
    currentHasAutoPlay,

    // Divers
    isPerfect,
    RING_RADIUS,
  } = params;

  // 1) SCORE simple : +1 par ring, +1 si perfect
  let gained = 1;
  if (isPerfect) {
    gained += 1;
    combo.value = combo.value + 1;
  } else {
    combo.value = 0;
  }
  score.value = score.value + gained;

  // 2) Si le ring courant avait une orbe non prise → orbe ratée (juste supprimée)
  if (currentHasLife.value) {
    currentHasLife.value = false;
  }
  nextHasLife.value = false;

  // Auto-play orbe ratée aussi
  if (currentHasAutoPlay.value) {
    currentHasAutoPlay.value = false;
  }

  // 3) STREAK
  streak.value = streak.value + 1;

  // 4) PALETTES (jamais 2 rings de la même couleur)
  // current = next, next = random ≠ current
  currentPaletteIndex.value = nextPaletteIndex.value;
  const newIndex = getRandomPaletteIndex(currentPaletteIndex.value);
  nextPaletteIndex.value = newIndex;

  // 5) FADING RING = on fige l'ancien ring pour l'anim
  fadingRingX.value = currentX.value;
  fadingRingY.value = currentY.value;
  fadingRingR.value = currentR.value;
  fadingRingScale.value = 1;
  fadingRingOpacity.value = 1;

  fadingRingOpacity.value = withTiming(0, { duration: 400 });
  fadingRingScale.value = withTiming(1.25, { duration: 400 });

  // 6) CALCULER L'ANGLE D'ARRIVÉE (AVANT de modifier current!)
  angle.value = Math.atan2(ballY.value - nextY.value, ballX.value - nextX.value);

  // 7) TRANSITION : NEXT → CURRENT
  currentX.value = nextX.value;
  currentY.value = nextY.value;
  currentR.value = nextR.value;

  // 8) GÉNÉRATION DU NOUVEAU RING "NEXT"
  const next = generateNextRing(currentX.value, currentY.value, currentR.value, RING_RADIUS);
  nextX.value = next.x;
  nextY.value = next.y;
  nextR.value = next.r;

  // 9) SPEED / GATE
  speed.value = Math.min(speed.value + SPEED_INC_PER_RING, SPEED_CAP);
  gateWidth.value = Math.max(gateWidth.value - SHRINK_PER_RING, MIN_GATE_WIDTH);
  gateAngle.value = Math.atan2(nextY.value - currentY.value, nextX.value - currentX.value);

  // 10) PLACER LA BILLE SUR LE NOUVEAU RING (à l'angle d'arrivée)
  ballX.value = currentX.value + currentR.value * Math.cos(angle.value);
  ballY.value = currentY.value + currentR.value * Math.sin(angle.value);

  mode.value = 'orbit';
  dashStartTime.value = 0;

  // 11) SPAWN D'UNE ORBE DE VIE SUR LE NOUVEAU CURRENT RING
  if (
    streak.value >= STREAK_FOR_LIFE &&
    lives.value < LIVES_MAX &&
    !currentHasLife.value
  ) {
    streak.value = 0;
    currentHasLife.value = true;
  }

  // 12) SPAWN AUTO-PLAY (chance aléatoire)
  if (Math.random() < AUTOPLAY_SPAWN_CHANCE && !currentHasAutoPlay.value) {
    currentHasAutoPlay.value = true;
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
  setAliveUI: (alive: boolean) => void;
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
    setAliveUI,
  } = params;

  // Reset cycle
  streak.value = 0;
  combo.value = 0;
  currentHasLife.value = false;
  nextHasLife.value = false;
  currentHasAutoPlay.value = false;

  // VÉRIFIER si dernière vie
  if (lives.value === 1) {
    // C'était la dernière → Game Over
    lives.value = 0;
    alive.value = false;
    runOnJS(setAliveUI)(false);
  } else {
    // Il reste des vies
    lives.value = lives.value - 1;
  }
};

// Restart : reset complet
interface RestartParams {
  alive: SharedValue<boolean>;
  lives: SharedValue<number>;
  score: SharedValue<number>;
  displayScore: SharedValue<number>;
  speed: SharedValue<number>;
  gateWidth: SharedValue<number>;
  mode: SharedValue<'orbit' | 'dash'>;
  streak: SharedValue<number>;
  combo: SharedValue<number>;

  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  currentR: SharedValue<number>;
  nextX: SharedValue<number>;
  nextY: SharedValue<number>;
  nextR: SharedValue<number>;

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
  autoPlayInInventory: SharedValue<boolean>;
  autoPlayActive: SharedValue<boolean>;
  autoPlayTimeLeft: SharedValue<number>;
  getRandomPaletteIndex: (exclude?: number) => number;

  setAliveUI: (alive: boolean) => void;
  setDisplayScoreUI: (score: number) => void;

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
    displayScore,
    speed,
    gateWidth,
    mode,
    streak,
    combo,
    currentX,
    currentY,
    currentR,
    nextX,
    nextY,
    nextR,
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
    autoPlayInInventory,
    autoPlayActive,
    autoPlayTimeLeft,
    getRandomPaletteIndex,
    setAliveUI,
    setDisplayScoreUI,
    CENTER_X,
    CENTER_Y,
    RING_RADIUS,
    START_ORBIT_SPEED,
    START_GATE_WIDTH,
  } = params;

  alive.value = true;
  lives.value = LIVES_MAX;
  score.value = 0;
  displayScore.value = 0;

  speed.value = START_ORBIT_SPEED;
  gateWidth.value = START_GATE_WIDTH;
  mode.value = 'orbit';

  streak.value = 0;
  combo.value = 0;
  currentHasLife.value = false;
  nextHasLife.value = false;

  currentHasAutoPlay.value = false;
  autoPlayInInventory.value = false;
  autoPlayActive.value = false;
  autoPlayTimeLeft.value = 0;

  currentX.value = CENTER_X;
  currentY.value = CENTER_Y;
  currentR.value = RING_RADIUS;

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

  runOnJS(setAliveUI)(true);
  runOnJS(setDisplayScoreUI)(0);
};