// src/game/fx/CoinFxLayer.tsx
import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

type Props = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  opacity: SharedValue<number>; // 0|1
  r?: number;
  color?: string;
};

export const CoinFxLayer: React.FC<Props> = ({
  x,
  y,
  opacity,
  r = 12,
  color = '#fbbf24',
}) => {
  return (
    <Group opacity={opacity}>
      <Circle cx={x} cy={y} r={r} color={color} />
      <Circle cx={x} cy={y} r={r + 5} color={color} opacity={0.18} />
    </Group>
  );
};
