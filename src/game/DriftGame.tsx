// src/game/DriftGame.tsx
// ORCHESTRATEUR - TOUT EN SKIA - 0 RE-RENDER CANVAS

import React from 'react';
import { Pressable, StatusBar, StyleSheet } from 'react-native';
import { Canvas, Circle, Path, Text, matchFont } from '@shopify/react-native-skia';
import { useDerivedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { NeonRing } from '../components/NeonRing';
import { createArcPath } from '../utils/path';
import { validateTap } from './logic/collisionDetection';
import { loseLife, restart } from './logic/gameLifecycle';
import { useGameState } from './hooks/useGameState';
import { usePalettes } from './hooks/usePalettes';
import { useGameLoop } from './hooks/useGameLoop';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LIVES_MAX, START_ORBIT_SPEED, START_GATE_WIDTH } from '../constants/gameplay';
import { BALL_COLOR } from '../constants/colors';
import { Platform } from 'react-native';

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });
const fontStyle = {
  fontFamily,
  fontSize: 48,
  fontWeight: 'bold' as const,
};
const font = matchFont(fontStyle);

const fontStyleSmall = {
  fontFamily,
  fontSize: 20,
};
const fontSmall = matchFont(fontStyleSmall);

const DriftGame: React.FC = () => {
  const gameState = useGameState();
  const palettes = usePalettes();

  const [aliveUI, setAliveUI] = React.useState(true);
  const [scoreUI, setScoreUI] = React.useState(0);
  const [livesUI, setLivesUI] = React.useState(LIVES_MAX);

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

  // Update UI sans re-render Canvas
  useAnimatedReaction(
    () => Math.round(gameState.score.value),
    (score) => {
      runOnJS(setScoreUI)(score);
    }
  );

  useAnimatedReaction(
    () => gameState.lives.value,
    (lives) => {
      runOnJS(setLivesUI)(lives);
    }
  );

  // LIVES POSITIONS (Skia circles)
  const livesPositions = React.useMemo(() => {
    const positions = [];
    const startX = CANVAS_WIDTH - 60;
    const y = 70;
    for (let i = 0; i < LIVES_MAX; i++) {
      positions.push({ x: startX - i * 22, y });
    }
    return positions;
  }, []);

  useGameLoop({
    ...gameState,
    ...palettes,
    setDisplayScoreUI: () => {},
    setLivesUI: () => {},
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
        setLivesUI: () => {},
        setDisplayScoreUI: () => {},
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
        streak: gameState.streak,
        combo: gameState.combo,
        setLivesUI: () => {},
        setAliveUI,
      });
    }
  };

  return (
    <Pressable style={styles.container} onPress={onTap}>
      <StatusBar hidden />

      <Canvas style={styles.canvas}>
        {/* FADING RING */}
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

        {/* CURRENT RING */}
        <NeonRing
          cx={gameState.currentX}
          cy={gameState.currentY}
          r={gameState.currentR}
          outerColor={useDerivedValue(() => palettes.currentPalette.value.outer)}
          midColor={useDerivedValue(() => palettes.currentPalette.value.mid)}
          mainColor={useDerivedValue(() => palettes.currentPalette.value.main)}
        />

        {/* NEXT RING */}
        <NeonRing
          cx={gameState.nextX}
          cy={gameState.nextY}
          r={gameState.nextR}
          outerColor={useDerivedValue(() => palettes.nextPalette.value.outer)}
          midColor={useDerivedValue(() => palettes.nextPalette.value.mid)}
          mainColor={useDerivedValue(() => palettes.nextPalette.value.main)}
        />

        {/* GATE */}
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

        {/* BALL */}
        <Circle cx={gameState.ballX} cy={gameState.ballY} r={10} color={BALL_COLOR} />

        {/* SCORE (Skia Text) */}
        <Text
          x={CANVAS_WIDTH / 2 - 30}
          y={80}
          text={scoreUI.toString()}
          color="white"
          font={font}
        />

        {/* LIVES (Skia Circles) */}
        {livesPositions.map((pos, i) => (
          <Circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={7}
            color={i < livesUI ? '#ef4444' : '#334155'}
          />
        ))}

        {/* GAME OVER TEXT (Skia) */}
        {!aliveUI && (
          <Text
            x={CANVAS_WIDTH / 2 - 80}
            y={120}
            text="Tap to restart"
            color="#94a3b8"
            font={fontSmall}
          />
        )}
      </Canvas>
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
});

export default DriftGame;