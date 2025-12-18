// src/game/hooks/useGameState.ts
import { useSharedValue } from 'react-native-reanimated';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  START_ORBIT_SPEED,
  START_GATE_WIDTH,
  LIVES_MAX,
  RING_RADIUS,
} from '../../constants/gameplay';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;

// ✅ Pré-calculer les valeurs initiales
const INITIAL_BALL_X = CENTER_X + RING_RADIUS;
const INITIAL_BALL_Y = CENTER_Y;
const INITIAL_NEXT_X = CENTER_X;
const INITIAL_NEXT_Y = CENTER_Y - 200;
const INITIAL_NEXT_R = RING_RADIUS * 0.9;
const INITIAL_GATE_ANGLE = Math.atan2(
  INITIAL_NEXT_Y - CENTER_Y,
  INITIAL_NEXT_X - CENTER_X
);

export const useGameState = () => {
  // Game state
  const alive = useSharedValue(true);
  const lives = useSharedValue(LIVES_MAX);
  const score = useSharedValue(0);

  // Coins (run)
  const coins = useSharedValue(0);
  const coinHudPulse = useSharedValue(0);

  const mode = useSharedValue<'orbit' | 'dash'>('orbit');
  const isPaused = useSharedValue(true); // ✅ COMMENCE EN PAUSE

  // Scoring avancé
  const streak = useSharedValue(0);
  const combo = useSharedValue(0);
  const ringsCleared = useSharedValue(0);

  // Combo tier / label (UI)
  const comboTier = useSharedValue(0);
  const comboLabelOpacity = useSharedValue(0);

  // Pulse BG (effets visuels globaux)
  const bgPulse = useSharedValue(0);

  // Vie pickup
  const currentHasLife = useSharedValue(false);
  const nextHasLife = useSharedValue(false);

  // Auto-play bonus
  const currentHasAutoPlay = useSharedValue(false);
  const autoPlayInInventory = useSharedValue(false);
  const autoPlayActive = useSharedValue(false);
  const autoPlayTimeLeft = useSharedValue(0);

  // Shield / Safe Miss
  const currentHasShield = useSharedValue(false);
  const shieldAvailable = useSharedValue(false);
  const shieldArmed = useSharedValue(false);
  const shieldChargesLeft = useSharedValue(0);

  // Coin orb pickup
  const currentHasCoin = useSharedValue(false);

  // Positions - Current ring
  const currentX = useSharedValue(CENTER_X);
  const currentY = useSharedValue(CENTER_Y);
  const currentR = useSharedValue(RING_RADIUS);

  // Vitesse - Current ring
  const currentVX = useSharedValue(0);
  const currentVY = useSharedValue(0);

  // Positions - Next ring
  const nextX = useSharedValue(INITIAL_NEXT_X);
  const nextY = useSharedValue(INITIAL_NEXT_Y);
  const nextR = useSharedValue(INITIAL_NEXT_R);

  // Vitesse - Next ring
  const nextVX = useSharedValue(0);
  const nextVY = useSharedValue(0);

  // Ball
  const angle = useSharedValue(0);
  const speed = useSharedValue(START_ORBIT_SPEED);
  const ballX = useSharedValue(INITIAL_BALL_X);
  const ballY = useSharedValue(INITIAL_BALL_Y);

  // Gate
  const gateAngle = useSharedValue(INITIAL_GATE_ANGLE);
  const gateWidth = useSharedValue(START_GATE_WIDTH);
  const dashStartTime = useSharedValue(0);

  // Fading ring animation
  const fadingRingX = useSharedValue(0);
  const fadingRingY = useSharedValue(0);
  const fadingRingR = useSharedValue(0);
  const fadingRingScale = useSharedValue(0);
  const fadingRingOpacity = useSharedValue(0);

  // Popup de score
  const scorePopupText = useSharedValue('');
  const scorePopupOpacity = useSharedValue(0);
  const scorePopupX = useSharedValue(CENTER_X);
  const scorePopupY = useSharedValue(CENTER_Y);

  return {
    alive,
    lives,
    score,

    coins,
    coinHudPulse,

    mode,
    isPaused,

    streak,
    combo,
    ringsCleared,
    comboTier,
    comboLabelOpacity,
    bgPulse,

    currentHasLife,
    nextHasLife,

    currentHasAutoPlay,
    autoPlayInInventory,
    autoPlayActive,
    autoPlayTimeLeft,

    currentHasShield,
    shieldAvailable,
    shieldArmed,
    shieldChargesLeft,

    currentHasCoin,

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

    angle,
    speed,
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

    scorePopupText,
    scorePopupOpacity,
    scorePopupX,
    scorePopupY,

    CENTER_X,
    CENTER_Y,
    RING_RADIUS,
  };
};

export type GameState = ReturnType<typeof useGameState>;