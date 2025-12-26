// src/game/DriftGame.tsx
// ORCHESTRATEUR SKIA - 0 RE-RENDER CANVAS

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Canvas, Circle, Path, Text } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

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
import { LifeDot } from './skia/LifeDot';

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
import { getCoinHudPosition, HUD_TOP_Y } from '../constants/layout';
import { BallRenderer } from './balls/BallRenderer';
import { FONTS } from '../utils/fonts';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;

type DriftGameProps = {
  onShop: () => void;
  selectedBallId?: string;
  allowStart?: boolean;
};

const DriftGame: React.FC<DriftGameProps> = ({ onShop, selectedBallId = 'core', allowStart = true }) => {
  const gameState = useGameState();
  const palettes = usePalettes();

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

  const livesPositions = React.useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const startX = CANVAS_WIDTH - 60;
    const y = HUD_TOP_Y;
    for (let i = 0; i < LIVES_MAX; i++) positions.push({ x: startX - i * 22, y });
    return positions;
  }, []);

  const coinHudPos = React.useMemo(() => getCoinHudPosition(), []);

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

  const shieldDotsY = HUD_TOP_Y + 28;

  return (
    <Pressable style={styles.container} onPress={onTap}>
      <Canvas style={styles.canvas}>
        <CoinHUD x={coinHudPos.x} y={coinHudPos.y} coins={gameState.coins} pulse={gameState.coinHudPulse} />

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

        <ScoreHUD score={gameState.score} streak={gameState.streak} canvasWidth={CANVAS_WIDTH} />

        <Text
          x={gameState.scorePopupX}
          y={useDerivedValue(() => gameState.scorePopupY.value + 10)}
          text={scorePopupTextDV}
          color="white"
          font={FONTS.popup}
          opacity={gameState.scorePopupOpacity}
        />

        {livesPositions.map((pos, i) => (
          <LifeDot key={i} x={pos.x} y={pos.y} index={i} lives={gameState.lives} />
        ))}

        <Circle cx={CANVAS_WIDTH - 60} cy={shieldDotsY} r={4} color="#22d3ee" opacity={shield.shieldCharge1Visible} />
        <Circle cx={CANVAS_WIDTH - 82} cy={shieldDotsY} r={4} color="#22d3ee" opacity={shield.shieldCharge2Visible} />
        <Circle cx={CANVAS_WIDTH - 104} cy={shieldDotsY} r={4} color="#22d3ee" opacity={shield.shieldCharge3Visible} />
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
        coinsEarned={lastCoinsUI}
        totalCoins={totalCoinsUI}
        canContinue={!hasUsedContinue}
        onRestart={handleRestart}
        onShare={handleShare}
        onWatchAd={handleContinue}
        onShop={onShop}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
});

export default DriftGame;