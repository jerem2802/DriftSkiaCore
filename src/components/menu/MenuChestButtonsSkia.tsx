// src/components/menu/MenuChestButtonsSkia.tsx
import React from 'react';
import { Group, Path, Skia, Text, BlurMask, LinearGradient, vec } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';
import { matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

type ChestStatus = 'locked' | 'countdown' | 'ready';

type Props = {
  layout: MenuLayout;
  bronzeStatus: ChestStatus;
  silverStatus: ChestStatus;
  neonStatus: ChestStatus;
};

export const MenuChestButtonsSkia: React.FC<Props> = ({ layout, bronzeStatus, silverStatus, neonStatus }) => {
  const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });
  const buttonFont = matchFont({
    fontFamily,
    fontSize: layout.font.chestButton,
    fontWeight: '900',
  });

  const createButtonPath = (rect: { x: number; y: number; w: number; h: number }) => {
    const path = Skia.Path.Make();
    const cut = rect.h * 0.30;

    path.moveTo(rect.x + cut, rect.y);
    path.lineTo(rect.x + rect.w - cut, rect.y);
    path.lineTo(rect.x + rect.w, rect.y + cut);
    path.lineTo(rect.x + rect.w, rect.y + rect.h - cut);
    path.lineTo(rect.x + rect.w - cut, rect.y + rect.h);
    path.lineTo(rect.x + cut, rect.y + rect.h);
    path.lineTo(rect.x, rect.y + rect.h - cut);
    path.lineTo(rect.x, rect.y + cut);
    path.close();

    return path;
  };

  const getButtonLabel = (status: ChestStatus) => {
    if (status === 'ready') {
      return 'OPEN';
    }
    if (status === 'countdown') {
      return 'Unlocked';
    }
    return 'Unlock';
  };

  const getButtonColors = (type: 'bronze' | 'silver' | 'neon') => {
    if (type === 'bronze') {
      return {
        grad: ['rgba(255, 200, 50, 0.75)', 'rgba(255, 140, 0, 0.85)'],
        border: 'rgba(255, 220, 100, 1.0)',
        glow: 'rgba(255, 160, 20, 0.9)',
      };
    }
    if (type === 'silver') {
      return {
        grad: ['rgba(100, 180, 255, 0.75)', 'rgba(40, 120, 255, 0.85)'],
        border: 'rgba(150, 200, 255, 1.0)',
        glow: 'rgba(60, 140, 255, 0.9)',
      };
    }
    return {
      grad: ['rgba(80, 230, 130, 0.75)', 'rgba(30, 200, 80, 0.85)'],
      border: 'rgba(140, 255, 180, 1.0)',
      glow: 'rgba(40, 210, 100, 0.9)',
    };
  };

  const renderButton = (
    rect: { x: number; y: number; w: number; h: number },
    status: ChestStatus,
    type: 'bronze' | 'silver' | 'neon'
  ) => {
    const btnPath = createButtonPath(rect);
    const colors = getButtonColors(type);
    const label = getButtonLabel(status);
    const textWidth = label.length * layout.font.chestButton * 0.55;
    const textX = rect.x + (rect.w - textWidth) / 2;

    return (
      <Group key={type}>
        {/* Glow externe FORT */}
        <Path path={btnPath} color={colors.glow}>
          <BlurMask blur={20} style="solid" />
        </Path>

        {/* Fond LUMINEUX et SATURÉ */}
        <Path path={btnPath}>
          <LinearGradient
            start={vec(rect.x, rect.y)}
            end={vec(rect.x, rect.y + rect.h)}
            colors={colors.grad}
          />
        </Path>

        {/* Bordure lumineuse épaisse */}
        <Path
          path={btnPath}
          style="stroke"
          strokeWidth={3.5}
          color={colors.border}
        />

        {/* Texte avec ombre */}
        <Text
          x={textX + 2}
          y={rect.y + rect.h * 0.68 + 2}
          text={label}
          font={buttonFont}
          color="rgba(0, 0, 0, 0.7)"
        />

        {/* Texte principal */}
        <Text
          x={textX}
          y={rect.y + rect.h * 0.68}
          text={label}
          font={buttonFont}
          color="#ffffff"
        />
      </Group>
    );
  };

  return (
    <Group>
      {renderButton(layout.chestBronzeButtonRect, bronzeStatus, 'bronze')}
      {renderButton(layout.chestSilverButtonRect, silverStatus, 'silver')}
      {renderButton(layout.chestNeonButtonRect, neonStatus, 'neon')}
    </Group>
  );
};