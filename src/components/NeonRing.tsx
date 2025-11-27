// src/components/NeonRing.tsx

import React from 'react';
import { Circle } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

interface NeonRingProps {
  cx: SharedValue<number>;
  cy: SharedValue<number>;
  r: SharedValue<number>;
  outerColor: SharedValue<string>;
  midColor: SharedValue<string>;
  mainColor: SharedValue<string>;
}

export const NeonRing: React.FC<NeonRingProps> = ({
  cx,
  cy,
  r,
  outerColor,
  midColor,
  mainColor,
}) => {
  return (
    <>
      {/* Outer glow */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth={4}
        style="stroke"
        color={outerColor}
        opacity={0.2}
      />
      {/* Mid glow */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth={8}
        style="stroke"
        color={midColor}
        opacity={0.3}
      />
      {/* Main ring */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth={3}
        style="stroke"
        color={mainColor}
      />
    </>
  );
};