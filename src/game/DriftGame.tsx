// src/game/DriftGame.tsx
// ORCHESTRATEUR - Architecture propre et modulaire

import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Canvas, Circle, Path } from '@shopify/react-native-skia';
import { runOnJS, useDerivedValue } from 'react-native-reanimated';
import { NeonRing } from '../components/NeonRing';
import { createArcPath } from '../utils/path';
import { validateTap } from './logic/collisionDetection';
import { loseLife, restart } from './logic/gameLifecycle';
import { useGameState } from './hooks/useGameState';
import { usePalettes } from './hooks/usePalettes';
import { useGameLoop } from './hooks/useGameLoop';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LIVES_MAX, START_ORBIT_SPEED, START_GATE_WIDTH } from '../constants/gameplay';
import { BALL_COLOR } from '../constants/colors';

const DriftGame: React.FC = () => {
  const gameState = useGameState();
  const palettes = usePalettes();

  const [displayScoreUI, setDisplayScoreUI] = React.useState(0);
  const [livesUI, setLivesUI] = React.useState(LIVES_MAX);
  const [aliveUI, setAliveUI] = React.useState(true);

  const gateStart = useDerivedValue(() => gameState.gateAngle.value - gameState.gateWidth.value / 2);
  const gateEnd = useDerivedValue(() => gameState.gateAngle.value + gameState.gateWidth.value / 2);

  const gatePath = useDerivedValue(() =>
    createArcPath(
      gameState.currentX.value,
      gameState.currentY.value,
      gameState.currentR.value,
      gateStart.value,
      gateEnd.value
    )
  );

  const fadingRingScaledR = useDerivedValue(
    () => gameState.fadingRingR.value * gameState.fadingRingScale.value
  );

  useGameLoop({
    ...gameState,
    ...palettes,
    setDisplayScoreUI,
    setLivesUI,
    setAliveUI,
  });

  const onTap = () => {
    if (!aliveUI) {
      restart({
        ...gameState,
        currentPaletteIndex: palettes.currentPaletteIndex,
        nextPaletteIndex: palettes.nextPaletteIndex,
        getRandomPaletteIndex: palettes.getRandomPaletteIndex,
        setAliveUI,
        setLivesUI,
        setDisplayScoreUI,
        START_ORBIT_SPEED,
        START_GATE_WIDTH,
        LIVES_MAX,
      });
      return;
    }

    if (gameState.mode.value !== 'orbit') {
      return;
    }

    const tapResult = validateTap(
      gameState.angle.value,
      gameState.gateAngle.value,
      gameState.gateWidth.value
    );

    if (tapResult === 'hit') {
      gameState.mode.value = 'dash';
      gameState.dashStartTime.value = Date.now();
    } else if (tapResult === 'miss') {
      loseLife({
        lives: gameState.lives,
        alive: gameState.alive,
        setLivesUI: (l) => runOnJS(setLivesUI)(l),
        setAliveUI: (a) => runOnJS(setAliveUI)(a),
      });
    }
  };

  return (
    <Pressable style={styles.container} onPress={onTap}>
      <StatusBar hidden />

      <Canvas style={styles.canvas}>
        <Circle
          cx={gameState.fadingRingX}
          cy={gameState.fadingRingY}
          r={fadingRingScaledR}
          strokeWidth={4}
          style="stroke"
          color={useDerivedValue(() => palettes.fadingPalette.value.outer)}
          opacity={useDerivedValue(() => gameState.fadingRingOpacity.value * 0.3)}
        />
        <Circle
          cx={gameState.fadingRingX}
          cy={gameState.fadingRingY}
          r={fadingRingScaledR}
          strokeWidth={3}
          style="stroke"
          color={useDerivedValue(() => palettes.fadingPalette.value.main)}
          opacity={gameState.fadingRingOpacity}
        />

        <NeonRing
          cx={gameState.currentX}
          cy={gameState.currentY}
          r={gameState.currentR}
          outerColor={useDerivedValue(() => palettes.currentPalette.value.outer)}
          midColor={useDerivedValue(() => palettes.currentPalette.value.mid)}
          mainColor={useDerivedValue(() => palettes.currentPalette.value.main)}
        />

        <NeonRing
          cx={gameState.nextX}
          cy={gameState.nextY}
          r={gameState.nextR}
          outerColor={useDerivedValue(() => palettes.nextPalette.value.outer)}
          midColor={useDerivedValue(() => palettes.nextPalette.value.mid)}
          mainColor={useDerivedValue(() => palettes.nextPalette.value.main)}
        />

        <Path
          path={gatePath}
          strokeWidth={12}
          strokeCap="round"
          style="stroke"
          color={useDerivedValue(() => palettes.nextPalette.value.gate)}
          opacity={0.2}
        />
        <Path
          path={gatePath}
          strokeWidth={3}
          strokeCap="round"
          style="stroke"
          color={useDerivedValue(() => palettes.nextPalette.value.gate)}
        />

        <Circle cx={gameState.ballX} cy={gameState.ballY} r={10} color={BALL_COLOR} />
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