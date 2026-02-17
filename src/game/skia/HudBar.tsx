// src/game/skia/HudBar.tsx
// Barre HUD neon en fond — dessinée en premier (z-index bas)

import React from 'react';
import { RoundedRect } from '@shopify/react-native-skia';
import { HUD_BAR_Y, HUD_BAR_H, HUD_BAR_R } from '../../constants/layout';

type Props = { canvasWidth: number };

export const HudBar: React.FC<Props> = ({ canvasWidth }) => {
  const x = 8, y = HUD_BAR_Y, w = canvasWidth - 16, h = HUD_BAR_H, r = HUD_BAR_R;
  return (
    <>
      {/* Fond sombre */}
      <RoundedRect x={x} y={y} width={w} height={h} r={r} color="rgba(4,10,22,0.93)" />
      {/* Lueur cyan (couches décroissantes) */}
      <RoundedRect x={x} y={y} width={w} height={h} r={r} color="rgba(0,220,255,0.05)" style="stroke" strokeWidth={12} />
      <RoundedRect x={x} y={y} width={w} height={h} r={r} color="rgba(0,220,255,0.14)" style="stroke" strokeWidth={5} />
      {/* Bordure principale */}
      <RoundedRect x={x} y={y} width={w} height={h} r={r} color="rgba(0,220,255,0.82)" style="stroke" strokeWidth={1.5} />
    </>
  );
};
