// src/game/logic/gameLifecycle.ts
// Logique du cycle de vie du jeu (completeRing, loseLife, restart)

import { withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { generateNextRing } from './ringGenerator';
import {
  SPEED_INC_PER_RING,
  SPEED_CAP,
  MIN_GATE_WIDTH,
  SHRINK_PER_RING,
  STREAK_FOR_LIFE,
  LIVES_MAX,
} from '../../constants/gameplay';

interface CompleteRingParams {
  currentPaletteIndex: SharedValue<number>;
  nextPaletteIndex: SharedValue<number>;
  fadingRingPaletteIndex: SharedValue<number>;
  getRandomPaletteIndex: (exclude?: number) => number;
  fadingRingX: SharedValue<number>;
  fadingRingY: SharedValue<number>;
  fadingRingR: SharedValue<number>;
  fadingRingScale: SharedValue<number>;
  fadingRingOpacity: SharedValue<number>;
  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  currentR: SharedValue<number>;
  nextX: SharedValue<number>;
  nextY: SharedValue<number>;
  nextR: SharedValue<number>;
  score: SharedValue<number>;
  speed: SharedValue<number>;
  gateAngle: SharedValue<number>;
  gateWidth: SharedValue<number>;
  angle: SharedValue<number>;
  mode: SharedValue<'orbit' | 'dash'>;
  dashStartTime: SharedValue<number>;
  streak: SharedValue<number>;
  combo: SharedValue<number>;
  lives: SharedValue<number>;
  isPerfect: boolean;
  RING_RADIUS: number;
}

export const completeRing = (params: CompleteRingParams) => {
  'worklet';

  const {
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
    isPerfect,
    RING_RADIUS,
  } = params;

  fadingRingPaletteIndex.value = currentPaletteIndex.value;
  fadingRingX.value = currentX.value;
  fadingRingY.value = currentY.value;
  fadingRingR.value = currentR.value;
  fadingRingScale.value = 1;
  fadingRingOpacity.value = 1;

  fadingRingScale.value = withTiming(1.5, { duration: 400 });
  fadingRingOpacity.value = withTiming(0, { duration: 400 });

  currentX.value = nextX.value;
  currentY.value = nextY.value;
  currentR.value = nextR.value;
  currentPaletteIndex.value = nextPaletteIndex.value;

  const newRing = generateNextRing(currentX.value, currentY.value, currentR.value, RING_RADIUS);
  nextX.value = newRing.x;
  nextY.value = newRing.y;
  nextR.value = newRing.r;

  nextPaletteIndex.value = getRandomPaletteIndex(currentPaletteIndex.value);

  // COMBO LOGIC (pour plus tard)
  if (isPerfect) {
    combo.value = Math.min(3, combo.value + 1);
  } else {
    combo.value = 1;
  }

  // SCORING - +1 par défaut
  score.value = score.value + 1;

  // STREAK LOGIC
  streak.value = streak.value + 1;
  if (streak.value >= STREAK_FOR_LIFE) {
    if (lives.value < LIVES_MAX) {
      lives.value = lives.value + 1;
    }
    streak.value = 0;
  }

  speed.value = Math.min(SPEED_CAP, speed.value + SPEED_INC_PER_RING);
  gateAngle.value = Math.atan2(nextY.value - currentY.value, nextX.value - currentX.value);
  gateWidth.value = Math.max(MIN_GATE_WIDTH, gateWidth.value - SHRINK_PER_RING);

  angle.value = gateAngle.value + Math.PI;
  mode.value = 'orbit';
  dashStartTime.value = 0;
};

interface LoseLifeParams {
  lives: SharedValue<number>;
  alive: SharedValue<boolean>;
  streak: SharedValue<number>;
  combo: SharedValue<number>;
  setLivesUI: (lives: number) => void;
  setAliveUI: (alive: boolean) => void;
}

export const loseLife = (params: LoseLifeParams) => {
  'worklet';

  const { lives, alive, streak, combo, setLivesUI, setAliveUI } = params;

  lives.value = lives.value - 1;
  streak.value = 0;
  combo.value = 1;
  setLivesUI(lives.value);

  if (lives.value <= 0) {
    alive.value = false;
    setAliveUI(false);
  }
};

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
  getRandomPaletteIndex: (exclude?: number) => number;
  setAliveUI: (alive: boolean) => void;
  setLivesUI: (lives: number) => void;
  setDisplayScoreUI: (score: number) => void;
  CENTER_X: number;
  CENTER_Y: number;
  RING_RADIUS: number;
  START_ORBIT_SPEED: number;
  START_GATE_WIDTH: number;
  LIVES_MAX: number;
}

export const restart = (params: RestartParams) => {
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
    getRandomPaletteIndex,
    setAliveUI,
    setLivesUI,
    setDisplayScoreUI,
    CENTER_X,
    CENTER_Y,
    RING_RADIUS,
    START_ORBIT_SPEED,
    START_GATE_WIDTH,
    LIVES_MAX,
  } = params;

  alive.value = true;
  lives.value = LIVES_MAX;
  score.value = 0;
  displayScore.value = 0;
  speed.value = START_ORBIT_SPEED;
  gateWidth.value = START_GATE_WIDTH;
  mode.value = 'orbit';
  streak.value = 0;
  combo.value = 1;

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

  setAliveUI(true);
  setLivesUI(LIVES_MAX);
  setDisplayScoreUI(0);
};