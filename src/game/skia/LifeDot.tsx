// src/game/skia/LifeDot.tsx
// Dot de vie 100% Skia, piloté par SharedValue (zéro React state)

import React from 'react';
import { Circle } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

type Props = {
  x: number;
  y: number;
  index: number; // 0..LIVES_MAX-1
  lives: SharedValue<number>;
  r?: number;
};

export const LifeDot: React.FC<Props> = ({ x, y, index, lives, r = 7 }) => {
  const redOpacity = useDerivedValue(() => (lives.value >= index + 1 ? 1 : 0));

  return (
    <>
      <Circle cx={x} cy={y} r={r} color="#334155" />
      <Circle cx={x} cy={y} r={r} color="#ef4444" opacity={redOpacity} />
    </>
  );
};
