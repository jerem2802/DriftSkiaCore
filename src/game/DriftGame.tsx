// src/game/DriftGame.tsx
// ORCHESTRATEUR SKIA - 0 RE-RENDER CANVAS

import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { Canvas, Circle, Path, Text, RoundedRect } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShieldFxLayer } from './fx/ShieldFxLayer';
import { AutoPlayFxLayer } from './fx/AutoPlayFxLayer';

import { useCoinFxSystem } from './fx/useCoinFxSystem';
import { CoinFxLayer } from './fx/CoinFxLayer';

import { NeonRing } from '../components/NeonRing';
import { BottomPanel } from '../components/BottomPanel';
import { GameOverOverlay } from '../components/GameOverOverlay';
import { MiniNeonOrb } from './MiniNeonOrb';

import { CoinHUD } from './skia/CoinHUD';
import { useCoinOrbSystem } from './hooks/useCoinOrbSystem';

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
import { HudBar } from './skia/HudBar';
import { HeartIcon } from './skia/HeartIcon';
import { ShieldIcon } from './skia/ShieldIcon';

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LIVES_MAX,
  START_ORBIT_SPEED,
  START_GATE_WIDTH,
  RING_RADIUS,
  ORB_COLLISION_DIST,
} from '../constants/gameplay';
import { SHIELD_HALO_COLOR, COLOR_PALETTES } from '../constants/colors';
import {
  getCoinHudPosition,
  HUD_ROW1_Y, HUD_ROW2_Y,
  HUD_PAUSE_CX, HUD_PAUSE_CY, HUD_PAUSE_R_TAP,
  HUD_LIVES_START_X, HUD_LIVES_SPACING,
} from '../constants/layout';
import { BallRenderer } from './balls/BallRenderer';
import { FONTS } from '../utils/fonts';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;

type DriftGameProps = {
  onShop: () => void;
  selectedBallId?: string;
  allowStart?: boolean;
  isPremium?: boolean;
  externalPause?: boolean;
  onAliveChange?: (alive: boolean) => void;
  onPausePress?: () => void;
};

