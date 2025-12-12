// src/game/logic/scorePopup.ts
// Gestion du popup de score dans le secondary ring

import { withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

interface TriggerScorePopupParams {
  gained: number;
  currentX: SharedValue<number>;
  currentY: SharedValue<number>;
  scorePopupText: SharedValue<string>;
  scorePopupOpacity: SharedValue<number>;
  scorePopupX: SharedValue<number>;
  scorePopupY: SharedValue<number>;
}

export const triggerScorePopup = (params: TriggerScorePopupParams) => {
  'worklet';
  const {
    gained,
    currentX,
    currentY,
    scorePopupText,
    scorePopupOpacity,
    scorePopupX,
    scorePopupY,
  } = params;

  if (gained <= 0) {
    scorePopupText.value = '';
    scorePopupOpacity.value = 0;
    return;
  }

  // texte + position sur le ring courant (ex-secondary)
  scorePopupText.value = `+${gained}`;
  scorePopupX.value = currentX.value;
  scorePopupY.value = currentY.value;

  // fade-out doux
  scorePopupOpacity.value = 1;
  scorePopupOpacity.value = withTiming(0, { duration: 450 });
};
