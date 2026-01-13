// src/components/profile/CollectionCardSkia.tsx
import React, { useMemo } from 'react';
import {
  Group,
  RoundedRect,
  Circle,
  Blur,
  Text as SkiaText,
  Paint,
  Shader,
  Skia,
  type SkFont,
} from '@shopify/react-native-skia';

import { CARD_PLATE_SHADER } from './shaders/collectionCardShaders';

import { BallPreviewNode } from '../shop/BallPreviewNode';

type Ball = {
  id: string;
  name: string;
  desc?: string;
  price?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
};

type RarityInfo = { label: string; color: string } | null;

type Fonts = {
  fontName: SkFont;
  fontDesc: SkFont;
  fontBadge: SkFont;
  fontBtn: SkFont;
  fontSub: SkFont;
};

type Props = {
  x: number;
  y: number;
  w: number;
  h: number;

  ball: Ball;
  rarity: RarityInfo;

  owned: boolean;
  equipped: boolean;

  accent: string;  // '#rrggbb'
  accent2: string; // '#rrggbb'

  fonts?: Fonts;
  time: any; // Reanimated SharedValue ok (BallPreviewNode)
};

const trunc = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1)}…`);

const hexToRgb01 = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return [r, g, b];
};

const Screw: React.FC<{ cx: number; cy: number; r: number; tint: string }> = ({ cx, cy, r, tint }) => (
  <Group>
    <Circle cx={cx} cy={cy} r={r} color="#000" opacity={0.35}>
      <Blur blur={6} />
    </Circle>
    <Circle cx={cx} cy={cy} r={r} color="#0b0614" />
    <Circle cx={cx} cy={cy} r={r} color={tint} opacity={0.14} />
    <Circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.35} color="#fff" opacity={0.08} />
    <RoundedRect x={cx - r * 0.65} y={cy - 0.8} width={r * 1.3} height={1.6} r={0.8} color="#ffffff" opacity={0.14} />
  </Group>
);

export const CollectionCardSkia: React.FC<Props> = ({
  x,
  y,
  w,
  h,
  ball,
  rarity,
  owned,
  equipped,
  accent,
  accent2,
  fonts,
  time,
}) => {
  const border = equipped ? '#22c55e' : accent;

  const effect = useMemo(() => Skia.RuntimeEffect.Make(CARD_PLATE_SHADER)!, []);
  const accentRgb = useMemo(() => hexToRgb01(border), [border]);

  // ⚠️ pas de useClockValue/useComputedValue (pas dispo chez toi)
  // => shader statique pour l’instant, mais previews restent animées via `time`
  const uniforms = useMemo(
    () => ({
      u_size: [w, h],
      u_time: 0,
      u_accent: accentRgb,
      u_intensity: equipped ? 1.0 : 0.85,
    }),
    [w, h, accentRgb, equipped]
  );

  const windowX = x + 12;
  const windowY = y + 14;
  const windowS = 132;

  const orbX = windowX + windowS / 2;
  const orbY = windowY + windowS / 2;

  const titleX = x + 160;

  const btnW = 110;
  const btnH = 38;
  const btnX = x + w - 14 - btnW;
  const btnY = y + h - 14 - btnH;

  const label = equipped ? 'EQUIPPED' : owned ? 'EQUIP' : 'LOCKED';
  const btnBg = equipped ? '#22c55e22' : owned ? `${accent}22` : '#2a2a3a55';
  const btnStroke = equipped ? '#22c55e' : owned ? accent : '#3b3b55';
  const btnText = equipped ? '#22c55e' : owned ? accent : '#8a88a3';

  return (
    <Group>
      <RoundedRect x={x - 2} y={y - 2} width={w + 4} height={h + 4} r={22} color={border} opacity={equipped ? 0.22 : 0.14}>
        <Blur blur={18} />
      </RoundedRect>

      <RoundedRect x={x} y={y} width={w} height={h} r={20}>
        <Paint>
          <Shader source={effect} uniforms={uniforms} />
        </Paint>
      </RoundedRect>

      <RoundedRect x={x + 2} y={y + 2} width={w - 4} height={26} r={18} color="#fff" opacity={0.05} />

      <RoundedRect x={x} y={y} width={w} height={h} r={20} style="stroke" strokeWidth={2} color={border} opacity={0.95} />
      <RoundedRect x={x + 2} y={y + 2} width={w - 4} height={h - 4} r={18} style="stroke" strokeWidth={1} color="#fff" opacity={0.06} />

      <Screw cx={x + 16} cy={y + 16} r={7} tint={border} />
      <Screw cx={x + w - 16} cy={y + 16} r={7} tint={border} />
      <Screw cx={x + 16} cy={y + h - 16} r={7} tint={border} />
      <Screw cx={x + w - 16} cy={y + h - 16} r={7} tint={border} />

      {/* Preview window: carré (pas rond) */}
      <RoundedRect x={windowX} y={windowY} width={windowS} height={windowS} r={18} color="#05000a" opacity={0.92} />
      <RoundedRect x={windowX} y={windowY} width={windowS} height={windowS} r={18} style="stroke" strokeWidth={1} color="#fff" opacity={0.06} />

      <Circle cx={orbX} cy={orbY} r={58} color={accent2} opacity={0.10}>
        <Blur blur={18} />
      </Circle>

      {/* Preview toujours visible */}
      <BallPreviewNode ballId={ball.id} cx={orbX} cy={orbY} size={104} time={time} />

      {!owned && (
        <Group>
          <RoundedRect x={windowX} y={windowY} width={windowS} height={windowS} r={18} color="#000" opacity={0.40} />
          <RoundedRect x={windowX + 24} y={windowY + 92} width={84} height={28} r={14} color="#000" opacity={0.35} />
          <RoundedRect x={windowX + 24} y={windowY + 92} width={84} height={28} r={14} style="stroke" strokeWidth={1} color={border} opacity={0.45} />
          {!!fonts && <SkiaText x={windowX + 40} y={windowY + 112} text="LOCKED" font={fonts.fontBtn} color={border} />}
        </Group>
      )}

      {!!fonts && (
        <>
          <SkiaText x={titleX} y={y + 40} text={trunc(ball.name ?? '', 22)} font={fonts.fontName} color={owned ? '#fff' : '#8a88a3'} />

          {rarity && (
            <Group>
              <RoundedRect x={titleX} y={y + 50} width={112} height={22} r={10} color="#000" opacity={0.25} />
              <RoundedRect x={titleX} y={y + 50} width={112} height={22} r={10} style="stroke" strokeWidth={1} color={rarity.color} opacity={0.55} />
              <SkiaText x={titleX + 10} y={y + 66} text={rarity.label} font={fonts.fontBadge} color={rarity.color} />
            </Group>
          )}

          <SkiaText x={titleX} y={y + 94} text={trunc(ball.desc ?? '...', 62)} font={fonts.fontDesc} color="#c7c6d6" />

          {ball.price !== undefined && (
            <Group>
              <Circle cx={titleX + 6} cy={y + 120} r={6} color="#fbbf24" />
              <Circle cx={titleX + 6} cy={y + 120} r={8} color="#fbbf24" opacity={0.18}>
                <Blur blur={6} />
              </Circle>
              <SkiaText x={titleX + 20} y={y + 124} text={`${ball.price}`} font={fonts.fontSub} color="#fbbf24" />
            </Group>
          )}

          <RoundedRect x={btnX} y={btnY} width={btnW} height={btnH} r={12} color="#000" opacity={0.35} />
          <RoundedRect x={btnX} y={btnY} width={btnW} height={btnH} r={12} color={btnBg} />
          <RoundedRect x={btnX} y={btnY} width={btnW} height={btnH} r={12} style="stroke" strokeWidth={2} color={btnStroke} />
          <SkiaText x={btnX + 18} y={btnY + 25} text={label} font={fonts.fontBtn} color={btnText} />
        </>
      )}
    </Group>
  );
};
