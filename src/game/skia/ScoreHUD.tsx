import React from 'react';
import { Text } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { FONTS } from '../../utils/fonts';

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
yScore = 44,
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

const xScore = canvasWidth / 2 - 30;
const xMult = canvasWidth / 2 - 22;
const yMult = yScore + 44;

const boldOffset = 1;

return (
<>
<Text x={xScore} y={yScore} text={scoreText} color="white" font={FONTS.scoreHUD} />

<Text
x={xMult}
y={yMult}
text={multText}
color={multColor}
font={FONTS.multHUD}
opacity={multOpacity}
/>
<Text
x={xMult + boldOffset}
y={yMult}
text={multText}
color={multColor}
font={FONTS.multHUD}
opacity={multOpacity}
/>
</>
);
};