// src/game/DriftGame.tsx
// ORCHESTRATEUR SKIA - 0 RE-RENDER CANVAS
// Vie = orbe rouge sur le ring, récupérée UNIQUEMENT quand la bille passe dessus.

import React from 'react';
import { Pressable, StatusBar, StyleSheet, Platform } from 'react-native';
import { Canvas, Circle, Path, Text, matchFont } from '@shopify/react-native-skia';
import { useDerivedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { NeonRing } from '../components/NeonRing';
import { createArcPath } from '../utils/path';
import { validateTap } from './logic/collisionDetection';
import { loseLife, restart } from './logic/gameLifecycle';
import { useGameState } from './hooks/useGameState';
import { usePalettes } from './hooks/usePalettes';
import { useGameLoop } from './hooks/useGameLoop';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LIVES_MAX,
  START_ORBIT_SPEED,
  START_GATE_WIDTH,
} from '../constants/gameplay';
import { BALL_COLOR } from '../constants/colors';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;
const RING_RADIUS = CANVAS_WIDTH * 0.25;

// Orbe de vie posée SUR LE RING, en haut du cercle
const LIFE_ORB_ANGLE = -Math.PI / 2;
// Distance² max pour considérer une collision bille/orbe
const LIFE_ORB_COLLISION_DIST = 625;

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

  // ----- GATE -----
  const gateStart = useDerivedValue(
    () => gameState.gateAngle.value - gameState.gateWidth.value / 2
  );
  const gateEnd = useDerivedValue(
    () => gameState.gateAngle.value + gameState.gateWidth.value / 2
  );

  const gatePath = useDerivedValue(() =>
    createArcPath(
      gameState.currentX.value,
      gameState.currentY.value,
      gameState.currentR.value + 4,
      gateStart.value,
      gateEnd.value
    )
  );

  // ----- FADING RING -----
  const fadingRingScaledR = useDerivedValue(
    () => gameState.fadingRingR.value * gameState.fadingRingScale.value
  );

  // ----- ORBE DE VIE SUR LE RING COURANT -----
  const lifeOrbVisible = useDerivedValue(
    () => (gameState.currentHasLife.value ? 1 : 0)
  );

  const lifeOrbX = useDerivedValue(
    () =>
      gameState.currentX.value +
      gameState.currentR.value * Math.cos(LIFE_ORB_ANGLE)
  );
  const lifeOrbY = useDerivedValue(
    () =>
      gameState.currentY.value +
      gameState.currentR.value * Math.sin(LIFE_ORB_ANGLE)
  );

  // Collision bille/orbe → tout en Reanimated
  useAnimatedReaction(
    () => ({
      hasLife: gameState.currentHasLife.value,
      ballX: gameState.ballX.value,
      ballY: gameState.ballY.value,
      lives: gameState.lives.value,
    }),
    (state) => {
      if (!state.hasLife) return;
      if (state.lives >= LIVES_MAX) return;

      const cx = gameState.currentX.value;
      const cy = gameState.currentY.value;
      const r = gameState.currentR.value;

      const orbX = cx + r * Math.cos(LIFE_ORB_ANGLE);
      const orbY = cy + r * Math.sin(LIFE_ORB_ANGLE);

      const dx = state.ballX - orbX;
      const dy = state.ballY - orbY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= LIFE_ORB_COLLISION_DIST) {
        gameState.currentHasLife.value = false;
        gameState.lives.value = Math.min(LIVES_MAX, state.lives + 1);
      }
    }
  );

  // ----- UI score / vies sans re-render Canvas -----
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

  // LIVES POSITIONS (Skia circles en haut à droite)
  const livesPositions = React.useMemo(() => {
    const positions = [];
    const startX = CANVAS_WIDTH - 60;
    const y = 70;
    for (let i = 0; i < LIVES_MAX; i++) {
      positions.push({ x: startX - i * 22, y });
    }
    return positions;
  }, []);

  // ----- GAME LOOP (UI thread, pas de re-render Canvas) -----
  useGameLoop({
    ...gameState,
    ...palettes,
  });

  const onTap = () => {
    // Restart si mort
    if (!aliveUI) {
      restart({
        ...gameState,
        currentPaletteIndex: palettes.currentPaletteIndex,
        nextPaletteIndex: palettes.nextPaletteIndex,
        getRandomPaletteIndex: palettes.getRandomPaletteIndex,
        setAliveUI,
        setLivesUI,
        setDisplayScoreUI: () => {},
        CENTER_X,
        CENTER_Y,
        RING_RADIUS,
        START_ORBIT_SPEED,
        START_GATE_WIDTH,
      });
      return;
    }

    // Sinon on est en jeu : tap valide ou pas
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
        currentHasLife: gameState.currentHasLife,
        nextHasLife: gameState.nextHasLife,
        setLivesUI,
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

        {/* 🔴 ORBE DE VIE SUR LE RING COURANT */}
        <Circle
          cx={lifeOrbX}
          cy={lifeOrbY}
          r={8}
          color="#ef4444"
          opacity={lifeOrbVisible}
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

              {/* GATE (plus épaisse, bien lisible) */}
        {/* Halo léger */}
        <Path
          path={gatePath}
          strokeWidth={18}
          strokeCap="round"
          style="stroke"
          color={useDerivedValue(() => palettes.nextPalette.value.gate)}
          opacity={0.25}
        />
        {/* Cœur opaque qui recouvre bien le ring */}
        <Path
          path={gatePath}
          strokeWidth={8}
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
