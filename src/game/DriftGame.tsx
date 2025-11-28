// src/game/DriftGame.tsx
// ORCHESTRATEUR SKIA - 0 RE-RENDER CANVAS

import React from 'react';
import { Pressable, StatusBar, StyleSheet, Platform } from 'react-native';
import { Canvas, Circle, Path, Text, matchFont } from '@shopify/react-native-skia';
import { useDerivedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { NeonRing } from '../components/NeonRing';
import { BottomPanel } from '../components/BottomPanel';
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
  AUTO_PLAY_DURATION,
} from '../constants/gameplay';
import { BALL_COLOR } from '../constants/colors';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;
const RING_RADIUS = CANVAS_WIDTH * 0.25;

const LIFE_ORB_OFFSET = Math.PI;
const AUTOPLAY_ORB_OFFSET = Math.PI / 2;
const ORB_COLLISION_DIST = 625;

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
  const [autoPlayInInventoryUI, setAutoPlayInInventoryUI] = React.useState(false);

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
      gameState.currentR.value,
      gateStart.value,
      gateEnd.value
    )
  );

  // ----- FADING RING -----
  const fadingRingScaledR = useDerivedValue(
    () => gameState.fadingRingR.value * gameState.fadingRingScale.value
  );

  // ----- ORBE DE VIE (rouge, opposée à la gate) -----
  const lifeOrbVisible = useDerivedValue(
    () => (gameState.currentHasLife.value ? 1 : 0)
  );

  const lifeOrbAngle = useDerivedValue(
    () => gameState.gateAngle.value + LIFE_ORB_OFFSET
  );

  const lifeOrbX = useDerivedValue(
    () =>
      gameState.currentX.value +
      gameState.currentR.value * Math.cos(lifeOrbAngle.value)
  );
  const lifeOrbY = useDerivedValue(
    () =>
      gameState.currentY.value +
      gameState.currentR.value * Math.sin(lifeOrbAngle.value)
  );

  // ----- ORBE AUTO-PLAY (violette, 90° de la gate) -----
  const autoPlayOrbVisible = useDerivedValue(
    () => (gameState.currentHasAutoPlay.value ? 1 : 0)
  );

  const autoPlayOrbAngle = useDerivedValue(
    () => gameState.gateAngle.value + AUTOPLAY_ORB_OFFSET
  );

  const autoPlayOrbX = useDerivedValue(
    () =>
      gameState.currentX.value +
      gameState.currentR.value * Math.cos(autoPlayOrbAngle.value)
  );
  const autoPlayOrbY = useDerivedValue(
    () =>
      gameState.currentY.value +
      gameState.currentR.value * Math.sin(autoPlayOrbAngle.value)
  );

  // Collision bille/orbe vie
  useAnimatedReaction(
    () => ({
      hasLife: gameState.currentHasLife.value,
      ballX: gameState.ballX.value,
      ballY: gameState.ballY.value,
      lives: gameState.lives.value,
      gateAngle: gameState.gateAngle.value,
    }),
    (state) => {
      if (!state.hasLife) return;
      if (state.lives >= LIVES_MAX) return;

      const cx = gameState.currentX.value;
      const cy = gameState.currentY.value;
      const r = gameState.currentR.value;

      const orbAngle = state.gateAngle + LIFE_ORB_OFFSET;
      const orbX = cx + r * Math.cos(orbAngle);
      const orbY = cy + r * Math.sin(orbAngle);

      const dx = state.ballX - orbX;
      const dy = state.ballY - orbY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= ORB_COLLISION_DIST) {
        gameState.currentHasLife.value = false;
        gameState.lives.value = Math.min(LIVES_MAX, state.lives + 1);
      }
    }
  );

  // Collision bille/orbe auto-play
  useAnimatedReaction(
    () => ({
      hasAutoPlay: gameState.currentHasAutoPlay.value,
      ballX: gameState.ballX.value,
      ballY: gameState.ballY.value,
      gateAngle: gameState.gateAngle.value,
      inInventory: gameState.autoPlayInInventory.value,
    }),
    (state) => {
      if (!state.hasAutoPlay || state.inInventory) return;

      const cx = gameState.currentX.value;
      const cy = gameState.currentY.value;
      const r = gameState.currentR.value;

      const orbAngle = state.gateAngle + AUTOPLAY_ORB_OFFSET;
      const orbX = cx + r * Math.cos(orbAngle);
      const orbY = cy + r * Math.sin(orbAngle);

      const dx = state.ballX - orbX;
      const dy = state.ballY - orbY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= ORB_COLLISION_DIST) {
        gameState.currentHasAutoPlay.value = false;
        gameState.autoPlayInInventory.value = true;
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

  useAnimatedReaction(
    () => gameState.autoPlayInInventory.value,
    (inInventory) => {
      runOnJS(setAutoPlayInInventoryUI)(inInventory);
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

  const onActivateAutoPlay = () => {
    if (!gameState.autoPlayInInventory.value) return;
    gameState.autoPlayInInventory.value = false;
    gameState.autoPlayActive.value = true;
    gameState.autoPlayTimeLeft.value = AUTO_PLAY_DURATION;
  };

  const onTap = () => {
    // Restart si mort
    if (!aliveUI) {
      restart({
        ...gameState,
        currentPaletteIndex: palettes.currentPaletteIndex,
        nextPaletteIndex: palettes.nextPaletteIndex,
        getRandomPaletteIndex: palettes.getRandomPaletteIndex,
        setAliveUI,
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
        currentHasAutoPlay: gameState.currentHasAutoPlay,
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

        {/* 🔴 ORBE DE VIE */}
        <Circle
          cx={lifeOrbX}
          cy={lifeOrbY}
          r={8}
          color="#ef4444"
          opacity={lifeOrbVisible}
        />

        {/* 🟣 ORBE AUTO-PLAY */}
        <Circle
          cx={autoPlayOrbX}
          cy={autoPlayOrbY}
          r={8}
          color="#8b5cf6"
          opacity={autoPlayOrbVisible}
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
          strokeWidth={16}
          strokeCap="round"
          style="stroke"
          color={useDerivedValue(() => palettes.nextPalette.value.gate)}
          opacity={0.10}
        />
        <Path
          path={gatePath}
          strokeWidth={8}
          strokeCap="round"
          style="stroke"
          color={useDerivedValue(() => palettes.nextPalette.value.gate)}
        />

        {/* BALL */}
        <Circle cx={gameState.ballX} cy={gameState.ballY} r={10} color={BALL_COLOR} />

        {/* SCORE */}
        <Text
          x={CANVAS_WIDTH / 2 - 30}
          y={80}
          text={scoreUI.toString()}
          color="white"
          font={font}
        />

        {/* LIVES */}
        {livesPositions.map((pos, i) => (
          <Circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={7}
            color={i < livesUI ? '#ef4444' : '#334155'}
          />
        ))}

        {/* GAME OVER TEXT */}
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

      <BottomPanel
        autoPlayInInventory={autoPlayInInventoryUI}
        autoPlayActive={gameState.autoPlayActive}
        autoPlayTimeLeft={gameState.autoPlayTimeLeft}
        onActivateAutoPlay={onActivateAutoPlay}
      />
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