// src/game/DriftGame.tsx

import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Canvas, Circle, Path } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  runOnJS,
  useFrameCallback,
} from 'react-native-reanimated';
import { NeonRing } from '../components/NeonRing';
import { createArcPath } from '../utils/path';
import { normalizeAngle, insideRing } from '../utils/math';
import { RING_PALETTES } from '../constants/colors';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  RING_RADIUS,
  BALL_RADIUS,
  START_ORBIT_SPEED,
  SPEED_INC_PER_RING,
  SPEED_CAP,
  DASH_SPEED,
  START_GATE_WIDTH,
  MIN_GATE_WIDTH,
  SHRINK_PER_RING,
  MISS_MARGIN,
  LIVES_MAX,
  DASH_TIMEOUT,
  CENTER_Y_CURRENT,
  CENTER_Y_NEXT,
  RING_GENERATION_MARGIN,
} from '../constants/gameplay';
import { BALL_COLOR } from '../constants/colors';

const CENTER_X = CANVAS_WIDTH * 0.5;

const DriftGame: React.FC = () => {
  // Game state (SharedValues)
  const alive = useSharedValue(true);
  const lives = useSharedValue(LIVES_MAX);
  const score = useSharedValue(0);
  const displayScore = useSharedValue(0);
  const mode = useSharedValue<'orbit' | 'dash'>('orbit');

  // Ring positions
  const currentX = useSharedValue(CENTER_X);
  const currentY = useSharedValue(CENTER_Y_CURRENT);
  const currentR = useSharedValue(RING_RADIUS);

  const nextX = useSharedValue(CENTER_X);
  const nextY = useSharedValue(CENTER_Y_NEXT);
  const nextR = useSharedValue(RING_RADIUS * 0.9);

  // Ball state
  const angle = useSharedValue(0);
  const speed = useSharedValue(START_ORBIT_SPEED);
  const ballX = useSharedValue(currentX.value + currentR.value);
  const ballY = useSharedValue(currentY.value);

  // Gate
  const gateAngle = useSharedValue(Math.atan2(CENTER_Y_NEXT - CENTER_Y_CURRENT, 0));
  const gateWidth = useSharedValue(START_GATE_WIDTH);

  // Dash
  const dashStartTime = useSharedValue(0);

  // UI state (React state)
  const [displayScoreUI, setDisplayScoreUI] = React.useState(0);
  const [livesUI, setLivesUI] = React.useState(LIVES_MAX);
  const [aliveUI, setAliveUI] = React.useState(true);

  // Gate path
  const rArc = useDerivedValue(() => currentR.value + 25);
  const gateStart = useDerivedValue(() => gateAngle.value - gateWidth.value / 2);
  const gateEnd = useDerivedValue(() => gateAngle.value + gateWidth.value / 2);

  const gatePath = useDerivedValue(() =>
    createArcPath(currentX.value, currentY.value, rArc.value, gateStart.value, gateEnd.value)
  );

  // Lose life
  const loseLife = () => {
    'worklet';
    lives.value = lives.value - 1;
    runOnJS(setLivesUI)(lives.value);

    if (lives.value <= 0) {
      alive.value = false;
      runOnJS(setAliveUI)(false);
    }
  };

  // Ring completion
  const completeRing = () => {
    'worklet';
    currentX.value = nextX.value;
    currentY.value = nextY.value;
    currentR.value = nextR.value;

    const m = RING_GENERATION_MARGIN;
    nextX.value = m + Math.random() * (CANVAS_WIDTH - 2 * m);
    nextY.value = m + 100 + Math.random() * (CANVAS_HEIGHT - 2 * m - 250);
    nextR.value = RING_RADIUS * (0.85 + Math.random() * 0.3);

    score.value = score.value + 1;
    speed.value = Math.min(SPEED_CAP, speed.value + SPEED_INC_PER_RING);

    gateAngle.value = Math.atan2(nextY.value - currentY.value, nextX.value - currentX.value);
    gateWidth.value = Math.max(MIN_GATE_WIDTH, gateWidth.value - SHRINK_PER_RING);

    angle.value = gateAngle.value + Math.PI;
    mode.value = 'orbit';
    dashStartTime.value = 0;
  };

  // Tap handler
  const onTap = () => {
    if (!aliveUI) {
      // Reset game
      alive.value = true;
      lives.value = LIVES_MAX;
      score.value = 0;
      displayScore.value = 0;
      speed.value = START_ORBIT_SPEED;
      gateWidth.value = START_GATE_WIDTH;
      mode.value = 'orbit';

      currentX.value = CENTER_X;
      currentY.value = CENTER_Y_CURRENT;
      currentR.value = RING_RADIUS;
      nextX.value = CENTER_X;
      nextY.value = CENTER_Y_NEXT;
      nextR.value = RING_RADIUS * 0.9;

      gateAngle.value = Math.atan2(CENTER_Y_NEXT - CENTER_Y_CURRENT, 0);
      angle.value = 0;
      ballX.value = currentX.value + currentR.value;
      ballY.value = currentY.value;

      setAliveUI(true);
      setLivesUI(LIVES_MAX);
      setDisplayScoreUI(0);
      return;
    }

    if (mode.value !== 'orbit') return;

    const half = gateWidth.value / 2;
    const gA = normalizeAngle(gateAngle.value);
    const bA = normalizeAngle(angle.value);
    let delta = Math.abs(gA - bA);
    if (delta > Math.PI) delta = 2 * Math.PI - delta;

    if (delta <= half + 0.2) {
      mode.value = 'dash';
      dashStartTime.value = Date.now();
    } else if (delta > half + MISS_MARGIN) {
      loseLife();
    }
  };

  // Game loop (UI thread)
  useFrameCallback((frameInfo) => {
    'worklet';
    if (!alive.value) return;

    const dt = frameInfo.timeSincePreviousFrame
      ? frameInfo.timeSincePreviousFrame / 1000
      : 0.016;
    const now = Date.now();

    // Smooth score display
    const scoreDiff = score.value - displayScore.value;
    if (Math.abs(scoreDiff) > 0.5) {
      displayScore.value = displayScore.value + scoreDiff * 0.15;
      runOnJS(setDisplayScoreUI)(Math.round(displayScore.value));
    }

    if (mode.value === 'orbit') {
      // Orbit mode
      angle.value = angle.value + speed.value * dt;
      ballX.value = currentX.value + currentR.value * Math.cos(angle.value);
      ballY.value = currentY.value + currentR.value * Math.sin(angle.value);
    } else if (mode.value === 'dash') {
      // Dash mode
      const dx = nextX.value - ballX.value;
      const dy = nextY.value - ballY.value;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        ballX.value = ballX.value + (dx / dist) * DASH_SPEED * dt;
        ballY.value = ballY.value + (dy / dist) * DASH_SPEED * dt;
      }

      // Check if inside next ring
      if (insideRing(ballX.value, ballY.value, nextX.value, nextY.value, nextR.value)) {
        completeRing();
      }

      // Dash timeout
      if (dashStartTime.value > 0 && now - dashStartTime.value > DASH_TIMEOUT) {
        loseLife();
        mode.value = 'orbit';
        dashStartTime.value = 0;
      }
    }
  }, true);

  return (
    <Pressable style={styles.container} onPress={onTap}>
      <StatusBar hidden />

      <Canvas style={styles.canvas}>
        {/* Current ring */}
        <NeonRing
          cx={currentX}
          cy={currentY}
          r={currentR}
          outerColor="#06b6d4"
          midColor="#0891b2"
          mainColor="#0e7490"
        />

        {/* Next ring */}
        <NeonRing
          cx={nextX}
          cy={nextY}
          r={nextR}
          outerColor="#f59e0b"
          midColor="#d97706"
          mainColor="#b45309"
        />

        {/* Gate */}
        <Path
          path={gatePath}
          strokeWidth={12}
          strokeCap="round"
          style="stroke"
          color="#22d3ee"
          opacity={0.2}
        />
        <Path
          path={gatePath}
          strokeWidth={3}
          strokeCap="round"
          style="stroke"
          color="#22d3ee"
        />

        {/* Ball */}
        <Circle cx={ballX} cy={ballY} r={BALL_RADIUS} color={BALL_COLOR} />
      </Canvas>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{displayScoreUI}</Text>
        {!aliveUI && <Text style={styles.retryText}>Tap to restart</Text>}
      </View>

      {/* Lives */}
      <View style={styles.livesContainer}>
        {Array.from({ length: LIVES_MAX }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.lifeDot,
              {
                backgroundColor: i < livesUI ? '#ef4444' : '#334155',
                marginLeft: i === 0 ? 0 : 8,
              },
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  scoreContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
  },
  retryText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 20,
  },
  livesContainer: {
    position: 'absolute',
    top: 60,
    right: 18,
    flexDirection: 'row',
  },
  lifeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});

export default DriftGame;