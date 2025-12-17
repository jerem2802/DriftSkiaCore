// src/game/hooks/useGameOverSystem.ts
// Gère TOUT le game over côté logique + synchro UI + commit meta (PlayerProfile)

import React from 'react';
import { Share } from 'react-native';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { restart } from '../logic/gameLifecycle';
import type { useGameState } from './useGameState';

import { loadProfile, commitRunToProfile } from '../../meta/playerProfile';


type GameState = ReturnType<typeof useGameState>;

interface UseGameOverSystemParams {
  gameState: GameState;
  currentPaletteIndex: SharedValue<number>;
  nextPaletteIndex: SharedValue<number>;
  getRandomPaletteIndex: (exclude?: number) => number;

  centerX: number;
  centerY: number;
  ringRadius: number;
  startOrbitSpeed: number;
  startGateWidth: number;
}

export const useGameOverSystem = (params: UseGameOverSystemParams) => {
  const {
    gameState,
    currentPaletteIndex,
    nextPaletteIndex,
    getRandomPaletteIndex,
    centerX,
    centerY,
    ringRadius,
    startOrbitSpeed,
    startGateWidth,
  } = params;

  // UI React
  const [aliveUI, setAliveUI] = React.useState(true);
  const [lastScoreUI, setLastScoreUI] = React.useState(0);
  const [bestScoreUI, setBestScoreUI] = React.useState(0);
  const [lastCoinsUI, setLastCoinsUI] = React.useState(0);
  const [totalCoinsUI, setTotalCoinsUI] = React.useState(0);
  const [hasUsedContinue, setHasUsedContinue] = React.useState(false);

  // refs anti double-commit + gestion Continue
  const hasUsedContinueRef = React.useRef(false);
  const committedRef = React.useRef(false);
  const pendingRef = React.useRef({ score: 0, coins: 0 });

  // Charger profil au boot (bestScore + totalCoins)
  React.useEffect(() => {
    let mounted = true;
    loadProfile()
      .then((p) => {
        if (!mounted) return;
        setBestScoreUI(p.bestScore);
        setTotalCoinsUI(p.totalCoins);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const commitPendingIfNeeded = React.useCallback(async () => {
    if (committedRef.current) return;
    committedRef.current = true;

    try {
      const p = await commitRunToProfile({
        score: pendingRef.current.score,
        coinsEarned: pendingRef.current.coins,
      });
      setBestScoreUI(p.bestScore);
      setTotalCoinsUI(p.totalCoins);
    } catch {
      // MVP: silencieux
    }
  }, []);

  const onGameOverCaptured = React.useCallback(
    (finalScore: number, finalCoins: number) => {
      pendingRef.current = { score: finalScore, coins: finalCoins };
      committedRef.current = false;

      setLastScoreUI(finalScore);
      setLastCoinsUI(finalCoins);
      setBestScoreUI((prev) => Math.max(prev, finalScore));

      // Si Continue déjà consommé => ce GameOver est FINAL => commit immédiat
      if (hasUsedContinueRef.current) {
        void commitPendingIfNeeded();
      }
    },
    [commitPendingIfNeeded]
  );

  // Sync alive => UI, et capture score/coins au GameOver
  useAnimatedReaction(
    () => gameState.alive.value,
    (alive, prevAlive) => {
      if (alive === prevAlive) return;

      runOnJS(setAliveUI)(alive);

      if (!alive) {
        const finalScore = Math.round(gameState.score.value);
        const finalCoins = Math.round(gameState.coins.value);
        runOnJS(onGameOverCaptured)(finalScore, finalCoins);
      }
    }
  );

  const handleRestart = React.useCallback(() => {
    // Restart = clôture la run (si pas encore commit)
    void commitPendingIfNeeded();

    // ✅ IMPORTANT: on retire l’overlay immédiatement (sinon illusion de “téléport”)
    setAliveUI(true);

    setHasUsedContinue(false);
    hasUsedContinueRef.current = false;

    restart({
      ...gameState,
      currentPaletteIndex,
      nextPaletteIndex,
      getRandomPaletteIndex,
      CENTER_X: centerX,
      CENTER_Y: centerY,
      RING_RADIUS: ringRadius,
      START_ORBIT_SPEED: startOrbitSpeed,
      START_GATE_WIDTH: startGateWidth,
    });
  }, [
    commitPendingIfNeeded,
    gameState,
    currentPaletteIndex,
    nextPaletteIndex,
    getRandomPaletteIndex,
    centerX,
    centerY,
    ringRadius,
    startOrbitSpeed,
    startGateWidth,
  ]);

  const handleContinue = React.useCallback(() => {
    if (hasUsedContinueRef.current) return;

    // On ne continue que si on est vraiment en Game Over
    if (gameState.alive.value || gameState.lives.value > 0) return;

    // ✅ pareil: on retire l’overlay immédiatement
    setAliveUI(true);

    setHasUsedContinue(true);
    hasUsedContinueRef.current = true;

    // On rend 1 vie et on relance la boucle
    gameState.lives.value = 1;
    gameState.alive.value = true;
  }, [gameState]);

  const handleShare = React.useCallback(() => {
    const message = `Je viens de faire ${lastScoreUI} points sur Drift Ring ! (Best : ${bestScoreUI})`;
    Share.share({ message }).catch(() => {});
  }, [lastScoreUI, bestScoreUI]);

  return {
    aliveUI,
    lastScoreUI,
    bestScoreUI,
    lastCoinsUI,
    totalCoinsUI,
    hasUsedContinue,
    handleRestart,
    handleContinue,
    handleShare,
  };
};
