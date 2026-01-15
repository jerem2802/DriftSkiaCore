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

// ✅ offsets X (décalage à droite)
const TOP_DX = 8;
const BOT_DX = -13;

export const GlassCardText: React.FC<Props> = ({
  x,
  y,
  width,
  height,
  rarityLabel,
  ballName,
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

  const topTransform = useMemo(() => {
    return [
      { translateX: cx },
      { translateY: cy },
      { skewX: TOP_SKEW_X },
      { rotate: TOP_ROTATE },
      { translateX: -cx },
      { translateY: -cy },
    ];
  }, [cx, cy]);

  const bottomTransform = useMemo(() => {
    return [
      { translateX: cx },
      { translateY: cy },
      { skewX: BOT_SKEW_X },
      { rotate: BOT_ROTATE },
      { translateX: -cx },
      { translateY: -cy },
    ];
  }, [cx, cy]);

  return (
    <>
      {/* TOP: RARE */}
      <Group transform={topTransform}>
        {fontRarity && (
          <SkiaText
            x={cx - rarityW / 2 + TOP_DX}
            y={topSlotY}
            text={rarityLabel}
            font={fontRarity}
            color="#FFD700"
          />
        )}
      </Group>

      {/* BOTTOM: NAME */}
      <Group transform={bottomTransform}>
        {fontName && (
          <SkiaText
            x={cx - nameW / 2 + BOT_DX}
            y={bottomPlateTop + height * 0.055}
            text={name}
            font={fontName}
            color="#E8E8FF"
          />
        )}
      </Group>
    </>
  );
};
