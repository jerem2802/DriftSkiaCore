// src/game/skia/ShieldIcon.tsx
// Bouclier Skia Path, opacité pilotée par SharedValue

import React from 'react';
import { Group, Path } from '@shopify/react-native-skia';
import { Skia } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

// Bouclier dans une boîte naturelle 32×32
const SHIELD_PATH = Skia.Path.MakeFromSVGString(
  'M16 31C7 27 1.5 20 1.5 13L1.5 4.5 16 1.5 30.5 4.5 30.5 13C30.5 20 25 27 16 31Z'
)!;

const NATURAL_SIZE = 32;

// Accepte SharedValue<number> ET DerivedValue<T extends number> (lit. types)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = {
  cx: number;
  cy: number;
  size?: number;
  opacity: SharedValue<number> | SharedValue<any>;
};

export const ShieldIcon: React.FC<Props> = ({ cx, cy, size = 15, opacity }) => {
  const s = size / NATURAL_SIZE;
  const tx = cx - size / 2;
  const ty = cy - size / 2;

  return (
    <Group transform={[{ translateX: tx }, { translateY: ty }, { scale: s }]}>
      <Path path={SHIELD_PATH} color="#22d3ee" opacity={opacity} />
    </Group>
  );
};
