// src/game/hooks/useGameOverSystem.ts
// Gère TOUT le game over côté logique + synchro UI

import React from 'react';
import { Share } from 'react-native';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { restart } from '../logic/gameLifecycle';
import type { useGameState } from './useGameState';

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
  const [hasUsedContinue, setHasUsedContinue] = React.useState(false);

  // Callback JS pour mettre à jour les scores à la mort
  const updateScoresOnGameOver = React.useCallback((finalScore: number) => {
    setLastScoreUI(finalScore);
    setBestScoreUI((prev) => Math.max(prev, finalScore));
  }, []);

  // Sync du flag alive + score final vers l'UI React
  useAnimatedReaction(
    () => gameState.alive.value,
    (alive, prevAlive) => {
      if (alive === prevAlive) {
        return;
      }

      runOnJS(setAliveUI)(alive);

      if (!alive) {
        const finalScore = Math.round(gameState.score.value);
        runOnJS(updateScoresOnGameOver)(finalScore);
      }
    }
  );

  const handleRestart = React.useCallback(() => {
    setHasUsedContinue(false);

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
    if (hasUsedContinue) {
      return;
    }

    // On ne continue que si on est vraiment en Game Over
    if (gameState.alive.value || gameState.lives.value > 0) {
      return;
    }

    setHasUsedContinue(true);

    // On rend 1 vie et on relance la boucle
    gameState.lives.value = 1;
    gameState.alive.value = true;
  }, [hasUsedContinue, gameState]);

  const handleShare = React.useCallback(() => {
    const message = `Je viens de faire ${lastScoreUI} points sur Drift Ring ! (Best : ${bestScoreUI})`;
    Share.share({ message }).catch(() => {
      // annulation ou erreur → on ne fait rien
    });
  }, [lastScoreUI, bestScoreUI]);

  return {
    aliveUI,
    lastScoreUI,
    bestScoreUI,
    hasUsedContinue,
    handleRestart,
    handleContinue,
    handleShare,
  };
};
