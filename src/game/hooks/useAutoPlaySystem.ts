// src/game/hooks/useAutoPlaySystem.ts
// Logique AUTO-PLAY : orbe, collision, inventaire, activation + fly-to-bottompanel

import {
  useDerivedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AUTO_PLAY_DURATION } from '../../constants/gameplay';
import { getBottomPanelTargetY, getAutoPlayTargetX } from '../../constants/layout';
import type { GameState } from './useGameState';

const AUTOPLAY_ORB_OFFSET = Math.PI / 2;

// ✅ Curseur vitesse (plus petit = plus rapide)
const AUTOPLAY_FLY_DURATION_MS = 800;

interface UseAutoPlaySystemParams {
  gameState: GameState;
  orbCollisionDist: number; // distance²
}

export const useAutoPlaySystem = ({ gameState, orbCollisionDist }: UseAutoPlaySystemParams) => {
  // ----- ORBE AUTO-PLAY (attach au ring) -----
  const orbAngle = useDerivedValue(() => gameState.gateAngle.value + AUTOPLAY_ORB_OFFSET);

  const orbX = useDerivedValue(
    () => gameState.currentX.value + gameState.currentR.value * Math.cos(orbAngle.value)
  );

  const orbY = useDerivedValue(
    () => gameState.currentY.value + gameState.currentR.value * Math.sin(orbAngle.value)
  );

  // ----- FLY vers BottomPanel -----
  // 0=attach, 1=flying
  const flying = useSharedValue(0);
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);

  // Visible si spawn sur ring OU en vol
  const autoPlayOrbVisible = useDerivedValue(() => {
    if (gameState.currentHasAutoPlay.value) {
      return 1;
    }
    if (flying.value === 1) {
      return 1;
    }
    return 0;
  });

  // Coordonnées à rendre (orb attach OU orb en vol)
  const autoPlayOrbX = useDerivedValue(() => {
    if (flying.value === 1) {
      return flyX.value;
    }
    return orbX.value;
  });

  const autoPlayOrbY = useDerivedValue(() => {
    if (flying.value === 1) {
      return flyY.value;
    }
    return orbY.value;
  });

  useAnimatedReaction(
    () => ({
      alive: gameState.alive.value,
      paused: gameState.isPaused.value,

      hasAutoPlay: gameState.currentHasAutoPlay.value,
      inInventory: gameState.autoPlayInInventory.value,

      bx: gameState.ballX.value,
      by: gameState.ballY.value,

      ox: orbX.value,
      oy: orbY.value,

      shieldVisible: gameState.shieldAvailable.value || gameState.shieldArmed.value,
    }),
    (s) => {
      'worklet';

      if (!s.alive) {
        flying.value = 0;
        return;
      }

      if (s.paused) {
        return;
      }

      if (!s.hasAutoPlay) {
        return;
      }

      if (s.inInventory) {
        return;
      }

      if (flying.value === 1) {
        return;
      }

      const dx = s.bx - s.ox;
      const dy = s.by - s.oy;
      const distSq = dx * dx + dy * dy;

      if (distSq <= orbCollisionDist) {
        // pickup -> fly vers bouton, inventaire true à la fin
        gameState.currentHasAutoPlay.value = false;

        flying.value = 1;
        flyX.value = s.ox;
        flyY.value = s.oy;

        const targetX = getAutoPlayTargetX(s.shieldVisible);
        const targetY = getBottomPanelTargetY();

        flyX.value = withTiming(
          targetX,
          { duration: AUTOPLAY_FLY_DURATION_MS, easing: Easing.linear },
          (finished) => {
            if (finished) {
              flying.value = 0;
              gameState.autoPlayInInventory.value = true;
            }
          }
        );

        flyY.value = withTiming(targetY, {
          duration: AUTOPLAY_FLY_DURATION_MS,
          easing: Easing.linear,
        });
      }
    }
  );

  // Activation via BottomPanel (appel JS OK)
  const onActivateAutoPlay = () => {
    'worklet';

    if (!gameState.autoPlayInInventory.value) {
      return;
    }

    gameState.autoPlayInInventory.value = false;
    gameState.autoPlayActive.value = true;
    gameState.autoPlayTimeLeft.value = AUTO_PLAY_DURATION;
  };

  return {
    autoPlayOrbVisible,
    autoPlayOrbX,
    autoPlayOrbY,
    onActivateAutoPlay,
  };
};