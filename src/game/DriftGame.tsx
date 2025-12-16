// src/game/DriftGame.tsx
// ORCHESTRATEUR SKIA - 0 RE-RENDER CANVAS

import React from 'react';
import { Pressable, StatusBar, StyleSheet, Platform } from 'react-native';
import { Canvas, Circle, Path, Text, matchFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { ShieldFxLayer } from './fx/ShieldFxLayer';

import { NeonRing } from '../components/NeonRing';
import { BottomPanel } from '../components/BottomPanel';
import { GameOverOverlay } from '../components/GameOverOverlay';

import { ShieldOrbIcon } from './skia/ShieldOrbIcon';


import { createArcPath } from '../utils/path';
import { validateTap } from './logic/collisionDetection';
import { loseLife } from './logic/gameLifecycle';
import { useGameState } from './hooks/useGameState';
import { usePalettes } from './hooks/usePalettes';
import { useGameLoop } from './hooks/useGameLoop';
import { useShieldSystem } from './hooks/useShieldSystem';
import { useAutoPlaySystem } from './hooks/useAutoPlaySystem';
import { useGameOverSystem } from './hooks/useGameOverSystem';
import { useLifeOrbSystem } from './hooks/useLifeOrbSystem';

import { ScoreHUD } from './skia/ScoreHUD';
import { LifeDot } from './skia/LifeDot';

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LIVES_MAX,
  START_ORBIT_SPEED,
  START_GATE_WIDTH,
  RING_RADIUS,
} from '../constants/gameplay';
import { BALL_COLOR, SHIELD_HALO_COLOR, COLOR_PALETTES } from '../constants/colors';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;

const ORB_COLLISION_DIST = 625;

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });

const popupFontStyle = {
  fontFamily,
  fontSize: 26,
  fontWeight: 'bold' as const,
};
const popupFont = matchFont(popupFontStyle);

const DriftGame: React.FC = () => {
  const gameState = useGameState();
  const palettes = usePalettes();

  // Popup score
  const scorePopupTextDV = useDerivedValue(() => gameState.scorePopupText.value);

  // ----- SHIELD -----
  const shield = useShieldSystem({ gameState });

  // ----- AUTO-PLAY -----
  const autoPlay = useAutoPlaySystem({
    gameState,
    orbCollisionDist: ORB_COLLISION_DIST,
  });

  // ----- LIFE ORB (hook dédié : pos + collision) -----
  const lifeOrb = useLifeOrbSystem({
    gameState,
    orbCollisionDist: ORB_COLLISION_DIST,
  });

  // ----- GAME OVER -----
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

  /**
   * IMPORTANT (MVP + robustesse):
   * - Si, pour une raison quelconque, currentPaletteIndex === nextPaletteIndex,
   *   on force un fallback déterministe pour le rendu du secondary.
   * - Ça garantit: jamais 2 rings identiques en même temps.
   */
  const safeNextPalette = useDerivedValue(() => {
    'worklet';
    const cur = palettes.currentPaletteIndex.value;
    const next = palettes.nextPaletteIndex.value;

    const safeIdx = next === cur ? (next + 1) % COLOR_PALETTES.length : next;
    return COLOR_PALETTES[safeIdx];
  });

  // Gate = EXACTEMENT la couleur du secondary ring (pas une couleur "gate" séparée)
  const gateColor = useDerivedValue(() => {
    'worklet';
    return safeNextPalette.value.main;
  });

  const nextOuterColor = useDerivedValue(() => safeNextPalette.value.outer);
  const nextMidColor = useDerivedValue(() => safeNextPalette.value.mid);
  const nextMainColor = useDerivedValue(() => safeNextPalette.value.main);

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

  // LIVES POSITIONS
  const livesPositions = React.useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const startX = CANVAS_WIDTH - 60;
    const y = 70;
    for (let i = 0; i < LIVES_MAX; i++) {
      positions.push({ x: startX - i * 22, y });
    }
    return positions;
  }, []);

  // ----- GAME LOOP -----
  useGameLoop({
    ...gameState,
    ...palettes,
  });

  const onTap = () => {
    if (!aliveUI) return;
    if (gameState.mode.value !== 'orbit') return;

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

  const shieldDotsY = 98;

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

        {/* ORBE DE VIE (via hook) */}
        <Circle
          cx={lifeOrb.lifeOrbX}
          cy={lifeOrb.lifeOrbY}
          r={8}
          color="#ef4444"
          opacity={lifeOrb.lifeOrbVisible}
        />

        {/* ORBE AUTO-PLAY */}
        <Circle
          cx={autoPlay.autoPlayOrbX}
          cy={autoPlay.autoPlayOrbY}
          r={8}
          color="#8b5cf6"
          opacity={autoPlay.autoPlayOrbVisible}
        />

       {/* ORBE SHIELD (icône en rotation type "pièce") */}
<ShieldOrbIcon
  cx={shield.shieldOrbX}
  cy={shield.shieldOrbY}
  opacity={shield.shieldOrbVisible}
  size={20}
/>


        {/* NEXT RING (palette safe: jamais identique au current) */}
        <NeonRing
          cx={gameState.nextX}
          cy={gameState.nextY}
          r={gameState.nextR}
          outerColor={nextOuterColor}
          midColor={nextMidColor}
          mainColor={nextMainColor}
        />

        {/* GATE (exactement la couleur du secondary ring) */}
        <Path
          path={gatePath}
          strokeWidth={16}
          strokeCap="round"
          style="stroke"
          color={gateColor}
          opacity={0.1}
        />
        <Path
          path={gatePath}
          strokeWidth={8}
          strokeCap="round"
          style="stroke"
          color={gateColor}
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

        {/* SHIELD FX (shader + atlas, gère son system en interne) */}
        <ShieldFxLayer
          alive={gameState.alive}
          isPaused={gameState.isPaused}
          shieldArmed={gameState.shieldArmed}
          ballX={gameState.ballX}
          ballY={gameState.ballY}
          capacity={24}
        />

        {/* SCORE + MULT + TIER (Skia) */}
        <ScoreHUD score={gameState.score} streak={gameState.streak} canvasWidth={CANVAS_WIDTH} />

        {/* POPUP SCORE (dans le ring secondary → current) */}
        <Text
          x={gameState.scorePopupX}
          y={useDerivedValue(() => gameState.scorePopupY.value + 10)}
          text={scorePopupTextDV}
          color="white"
          font={popupFont}
          opacity={gameState.scorePopupOpacity}
        />

        {/* LIVES (Skia pur, piloté par gameState.lives) */}
        {livesPositions.map((pos, i) => (
          <LifeDot key={i} x={pos.x} y={pos.y} index={i} lives={gameState.lives} />
        ))}

        {/* SHIELD CHARGES */}
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
        autoPlayInInventory={gameState.autoPlayInInventory}
        autoPlayActive={gameState.autoPlayActive}
        autoPlayTimeLeft={gameState.autoPlayTimeLeft}
        onActivateAutoPlay={autoPlay.onActivateAutoPlay}
        shieldAvailable={gameState.shieldAvailable}
        shieldArmed={gameState.shieldArmed}
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
