// src/components/menu/MenuWatchAdButtonsSkia.tsx
import React from 'react';
import { Group, Path, Skia, Text, BlurMask, RoundedRect } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';
import { matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

type Props = {
  layout: MenuLayout;
  bronzeStatus: 'locked' | 'countdown' | 'ready';
  silverStatus: 'locked' | 'countdown' | 'ready';
  neonStatus: 'locked' | 'countdown' | 'ready';
  isPremium?: boolean;
};

export const MenuWatchAdButtonsSkia: React.FC<Props> = ({ layout, bronzeStatus, silverStatus, neonStatus, isPremium = false }) => {
  if (isPremium) return null;
  const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });
  const watchFont = matchFont({
    fontFamily,
    fontSize: layout.font.labelSmall * 1.5,
    fontWeight: '900',
  });

  const watchAdRect = (type: 'bronze' | 'silver' | 'neon') => {
    const card = type === 'bronze' ? layout.chestRowBronzeRect : type === 'silver' ? layout.chestRowSilverRect : layout.chestRowNeonRect;
    return {
      x: card.x,
      y: card.y + card.h + layout.H * 0.012,
      w: card.w,
      h: layout.H * 0.045,
      r: card.r,
    };
  };

  const getColors = (type: 'bronze' | 'silver' | 'neon') => {
    if (type === 'bronze') {
      return {
        glow: 'rgba(245, 158, 11, 0.6)',
        border: 'rgba(251, 191, 36, 0.9)',
        text: 'rgba(251, 191, 36, 1.0)',
      };
    }
    if (type === 'silver') {
      return {
        glow: 'rgba(59, 130, 246, 0.6)',
        border: 'rgba(96, 165, 250, 0.9)',
        text: 'rgba(96, 165, 250, 1.0)',
      };
    }
    return {
      glow: 'rgba(34, 197, 94, 0.6)',
      border: 'rgba(74, 222, 128, 0.9)',
      text: 'rgba(74, 222, 128, 1.0)',
    };
  };

  const renderPlayIcon = (x: number, y: number, size: number, color: string) => {
    const path = Skia.Path.Make();
    const offset = size * 0.15;

    path.moveTo(x - offset, y - size * 0.3);
    path.lineTo(x + size * 0.4, y);
    path.lineTo(x - offset, y + size * 0.3);
    path.close();

    return <Path path={path} color={color} />;
  };

  const renderWatchButton = (type: 'bronze' | 'silver' | 'neon') => {
    const rect = watchAdRect(type);
    const colors = getColors(type);
    const iconX = rect.x + rect.w * 0.20;
    const iconY = rect.y + rect.h * 0.5;
    const iconSize = rect.h * 0.9;
    const textX = rect.x + rect.w * 0.40;

    return (
      <Group key={`watch-${type}`}>
        {/* Glow externe */}
        <RoundedRect x={rect.x} y={rect.y} width={rect.w} height={rect.h} r={rect.r} color={colors.glow}>
          <BlurMask blur={12} style="solid" />
        </RoundedRect>

        {/* Fond noir transparent */}
        <RoundedRect x={rect.x} y={rect.y} width={rect.w} height={rect.h} r={rect.r} color="rgba(0, 0, 0, 0.80)" />

        {/* Bordure colorée */}
        <RoundedRect
          x={rect.x}
          y={rect.y}
          width={rect.w}
          height={rect.h}
          r={rect.r}
          style="stroke"
          strokeWidth={2}
          color={colors.border}
        />

        {/* Icône play */}
        {renderPlayIcon(iconX, iconY, iconSize, colors.text)}

        {/* Texte "Ad -3h" avec ombre */}
        <Text
          x={textX + 1}
          y={rect.y + rect.h * 0.68 + 1}
          text="Ad -3h"
          font={watchFont}
          color="rgba(0, 0, 0, 0.7)"
        />

        {/* Texte "Ad -3h" principal */}
        <Text
          x={textX}
          y={rect.y + rect.h * 0.68}
          text="Ad -3h"
          font={watchFont}
          color={colors.text}
        />
      </Group>
    );
  };

  return (
    <Group>
      {bronzeStatus === 'countdown' && renderWatchButton('bronze')}
      {silverStatus === 'countdown' && renderWatchButton('silver')}
      {neonStatus === 'countdown' && renderWatchButton('neon')}
    </Group>
  );
};