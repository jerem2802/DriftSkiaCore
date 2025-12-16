// src/components/MiniNeonOrb.tsx
import React from 'react';
import { Circle, Group } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

type Value<T> = { value: T }; // accepte SharedValue et DerivedValue

type Props = {
  cx: Value<number>;
  cy: Value<number>;
  opacity: Value<number>; // 0..1
  color: string;          // "#22d3ee", "#8b5cf6", ...
  r?: number;             // rayon du mini-ring
};

export const MiniNeonOrb: React.FC<Props> = ({ cx, cy, opacity, color, r = 8 }) => {
  // Opacités dérivées (0 alloc en boucle chaude, Skia lit des valeurs animables)
  const outerOpacity = useDerivedValue(() => opacity.value * 0.18);
  const midOpacity = useDerivedValue(() => opacity.value * 0.28);
  const mainOpacity = useDerivedValue(() => opacity.value);

  // Pour donner un halo qui “déborde” légèrement
  const outerR = r + 1.6;
  const midR = r + 0.9;
  const mainR = r;

  return (
    <Group blendMode="plus">
      {/* Outer glow */}
      <Circle
        cx={cx}
        cy={cy}
        r={outerR}
        style="stroke"
        strokeWidth={5.5}
        color={color}
        opacity={outerOpacity}
      />

      {/* Mid glow */}
      <Circle
        cx={cx}
        cy={cy}
        r={midR}
        style="stroke"
        strokeWidth={3.8}
        color={color}
        opacity={midOpacity}
      />

      {/* Main mini-ring */}
      <Circle
        cx={cx}
        cy={cy}
        r={mainR}
        style="stroke"
        strokeWidth={6}
        color={color}
        opacity={mainOpacity}
      />
    </Group>
  );
};
