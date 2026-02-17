import React from 'react';
import { BlurMask, Line, LinearGradient, Text } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { FONTS } from '../../utils/fonts';
import { HUD_SCORE_Y, HUD_MULT_Y } from '../../constants/layout';

const MULT_COLORS = {
  x1: '#ffffff',
  x2: '#22d3ee',
  x3: '#a855f7',
  x4: '#f59e0b',
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
  yScore = HUD_SCORE_Y,
}) => {
  const scoreText = useDerivedValue(() => Math.round(score.value).toString());

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

  // Centrage dynamique : font 48px bold ≈ 30px/digit → offset 15px/digit
  const xScore = useDerivedValue(() => {
    'worklet';
    return canvasWidth / 2 - Math.round(Math.max(0, score.value)).toString().length * 15;
  });

  const xMult = canvasWidth / 2 - 22;
  const yMult = HUD_MULT_Y;

  // Lignes horizontales encadrant le multiplicateur (centre à yMult-13 pour font 34px)
  const lineY = yMult - 8;

  return (
    <>
      {/* Score — glow bleuté puis pass crisp */}
      <Text x={xScore} y={yScore} text={scoreText} color="rgba(0,220,255,0.65)" font={FONTS.scoreHUD}>
        <BlurMask blur={14} style="outer" />
      </Text>
      <Text x={xScore} y={yScore} text={scoreText} color="white" font={FONTS.scoreHUD} />

      {/* Lignes ──── x3 ──── : glow bleuté, s'atténue vers l'extérieur */}
      <Line
        p1={{ x: 110, y: lineY }}
        p2={{ x: canvasWidth / 2 - 28, y: lineY }}
        strokeWidth={3}
        opacity={multOpacity}
      >
        <LinearGradient
          start={{ x: 110, y: lineY }}
          end={{ x: canvasWidth / 2 - 28, y: lineY }}
          colors={['transparent', 'rgba(0,220,255,0.7)']}
        />
      </Line>
      <Line
        p1={{ x: canvasWidth / 2 + 18, y: lineY }}
        p2={{ x: canvasWidth - 110, y: lineY }}
        strokeWidth={3}
        opacity={multOpacity}
      >
        <LinearGradient
          start={{ x: canvasWidth / 2 + 18, y: lineY }}
          end={{ x: canvasWidth - 110, y: lineY }}
          colors={['rgba(0,220,255,0.7)', 'transparent']}
        />
      </Line>

      {/* Mult — glow bleuté puis pass crisp */}
      <Text
        x={xMult}
        y={yMult}
        text={multText}
        color="rgba(0,220,255,0.55)"
        font={FONTS.multHUD}
        opacity={multOpacity}
      >
        <BlurMask blur={10} style="outer" />
      </Text>
      <Text
        x={xMult}
        y={yMult}
        text={multText}
        color={multColor}
        font={FONTS.multHUD}
        opacity={multOpacity}
      />
      {/* Double pass pour effet bold */}
      <Text
        x={xMult + 1}
        y={yMult}
        text={multText}
        color={multColor}
        font={FONTS.multHUD}
        opacity={multOpacity}
      />
    </>
  );
};
