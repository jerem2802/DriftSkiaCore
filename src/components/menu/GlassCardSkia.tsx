// src/components/menu/GlassCardSkia.tsx
import React from 'react';
import { Group, RoundedRect, LinearGradient, vec, BlurMask } from '@shopify/react-native-skia';
import type { Rect } from './menuLayout';

type Props = {
  rect: Rect;
  a: string;
  b: string;
  heavy?: boolean;
  glow?: string;
};

export const GlassCardSkia: React.FC<Props> = ({ rect, a, b, heavy, glow }) => {
  const outerStroke = heavy ? 2.5 : 1.5;
  const inset = heavy ? 4 : 3;
  const r = rect.r;

  const x1 = rect.x;
  const y1 = rect.y;
  const x2 = rect.x + rect.w;
  const y2 = rect.y + rect.h;

  return (
    <Group>
      {/* base tint */}
      <RoundedRect x={x1} y={y1} width={rect.w} height={rect.h} r={r}>
        <LinearGradient start={vec(x1, y1)} end={vec(x2, y2)} colors={[a, b]} />
      </RoundedRect>

      {/* inner glass */}
      <RoundedRect
        x={x1 + inset}
        y={y1 + inset}
        width={rect.w - inset * 2}
        height={rect.h - inset * 2}
        r={Math.max(0, r - inset)}
        color="rgba(0,0,0,0.38)"
      >
        <LinearGradient
          start={vec(x1, y1)}
          end={vec(x1, y2)}
          colors={['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.16)']}
        />
      </RoundedRect>

      {/* sheen */}
      <RoundedRect
        x={x1 + inset * 1.5}
        y={y1 + inset * 1.2}
        width={rect.w - inset * 3}
        height={rect.h * 0.22}
        r={Math.max(0, r - inset)}
      >
        <LinearGradient
          start={vec(x1, y1)}
          end={vec(x1, y1 + rect.h * 0.22)}
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.00)']}
        />
      </RoundedRect>

      {/* inner stroke */}
      <RoundedRect
        x={x1 + 10}
        y={y1 + 10}
        width={rect.w - 20}
        height={rect.h - 20}
        r={Math.max(0, r - 10)}
        style="stroke"
        strokeWidth={1}
        color="rgba(255,255,255,0.10)"
      />

      {/* glow (optional) */}
      {glow ? (
        <RoundedRect
          x={x1 + 2}
          y={y1 + 2}
          width={rect.w - 4}
          height={rect.h - 4}
          r={Math.max(0, r - 2)}
          style="stroke"
          strokeWidth={outerStroke * 2.4}
          color={glow}
        >
          <BlurMask blur={10} style="normal" />
        </RoundedRect>
      ) : null}

      {/* outer stroke */}
      <RoundedRect
        x={x1 + 1}
        y={y1 + 1}
        width={rect.w - 2}
        height={rect.h - 2}
        r={Math.max(0, r - 2)}
        style="stroke"
        strokeWidth={outerStroke}
        color="rgba(255,255,255,0.18)"
      />
    </Group>
  );
};