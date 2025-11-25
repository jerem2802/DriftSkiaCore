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
import { getRandomPalette } from '../constants/colors';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
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
  RING_GENERATION_MARGIN,
} from '../constants/gameplay';
import { BALL_COLOR } from '../constants/colors';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;
const RING_RADIUS = CANVAS_WIDTH * 0.25;

const DriftGame: React.FC = () => {
  const alive = useSharedValue(true);
  const lives = useSharedValue(LIVES_MAX);
  const score = useSharedValue(0);
  const displayScore = useSharedValue(0);
  const mode = useSharedValue<'orbit' | 'dash'>('orbit');

  const currentX = useSharedValue(CENTER_X);
  const currentY = useSharedValue(CENTER_Y);
  const currentR = useSharedValue(RING_RADIUS);

  const nextX = useSharedValue(CENTER_X);
  const nextY = useSharedValue(CENTER_Y - 200);
  const nextR = useSharedValue(RING_RADIUS * 0.9);

  const angle = useSharedValue(0);
  const speed = useSharedValue(START_ORBIT_SPEED);
  const ballX = useSharedValue(currentX.value + currentR.value);
  const ballY = useSharedValue(currentY.value);

  const gateAngle = useSharedValue(
    Math.atan2(nextY.value - currentY.value, nextX.value - currentX.value)
  );
  const gateWidth = useSharedValue(START_GATE_WIDTH);

  const dashStartTime = useSharedValue(0);

  const [currentPalette, setCurrentPalette] = React.useState(getRandomPalette());
  const [nextPalette, setNextPalette] = React.useState(getRandomPalette());

  const [displayScoreUI, setDisplayScoreUI] = React.useState(0);
  const [livesUI, setLivesUI] = React.useState(LIVES_MAX);
  const [aliveUI, setAliveUI] = React.useState(true);

  const gateStart = useDerivedValue(() => gateAngle.value - gateWidth.value / 2);
  const gateEnd = useDerivedValue(() => gateAngle.value + gateWidth.value / 2);

  const gatePath = useDerivedValue(() =>
    createArcPath(currentX.value, currentY.value, currentR.value, gateStart.value, gateEnd.value)
  );

  const loseLife = () => {
    'worklet';
    lives.value = lives.value - 1;
    runOnJS(setLivesUI)(lives.value);

    if (lives.value <= 0) {
      alive.value = false;
      runOnJS(setAliveUI)(false);
    }
  };

  const updatePalettes = () => {
  const newCurrent = nextPalette;
  setCurrentPalette(newCurrent);
  
  // Génère un next différent du nouveau current
  let newNext = getRandomPalette();
  let attempts = 0;
  while (newNext.main === newCurrent.main && attempts < 10) {
    newNext = getRandomPalette();
    attempts++;
  }
  setNextPalette(newNext);
};

  const completeRing = () => {
    'worklet';

    currentX.value = nextX.value;
    currentY.value = nextY.value;
    currentR.value = nextR.value;

    const m = RING_GENERATION_MARGIN;
    const maxRadius = RING_RADIUS * 1.2;
    nextX.value = m + maxRadius + Math.random() * (CANVAS_WIDTH - 2 * (m + maxRadius));
    nextY.value = m + maxRadius + Math.random() * (CANVAS_HEIGHT - 2 * (m + maxRadius));
    nextR.value = RING_RADIUS * (0.8 + Math.random() * 0.4);

    score.value = score.value + 1;
    speed.value = Math.min(SPEED_CAP, speed.value + SPEED_INC_PER_RING);

    gateAngle.value = Math.atan2(nextY.value - currentY.value, nextX.value - currentX.value);
    gateWidth.value = Math.max(MIN_GATE_WIDTH, gateWidth.value - SHRINK_PER_RING);

    angle.value = gateAngle.value + Math.PI;
    mode.value = 'orbit';
    dashStartTime.value = 0;

    runOnJS(updatePalettes)();
  };

  const onTap = () => {
    if (!aliveUI) {
      alive.value = true;
      lives.value = LIVES_MAX;
      score.value = 0;
      displayScore.value = 0;
      speed.value = START_ORBIT_SPEED;
      gateWidth.value = START_GATE_WIDTH;
      mode.value = 'orbit';

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

      setAliveUI(true);
      setLivesUI(LIVES_MAX);
      setDisplayScoreUI(0);
      setCurrentPalette(getRandomPalette());
      setNextPalette(getRandomPalette());
      return;
    }

    if (mode.value !== 'orbit') {
      return;
    }

    const half = gateWidth.value / 2;
    const gA = normalizeAngle(gateAngle.value);
    const bA = normalizeAngle(angle.value);
    let delta = Math.abs(gA - bA);
    if (delta > Math.PI) {
      delta = 2 * Math.PI - delta;
    }

    if (delta <= half + 0.2) {
      mode.value = 'dash';
      dashStartTime.value = Date.now();
    } else if (delta > half + MISS_MARGIN) {
      loseLife();
    }
  };

  useFrameCallback((frameInfo) => {
    'worklet';
    if (!alive.value) {
      return;
    }

    const dt = frameInfo.timeSincePreviousFrame ? frameInfo.timeSincePreviousFrame / 1000 : 0.016;
    const now = Date.now();

    const scoreDiff = score.value - displayScore.value;
    if (Math.abs(scoreDiff) > 0.5) {
      displayScore.value = displayScore.value + scoreDiff * 0.15;
      runOnJS(setDisplayScoreUI)(Math.round(displayScore.value));
    }

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
        completeRing();
      }

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
        <NeonRing
          cx={currentX}
          cy={currentY}
          r={currentR}
          outerColor={currentPalette.outer}
          midColor={currentPalette.mid}
          mainColor={currentPalette.main}
        />

        <NeonRing
          cx={nextX}
          cy={nextY}
          r={nextR}
          outerColor={nextPalette.outer}
          midColor={nextPalette.mid}
          mainColor={nextPalette.main}
        />

        <Path
          path={gatePath}
          strokeWidth={12}
          strokeCap="round"
          style="stroke"
          color={nextPalette.gate}
          opacity={0.2}
        />
        <Path
          path={gatePath}
          strokeWidth={3}
          strokeCap="round"
          style="stroke"
          color={nextPalette.gate}
        />

        <Circle cx={ballX} cy={ballY} r={10} color={BALL_COLOR} />
      </Canvas>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{displayScoreUI}</Text>
        {!aliveUI && <Text style={styles.retryText}>Tap to restart</Text>}
      </View>

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