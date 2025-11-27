// src/game/hooks/useGameState.ts
// Centralise tous les SharedValues du game state

import { useSharedValue } from 'react-native-reanimated';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  START_ORBIT_SPEED,
  START_GATE_WIDTH,
  LIVES_MAX,
} from '../../constants/gameplay';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;
const RING_RADIUS = CANVAS_WIDTH * 0.25;

export const useGameState = () => {
  // Game state
  const alive = useSharedValue(true);
  const lives = useSharedValue(LIVES_MAX);
  const score = useSharedValue(0);
  const displayScore = useSharedValue(0);
  const mode = useSharedValue<'orbit' | 'dash'>('orbit');

  // Positions - Current ring
  const currentX = useSharedValue(CENTER_X);
  const currentY = useSharedValue(CENTER_Y);
  const currentR = useSharedValue(RING_RADIUS);

  // Positions - Next ring
  const nextX = useSharedValue(CENTER_X);
  const nextY = useSharedValue(CENTER_Y - 200);
  const nextR = useSharedValue(RING_RADIUS * 0.9);

  // Ball
  const angle = useSharedValue(0);
  const speed = useSharedValue(START_ORBIT_SPEED);
  const ballX = useSharedValue(currentX.value + currentR.value);
  const ballY = useSharedValue(currentY.value);

  // Gate
  const gateAngle = useSharedValue(
    Math.atan2(nextY.value - currentY.value, nextX.value - currentX.value)
  );
  const gateWidth = useSharedValue(START_GATE_WIDTH);
  const dashStartTime = useSharedValue(0);

  // Fading ring animation
  const fadingRingX = useSharedValue(0);
  const fadingRingY = useSharedValue(0);
  const fadingRingR = useSharedValue(0);
  const fadingRingScale = useSharedValue(0);
  const fadingRingOpacity = useSharedValue(0);

  return {
    // Game state
    alive,
    lives,
    score,
    displayScore,
    mode,

    // Current ring
    currentX,
    currentY,
    currentR,

    // Next ring
    nextX,
    nextY,
    nextR,

    // Ball
    angle,
    speed,
    ballX,
    ballY,

    // Gate
    gateAngle,
    gateWidth,
    dashStartTime,

    // Fading ring
    fadingRingX,
    fadingRingY,
    fadingRingR,
    fadingRingScale,
    fadingRingOpacity,

    // Constants
    CENTER_X,
    CENTER_Y,
    RING_RADIUS,
  };
};