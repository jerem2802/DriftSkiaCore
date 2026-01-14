// src/components/menu/MenuChestsCardsSkia.tsx
import React from 'react';
import { Group, RoundedRect, LinearGradient, vec, Line } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';

type Props = {
  layout: MenuLayout;
  bronzeStatus: 'locked' | 'countdown' | 'ready';
  silverStatus: 'locked' | 'countdown' | 'ready';
  neonStatus: 'locked' | 'countdown' | 'ready';
};

export const MenuChestsCardsSkia: React.FC<Props> = ({ layout, bronzeStatus, silverStatus, neonStatus }) => {
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
      >
        <LinearGradient
          start={vec(bronze.x, bronze.y)}
          end={vec(bronze.x, bronze.y + bronze.h)}
          colors={['rgba(120, 70, 20, 0.25)', 'rgba(60, 35, 10, 0.45)']}
        />
      </RoundedRect>
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

      {/* Trait séparateur bronze (si countdown ou ready) */}
      {(bronzeStatus === 'countdown' || bronzeStatus === 'ready') && (
        <Line
          p1={vec(bronze.x + bronze.w * 0.08, bronze.y + bronze.h * 0.18)}
          p2={vec(bronze.x + bronze.w * 0.92, bronze.y + bronze.h * 0.18)}
          strokeWidth={1.5}
          color="rgba(245, 158, 11, 0.4)"
        />
      )}

      {/* Silver Card */}
      <RoundedRect
        x={silver.x}
        y={silver.y}
        width={silver.w}
        height={silver.h}
        r={silver.r}
      >
        <LinearGradient
          start={vec(silver.x, silver.y)}
          end={vec(silver.x, silver.y + silver.h)}
          colors={['rgba(30, 60, 120, 0.25)', 'rgba(15, 30, 60, 0.45)']}
        />
      </RoundedRect>
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

      {/* Trait séparateur silver */}
      {(silverStatus === 'countdown' || silverStatus === 'ready') && (
        <Line
          p1={vec(silver.x + silver.w * 0.08, silver.y + silver.h * 0.18)}
          p2={vec(silver.x + silver.w * 0.92, silver.y + silver.h * 0.18)}
          strokeWidth={1.5}
          color="rgba(59, 130, 246, 0.4)"
        />
      )}

      {/* Neon Card */}
      <RoundedRect
        x={neon.x}
        y={neon.y}
        width={neon.w}
        height={neon.h}
        r={neon.r}
      >
        <LinearGradient
          start={vec(neon.x, neon.y)}
          end={vec(neon.x, neon.y + neon.h)}
          colors={['rgba(20, 100, 50, 0.25)', 'rgba(10, 50, 25, 0.45)']}
        />
      </RoundedRect>
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

      {/* Trait séparateur neon */}
      {(neonStatus === 'countdown' || neonStatus === 'ready') && (
        <Line
          p1={vec(neon.x + neon.w * 0.08, neon.y + neon.h * 0.18)}
          p2={vec(neon.x + neon.w * 0.92, neon.y + neon.h * 0.18)}
          strokeWidth={1.5}
          color="rgba(34, 197, 94, 0.4)"
        />
      )}
    </Group>
  );
};