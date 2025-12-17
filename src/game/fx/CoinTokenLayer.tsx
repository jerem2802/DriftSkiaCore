// src/game/fx/CoinTokenLayer.tsx
// Rendu simple d'un coin-orb (la logique/animation reste dans useCoinOrbSystem)

import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

type Props = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  opacity: SharedValue<number>;
  r?: number;
  color?: string;
};

export const CoinTokenLayer: React.FC<Props> = ({
  x,
  y,
  opacity,
  r = 12,
  color = '#fbbf24',
}) => {
  return (
    <Group opacity={opacity}>
      {/* core */}
      <Circle cx={x} cy={y} r={r} color={color} />
      {/* soft glow */}
      <Circle cx={x} cy={y} r={r + 5} color={color} opacity={0.18} />
    </Group>
  );
};
