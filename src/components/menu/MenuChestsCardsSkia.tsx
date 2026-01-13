// src/components/menu/MenuChestsCardsSkia.tsx
import React from 'react';
import { Group, RoundedRect, LinearGradient, vec } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';

type Props = { layout: MenuLayout };

export const MenuChestsCardsSkia: React.FC<Props> = ({ layout }) => {
  const bronze = layout.chestRowBronzeRect;
  const silver = layout.chestRowSilverRect;
  const neon = layout.chestRowNeonRect;

  return (
    <Group>
      {/* Bronze Card */}
      <RoundedRect
        x={bronze.x}
        y={bronze.y}
        width={bronze.w}
        height={bronze.h}
        r={bronze.r}
        color="rgba(20, 16, 12, 0.85)"
      />
      <RoundedRect
        x={bronze.x + 1}
        y={bronze.y + 1}
        width={bronze.w - 2}
        height={bronze.h - 2}
        r={Math.max(0, bronze.r - 1)}
        style="stroke"
        strokeWidth={2.5}
      >
        <LinearGradient
          start={vec(bronze.x, bronze.y)}
          end={vec(bronze.x + bronze.w, bronze.y + bronze.h)}
          colors={['rgba(245, 158, 11, 0.85)', 'rgba(217, 119, 6, 0.65)']}
        />
      </RoundedRect>

      {/* Silver Card */}
      <RoundedRect
        x={silver.x}
        y={silver.y}
        width={silver.w}
        height={silver.h}
        r={silver.r}
        color="rgba(12, 16, 24, 0.85)"
      />
      <RoundedRect
        x={silver.x + 1}
        y={silver.y + 1}
        width={silver.w - 2}
        height={silver.h - 2}
        r={Math.max(0, silver.r - 1)}
        style="stroke"
        strokeWidth={2.5}
      >
        <LinearGradient
          start={vec(silver.x, silver.y)}
          end={vec(silver.x + silver.w, silver.y + silver.h)}
          colors={['rgba(59, 130, 246, 0.85)', 'rgba(37, 99, 235, 0.65)']}
        />
      </RoundedRect>

      {/* Neon Card */}
      <RoundedRect
        x={neon.x}
        y={neon.y}
        width={neon.w}
        height={neon.h}
        r={neon.r}
        color="rgba(6, 20, 12, 0.85)"
      />
      <RoundedRect
        x={neon.x + 1}
        y={neon.y + 1}
        width={neon.w - 2}
        height={neon.h - 2}
        r={Math.max(0, neon.r - 1)}
        style="stroke"
        strokeWidth={2.5}
      >
        <LinearGradient
          start={vec(neon.x, neon.y)}
          end={vec(neon.x + neon.w, neon.y + neon.h)}
          colors={['rgba(34, 197, 94, 0.85)', 'rgba(22, 163, 74, 0.65)']}
        />
      </RoundedRect>
    </Group>
  );
};