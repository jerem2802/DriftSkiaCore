// src/game/skia/ScoreHUD.tsx
// HUD score + multiplicateur (UI only, SharedValues only)

import React from 'react';
import { Platform } from 'react-native';
import { Text, matchFont } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });

const scoreFont = matchFont({
  fontFamily,
  fontSize: 48,
  fontWeight: '900' as const,
});

const multFont = matchFont({
  fontFamily,
  fontSize: 34, // plus gros
  fontWeight: '900' as const, // plus gras
});

const MULT_COLORS = {
  x1: '#ffffff',
  x2: '#22d3ee', // cyan
  x3: '#a855f7', // violet
  x4: '#f59e0b', // gold
} as const;

type Props = {
  score: SharedValue<number>;
  streak: SharedValue<number>;
  canvasWidth: number;
  yScore?: number;
};

export const ScoreHUD: React.FC<Props> = ({
  score,
  streak,
  canvasWidth,
  yScore = 80,
}) => {
  const scoreText = useDerivedValue(() => Math.round(score.value).toString());

  // Même logique que scoreRules.ts (5/10/20 -> x2/x3/x4)
  const mult = useDerivedValue(() => {
    const s = streak.value;
    if (s >= 20) return 4;
    if (s >= 10) return 3;
    if (s >= 5) return 2;
    return 1;
  });

  const multText = useDerivedValue(() => (mult.value > 1 ? `x${mult.value}` : ''));
  const multOpacity = useDerivedValue(() => (mult.value > 1 ? 1 : 0));

  const multColor = useDerivedValue(() => {
    if (mult.value === 4) return MULT_COLORS.x4;
    if (mult.value === 3) return MULT_COLORS.x3;
    if (mult.value === 2) return MULT_COLORS.x2;
    return MULT_COLORS.x1;
  });

  // Positions (MVP)
  const xScore = canvasWidth / 2 - 30;

  // "x2/x3/x4" = 2 caractères, on centre avec un offset fixe
  // Ajustable si tu veux peaufiner : +/- 2 px
  const xMult = canvasWidth / 2 - 22;
  const yMult = yScore + 44;

  // "gras" sans effets lourds: on dessine 2 fois avec 1px de décalage
  const boldOffset = 1;

  return (
    <>
      {/* SCORE */}
      <Text x={xScore} y={yScore} text={scoreText} color="white" font={scoreFont} />

      {/* MULTIPLICATEUR (x2/x3/x4) */}
      <Text
        x={xMult}
        y={yMult}
        text={multText}
        color={multColor}
        font={multFont}
        opacity={multOpacity}
      />
      <Text
        x={xMult + boldOffset}
        y={yMult}
        text={multText}
        color={multColor}
        font={multFont}
        opacity={multOpacity}
      />
    </>
  );
};
