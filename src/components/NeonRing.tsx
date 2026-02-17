// src/components/NeonRing.tsx
// Neon ring : cercles concentriques serrés + 1 couche BlurMask pour l'ambiance

import React from 'react';
import { Circle, BlurMask } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
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
  cx, cy, r, outerColor, midColor, mainColor,
}) => {
  // Halo extérieur
  const rO3 = useDerivedValue(() => r.value + 14);
  const rO2 = useDerivedValue(() => r.value + 7);
  const rO1 = useDerivedValue(() => r.value + 2);

  // Halo intérieur
  const rI1 = useDerivedValue(() => r.value - 2);
  const rI2 = useDerivedValue(() => r.value - 7);

  return (
    <>
      {/* ── Projection ambiante ── */}
      <Circle cx={cx} cy={cy} r={r} strokeWidth={2} style="stroke" color={mainColor} opacity={0.10}>
        <BlurMask blur={16} style="solid" />
      </Circle>

      {/* ── Halo extérieur ── */}
      <Circle cx={cx} cy={cy} r={rO3} strokeWidth={1}   style="stroke" color={outerColor} opacity={0.07} />
      <Circle cx={cx} cy={cy} r={rO2} strokeWidth={1.5} style="stroke" color={midColor}   opacity={0.14} />
      <Circle cx={cx} cy={cy} r={rO1} strokeWidth={2}   style="stroke" color={mainColor}  opacity={0.28} />

      {/* ── Tube néon — corps principal coloré ── */}
      <Circle cx={cx} cy={cy} r={r} strokeWidth={2.5} style="stroke" color={mainColor} opacity={0.98} />

      {/* ── Halo intérieur ── */}
      <Circle cx={cx} cy={cy} r={rI1} strokeWidth={2}   style="stroke" color={mainColor} opacity={0.24} />
      <Circle cx={cx} cy={cy} r={rI2} strokeWidth={1.5} style="stroke" color={midColor}  opacity={0.12} />

      {/* ── Filament — cœur blanc chaud ── */}
      <Circle cx={cx} cy={cy} r={r} strokeWidth={1} style="stroke" color="white" opacity={0.88} />
    </>
  );
};
