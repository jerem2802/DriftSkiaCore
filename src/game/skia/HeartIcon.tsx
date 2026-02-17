// src/game/skia/HeartIcon.tsx
// Cœur Skia Path, opacité pilotée par SharedValue (vies)

import React from 'react';
import { Group, Path } from '@shopify/react-native-skia';
import { Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

// Cœur dans une boîte naturelle 32×28
const HEART_PATH = Skia.Path.MakeFromSVGString(
  'M16 28C15.85 27.9 0 17.2 0 10.7 0 4.8 4.5 0 10 0 13 0 15.7 1.4 16 2.1 16.3 1.4 19 0 22 0 27.5 0 32 4.8 32 10.7 32 17.2 16.15 27.9 16 28Z'
)!;

const NATURAL_W = 32;
const NATURAL_H = 28;

type Props = {
  cx: number;
  cy: number;
  size?: number;   // hauteur visuelle en px
  index: number;   // 0-based (0 = cœur le plus à droite)
  lives: SharedValue<number>;
};

export const HeartIcon: React.FC<Props> = ({ cx, cy, size = 18, index, lives }) => {
  const s = size / NATURAL_H;
  const tx = cx - (NATURAL_W * s) / 2;
  const ty = cy - (NATURAL_H * s) / 2;

  // Plein si vie dispo, estompé si perdu
  const opacity = useDerivedValue(() => (lives.value >= index + 1 ? 1 : 0.15));

  return (
    <Group transform={[{ translateX: tx }, { translateY: ty }, { scale: s }]}>
      <Path path={HEART_PATH} color="#ef4444" opacity={opacity} />
    </Group>
  );
};
