// src/game/DriftGame.tsx
// ORCHESTRATEUR SKIA - 0 RE-RENDER CANVAS

import React from 'react';
import { Pressable, StatusBar, StyleSheet, Platform } from 'react-native';
import { Canvas, Circle, Path, Text, matchFont } from '@shopify/react-native-skia';
import { useDerivedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';

import { NeonRing } from '../components/NeonRing';
import { BottomPanel } from '../components/BottomPanel';
import { GameOverOverlay } from '../components/GameOverOverlay';

import { createArcPath } from '../utils/path';
import { validateTap } from './logic/collisionDetection';
import { loseLife } from './logic/gameLifecycle';
import { useGameState } from './hooks/useGameState';
import { usePalettes } from './hooks/usePalettes';
import { useGameLoop } from './hooks/useGameLoop';
import { useShieldSystem } from './hooks/useShieldSystem';
import { useAutoPlaySystem } from './hooks/useAutoPlaySystem';
import { useGameOverSystem } from './hooks/useGameOverSystem';

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LIVES_MAX,
  START_ORBIT_SPEED,
  START_GATE_WIDTH,
  RING_RADIUS,
} from '../constants/gameplay';
import { BALL_COLOR, SHIELD_HALO_COLOR } from '../constants/colors';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;

const LIFE_ORB_OFFSET = Math.PI;
const ORB_COLLISION_DIST = 625;

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });
const fontStyle = {
  fontFamily,
  fontSize: 48,
  fontWeight: 'bold' as const,
};
const font = matchFont(fontStyle);

const DriftGame: React.FC = () => {
  const gameState = useGameState();
  const palettes = usePalettes();

  // Score 100 % côté Skia / SharedValue
  const scoreText = useDerivedValue(
    () => Math.round(gameState.score.value).toString()
  );

  // UI React
  const [livesUI, setLivesUI] = React.useState(LIVES_MAX);
  const [autoPlayInInventoryUI, setAutoPlayInInventoryUI] = React.useState(false);
  const [shieldAvailableUI, setShieldAvailableUI] = React.useState(false);
  const [shieldArmedUI, setShieldArmedUI] = React.useState(false);

  // ----- SYSTÈME SHIELD (hook dédié) -----
  const shield = useShieldSystem({
    gameState,
    setShieldAvailableUI,
    setShieldArmedUI,
  });

  // ----- SYSTÈME AUTO-PLAY (hook dédié) -----
  const autoPlay = useAutoPlaySystem({
    gameState,
    setAutoPlayInInventoryUI,
    orbCollisionDist: ORB_COLLISION_DIST,
  });

  // ----- SYSTÈME GAME OVER (hook dédié) -----
  const {
    aliveUI,
    lastScoreUI,
    bestScoreUI,
    hasUsedContinue,
    handleRestart,
    handleContinue,
    handleShare,
  } = useGameOverSystem({
    gameState,
    currentPaletteIndex: palettes.currentPaletteIndex,
    nextPaletteIndex: palettes.nextPaletteIndex,
    getRandomPaletteIndex: palettes.getRandomPaletteIndex,
    centerX: CENTER_X,
    centerY: CENTER_Y,
    ringRadius: RING_RADIUS,
    startOrbitSpeed: START_ORBIT_SPEED,
    startGateWidth: START_GATE_WIDTH,
  });

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

  // Sync des vies vers l'UI React (petits cercles rouges)
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
    // Si Game Over, on laisse l'overlay gérer le restart / continue
    if (!aliveUI) {
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
        shieldAvailable: gameState.shieldAvailable,
        shieldArmed: gameState.shieldArmed,
        shieldChargesLeft: gameState.shieldChargesLeft,
      });
    }
  };

  const shieldDotsY = 98; // sous les vies

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
          cx={autoPlay.autoPlayOrbX}
          cy={autoPlay.autoPlayOrbY}
          r={8}
          color="#8b5cf6"
          opacity={autoPlay.autoPlayOrbVisible}
        />

        {/* 🛡️ ORBE SHIELD */}
        <Circle
          cx={shield.shieldOrbX}
          cy={shield.shieldOrbY}
          r={8}
          color="#22d3ee"
          opacity={shield.shieldOrbVisible}
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
          opacity={0.1}
        />
        <Path
          path={gatePath}
          strokeWidth={8}
          strokeCap="round"
          style="stroke"
          color={useDerivedValue(() => palettes.nextPalette.value.gate)}
        />

        {/* BALL + HALO SHIELD */}
        <Circle
          cx={gameState.ballX}
          cy={gameState.ballY}
          r={14}
          color={SHIELD_HALO_COLOR}
          opacity={shield.shieldHaloVisible}
        />
        <Circle cx={gameState.ballX} cy={gameState.ballY} r={10} color={BALL_COLOR} />

        {/* SCORE */}
        <Text
          x={CANVAS_WIDTH / 2 - 30}
          y={80}
          text={scoreText}
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

        {/* SHIELD CHARGES (3 points sous les vies) */}
        <Circle
          cx={CANVAS_WIDTH - 60}
          cy={shieldDotsY}
          r={4}
          color="#22d3ee"
          opacity={shield.shieldCharge1Visible}
        />
        <Circle
          cx={CANVAS_WIDTH - 60 - 22}
          cy={shieldDotsY}
          r={4}
          color="#22d3ee"
          opacity={shield.shieldCharge2Visible}
        />
        <Circle
          cx={CANVAS_WIDTH - 60 - 44}
          cy={shieldDotsY}
          r={4}
          color="#22d3ee"
          opacity={shield.shieldCharge3Visible}
        />
      </Canvas>

      <BottomPanel
        autoPlayInInventory={autoPlayInInventoryUI}
        autoPlayActive={gameState.autoPlayActive}
        autoPlayTimeLeft={gameState.autoPlayTimeLeft}
        onActivateAutoPlay={autoPlay.onActivateAutoPlay}
        shieldAvailable={shieldAvailableUI}
        shieldArmed={shieldArmedUI}
        onActivateShield={shield.onActivateShield}
      />

      <GameOverOverlay
        visible={!aliveUI}
        score={lastScoreUI}
        bestScore={bestScoreUI}
        canContinue={!hasUsedContinue}
        onRestart={handleRestart}
        onShare={handleShare}
        onWatchAd={handleContinue}
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