const DriftGame: React.FC<DriftGameProps> = ({ onShop, selectedBallId = 'core', allowStart = true, isPremium = false, externalPause, onAliveChange, onPausePress }) => {
  const gameState = useGameState();
  const palettes = usePalettes();

  // ✅ VITAL: safe-area aware scale (no gameplay logic touched)
  const { width: winW, height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const safeW = winW;
  const safeH = Math.max(1, winH - insets.top - insets.bottom);
  const scale = Math.min(safeW / CANVAS_WIDTH, safeH / CANVAS_HEIGHT);

  const shield = useShieldSystem({ gameState });

  const autoPlay = useAutoPlaySystem({
    gameState,
    orbCollisionDist: ORB_COLLISION_DIST,
  });

  const lifeOrb = useLifeOrbSystem({
    gameState,
    orbCollisionDist: ORB_COLLISION_DIST,
  });

  const coinFx = useCoinFxSystem({
    alive: gameState.alive,
    isPaused: gameState.isPaused,
  });

  const coinOrb = useCoinOrbSystem({
    alive: gameState.alive,
    isPaused: gameState.isPaused,
    currentX: gameState.currentX,
    currentY: gameState.currentY,
    currentR: gameState.currentR,
    ballX: gameState.ballX,
    gateAngle: gameState.gateAngle,
    ballY: gameState.ballY,
    currentHasCoin: gameState.currentHasCoin,
    coins: gameState.coins,
    coinHudPulse: gameState.coinHudPulse,
    orbCollisionDist: ORB_COLLISION_DIST,

    coinFxPickupSeq: coinFx.pickupSeq,
    coinFxPickupX: coinFx.pickupX,
    coinFxPickupY: coinFx.pickupY,
  });

  const {
    aliveUI,
    lastScoreUI,
    bestScoreUI,
    lastCoinsUI,
    totalCoinsUI,
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
    onAliveChange,
  });

  React.useEffect(() => {
    if (!allowStart) {
      gameState.isPaused.value = true;
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gameState.isPaused.value = false;
      });
    });
  }, [allowStart, gameState.isPaused]);

  React.useEffect(() => {
    if (externalPause !== undefined) {
      gameState.isPaused.value = externalPause;
    }
  }, [externalPause, gameState.isPaused]);

  const scorePopupTextDV = useDerivedValue(() => gameState.scorePopupText.value);

  const safeNextPalette = useDerivedValue(() => {
    'worklet';
    const cur = palettes.currentPaletteIndex.value;
    const next = palettes.nextPaletteIndex.value;
    const safeIdx = next === cur ? (next + 1) % COLOR_PALETTES.length : next;
    return COLOR_PALETTES[safeIdx];
  });

  const gateColor = useDerivedValue(() => {
    'worklet';
    return safeNextPalette.value.main;
  });

  const nextOuterColor = useDerivedValue(() => safeNextPalette.value.outer);
  const nextMidColor = useDerivedValue(() => safeNextPalette.value.mid);
  const nextMainColor = useDerivedValue(() => safeNextPalette.value.main);

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

  const fadingRingScaledR = useDerivedValue(() => gameState.fadingRingR.value * gameState.fadingRingScale.value);

  // Positions des cœurs (ligne haute du HUD)
  const livesPositions = React.useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < LIVES_MAX; i++) {
      positions.push({ x: HUD_LIVES_START_X - i * HUD_LIVES_SPACING, y: HUD_ROW1_Y });
    }
    return positions;
  }, []);


  const coinHudPos = React.useMemo(() => getCoinHudPosition(), []);

  // Opacité du bouton pause Skia (visible seulement quand vivant et non pausé)
  const pauseButtonOpacity = useDerivedValue(() =>
    gameState.alive.value && !gameState.isPaused.value ? 1 : 0
  );

  // Offset canvas pour conversion coords écran → canvas (détection tap pause)
  const canvasLeft = Math.max(0, (winW - CANVAS_WIDTH * scale) / 2);
  const canvasTop = insets.top + Math.max(0, (safeH - CANVAS_HEIGHT * scale) / 2);

  useGameLoop({
    ...gameState,
    ...palettes,
  });

  const onTap = (e: GestureResponderEvent) => {
    if (!aliveUI) return;

    // Détection tap bouton pause (canvas coords)
    const cx = (e.nativeEvent.locationX - canvasLeft) / scale;
    const cy = (e.nativeEvent.locationY - canvasTop) / scale;
    const pdx = cx - HUD_PAUSE_CX;
    const pdy = cy - HUD_PAUSE_CY;
    if (pdx * pdx + pdy * pdy < HUD_PAUSE_R_TAP * HUD_PAUSE_R_TAP) {
      onPausePress?.();
      return;
    }

    if (gameState.mode.value !== 'orbit') return;

    const tapResult = validateTap(
      gameState.angle.value,
      gameState.gateAngle.value,
      gameState.gateWidth.value
    );

    if (tapResult === 'hit') {
      gameState.mode.value = 'dash';
      gameState.dashStartTime.value = Date.now();
    } else {
      loseLife({
        lives: gameState.lives,
        alive: gameState.alive,
        streak: gameState.streak,
        combo: gameState.combo,
        currentHasLife: gameState.currentHasLife,
        nextHasLife: gameState.nextHasLife,
        currentHasAutoPlay: gameState.currentHasAutoPlay,
        currentHasCoin: gameState.currentHasCoin,
        shieldAvailable: gameState.shieldAvailable,
        shieldArmed: gameState.shieldArmed,
        shieldChargesLeft: gameState.shieldChargesLeft,
      });
    }
  };

  return (
    <Pressable
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      onPress={onTap}
    >
      <View style={[styles.stage, { transform: [{ scale }] }]}>
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

          <MiniNeonOrb cx={lifeOrb.lifeOrbX} cy={lifeOrb.lifeOrbY} r={8} color="#ef4444" opacity={lifeOrb.lifeOrbVisible} />
          <MiniNeonOrb cx={autoPlay.autoPlayOrbX} cy={autoPlay.autoPlayOrbY} r={13} color="#8b5cf6" opacity={autoPlay.autoPlayOrbVisible} />
          <MiniNeonOrb cx={shield.shieldOrbX} cy={shield.shieldOrbY} r={13} color="#22d3ee" opacity={shield.shieldOrbVisible} />
          <MiniNeonOrb cx={coinOrb.coinOrbX} cy={coinOrb.coinOrbY} r={12} color="#fbbf24" opacity={coinOrb.coinOrbVisible} />

          <CoinFxLayer x={coinFx.flyX} y={coinFx.flyY} opacity={coinFx.flyVisible} r={12} color="#fbbf24" />

          <NeonRing
            cx={gameState.nextX}
            cy={gameState.nextY}
            r={gameState.nextR}
            outerColor={nextOuterColor}
            midColor={nextMidColor}
            mainColor={nextMainColor}
          />

          <Path path={gatePath} strokeWidth={16} strokeCap="round" style="stroke" color={gateColor} opacity={0.1} />
          <Path path={gatePath} strokeWidth={8} strokeCap="round" style="stroke" color={gateColor} />

          <Circle cx={gameState.ballX} cy={gameState.ballY} r={14} color={SHIELD_HALO_COLOR} opacity={shield.shieldHaloVisible} />
          <BallRenderer
            selectedBallId={selectedBallId}
            ballX={gameState.ballX}
            ballY={gameState.ballY}
            alive={gameState.alive}
            isPaused={gameState.isPaused}
          />

          <AutoPlayFxLayer
            alive={gameState.alive}
            isPaused={gameState.isPaused}
            autoPlayActive={gameState.autoPlayActive}
            ballX={gameState.ballX}
            ballY={gameState.ballY}
            capacity={48}
          />

          <ShieldFxLayer
            alive={gameState.alive}
            isPaused={gameState.isPaused}
            shieldArmed={gameState.shieldArmed}
            ballX={gameState.ballX}
            ballY={gameState.ballY}
            capacity={24}
          />

          {/* ─── HUD BAR (fond, dessiné avant les éléments HUD) ─── */}
          <HudBar canvasWidth={CANVAS_WIDTH} />

          <ScoreHUD score={gameState.score} streak={gameState.streak} canvasWidth={CANVAS_WIDTH} />

          <Text
            x={gameState.scorePopupX}
            y={useDerivedValue(() => gameState.scorePopupY.value + 10)}
            text={scorePopupTextDV}
            color="white"
            font={FONTS.popup}
            opacity={gameState.scorePopupOpacity}
          />

          {/* Coin counter */}
          <CoinHUD x={coinHudPos.x} y={coinHudPos.y} coins={gameState.coins} pulse={gameState.coinHudPulse} />

          {/* Bouton pause (icône ⏸ en Skia) — glow bleuté */}
          <Circle cx={HUD_PAUSE_CX} cy={HUD_PAUSE_CY} r={32} color="rgba(0,220,255,0.18)" opacity={pauseButtonOpacity} />
          <Circle cx={HUD_PAUSE_CX} cy={HUD_PAUSE_CY} r={26} color="rgba(6,12,26,0.90)" opacity={pauseButtonOpacity} />
          <Circle cx={HUD_PAUSE_CX} cy={HUD_PAUSE_CY} r={26} color="rgba(0,220,255,0.55)" style="stroke" strokeWidth={1.5} opacity={pauseButtonOpacity} />
          <RoundedRect x={HUD_PAUSE_CX - 9} y={HUD_PAUSE_CY - 9} width={6} height={18} r={2} color="rgba(255,255,255,0.95)" opacity={pauseButtonOpacity} />
          <RoundedRect x={HUD_PAUSE_CX + 3} y={HUD_PAUSE_CY - 9} width={6} height={18} r={2} color="rgba(255,255,255,0.95)" opacity={pauseButtonOpacity} />

          {/* Cœurs (vies) */}
          {livesPositions.map((pos, i) => (
            <HeartIcon key={i} cx={pos.x} cy={pos.y} index={i} lives={gameState.lives} />
          ))}

          {/* Shields (ligne basse, alignés sous les cœurs) */}
          <ShieldIcon cx={HUD_LIVES_START_X}                         cy={HUD_ROW2_Y} opacity={shield.shieldCharge1Visible} />
          <ShieldIcon cx={HUD_LIVES_START_X - HUD_LIVES_SPACING}     cy={HUD_ROW2_Y} opacity={shield.shieldCharge2Visible} />
          <ShieldIcon cx={HUD_LIVES_START_X - 2 * HUD_LIVES_SPACING} cy={HUD_ROW2_Y} opacity={shield.shieldCharge3Visible} />
        </Canvas>
      </View>

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
        coinsEarned={lastCoinsUI}
        totalCoins={totalCoinsUI}
        canContinue={!hasUsedContinue}
        onRestart={handleRestart}
        onShare={handleShare}
        onWatchAd={handleContinue}
        onShop={onShop}
        isPremium={isPremium}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  stage: { alignSelf: 'center' },
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
});

export default DriftGame;
