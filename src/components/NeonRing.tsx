// src/components/NeonRing.tsx

import React from 'react';
import { Circle, BlurMask } from '@shopify/react-native-skia';
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
      {/* Projection ambiante — tube fin, blur énorme = lumière projetée sur le fond */}
      <Circle cx={cx} cy={cy} r={r} strokeWidth={3} style="stroke" color={outerColor} opacity={0.18}>
        <BlurMask blur={28} style="solid" />
      </Circle>

      {/* Halo coloré moyen — émission directe autour du tube */}
      <Circle cx={cx} cy={cy} r={r} strokeWidth={3} style="stroke" color={midColor} opacity={0.50}>
        <BlurMask blur={7} style="solid" />
      </Circle>

      {/* Tube néon — corps coloré légèrement flou */}
      <Circle cx={cx} cy={cy} r={r} strokeWidth={2.5} style="stroke" color={mainColor} opacity={0.95}>
        <BlurMask blur={1.2} style="solid" />
      </Circle>

      {/* Filament — cœur blanc chaud, net */}
      <Circle cx={cx} cy={cy} r={r} strokeWidth={1.2} style="stroke" color="white" opacity={0.85} />
    </>
  );
};
