// src/components/collection/glasscard/GlassCardText.tsx
import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { Group, Text as SkiaText, matchFont } from '@shopify/react-native-skia';

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  rarityLabel: string;
  ballName: string;
  rarityColor: string;
};

// ✅ réglages indépendants (tilt “imprimé”)
const TOP_SKEW_X = 0.11;
const TOP_ROTATE = -0.035;

const BOT_SKEW_X = 0.065;
const BOT_ROTATE = -0.10;

// ✅ offsets X (tes valeurs)
const TOP_DX = 8;
const BOT_DX = -13;

// ✅ 3D / style
const EXTRUDE_STEPS = 3; // 2-4 ok
const EXTRUDE_DX = 1; // tranche vers la droite
const EXTRUDE_DY = 1; // tranche vers le bas
const DEPTH_COLOR = 'rgba(10, 0, 20, 0.65)';

const SHADOW_DY = 6;
const SHADOW_OPACITY = 0.35;

const NAME_GLOW_1 = '#a855f7';
const NAME_GLOW_2 = '#22d3ee';

export const GlassCardText: React.FC<Props> = ({
  x,
  y,
  width,
  height,
  rarityLabel,
  ballName,
  rarityColor,
}) => {
  const family = Platform.OS === 'android' ? 'sans-serif' : 'System';

  const fontRarity = useMemo(
    () => matchFont({ fontFamily: family, fontSize: 18, fontWeight: '900' }),
    [family]
  );
  const fontName = useMemo(
    () => matchFont({ fontFamily: family, fontSize: 28, fontWeight: '900' }),
    [family]
  );

  const name = ballName.toUpperCase();

  // placements (tes valeurs actuelles)
  const topSlotY = y + height * 0.232;
  const bottomPlateTop = y + height * 0.65;

  const cx = x + width / 2;
  const cy = y + height / 2;

  const rarityW = fontRarity?.getTextWidth(rarityLabel) ?? 0;
  const nameW = fontName?.getTextWidth(name) ?? 0;

  const topTransform = useMemo(
    () => [
      { translateX: cx },
      { translateY: cy },
      { skewX: TOP_SKEW_X },
      { rotate: TOP_ROTATE },
      { translateX: -cx },
      { translateY: -cy },
    ],
    [cx, cy]
  );

  const bottomTransform = useMemo(
    () => [
      { translateX: cx },
      { translateY: cy },
      { skewX: BOT_SKEW_X },
      { rotate: BOT_ROTATE },
      { translateX: -cx },
      { translateY: -cy },
    ],
    [cx, cy]
  );

  const render3DText = (
    text: string,
    font: any,
    baseX: number,
    baseY: number,
    faceColor: string,
    glowA: string,
    glowB: string
  ) => {
    if (!font) return null;

    // 1) soft drop shadow (décroche du fond)
    const shadow = (
      <SkiaText
        x={baseX}
        y={baseY + SHADOW_DY}
        text={text}
        font={font}
        color="#000"
        opacity={SHADOW_OPACITY}
      />
    );

    // 2) depth / tranche
    const depth = Array.from({ length: EXTRUDE_STEPS }, (_, i) => {
      const k = i + 1;
      return (
        <SkiaText
          key={`d-${k}`}
          x={baseX + EXTRUDE_DX * k}
          y={baseY + EXTRUDE_DY * k}
          text={text}
          font={font}
          color={DEPTH_COLOR}
          opacity={0.55 - i * 0.12}
        />
      );
    });

    // 3) glow (2 passes légères)
    const glow = (
      <>
        <SkiaText x={baseX} y={baseY} text={text} font={font} color={glowA} opacity={0.22} />
        <SkiaText x={baseX} y={baseY} text={text} font={font} color={glowB} opacity={0.14} />
      </>
    );

    // 4) highlights (vernis / chrome)
    const highlights = (
      <>
        <SkiaText x={baseX - 2} y={baseY - 1} text={text} font={font} color="#ffffff" opacity={0.18} />
        <SkiaText x={baseX - 1} y={baseY - 2} text={text} font={font} color="#ffffff" opacity={0.10} />
      </>
    );

    // 5) face
    const face = <SkiaText x={baseX} y={baseY} text={text} font={font} color={faceColor} />;

    return (
      <>
        {shadow}
        {depth}
        {glow}
        {highlights}
        {face}
      </>
    );
  };

  // positions
  const rarityX = cx - rarityW / 2 + TOP_DX;
  const rarityY = topSlotY;

  const nameX = cx - nameW / 2 + BOT_DX;
  const nameY = bottomPlateTop + height * 0.055;

  return (
    <>
      {/* TOP: RARITY */}
      <Group transform={topTransform}>
        {render3DText(rarityLabel, fontRarity, rarityX, rarityY, '#FFD700', rarityColor, '#ffffff')}
      </Group>

      {/* BOTTOM: NAME */}
      <Group transform={bottomTransform}>
        {render3DText(name, fontName, nameX, nameY, '#E8E8FF', NAME_GLOW_1, NAME_GLOW_2)}
      </Group>
    </>
  );
};
