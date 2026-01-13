// src/components/menu/MenuTopBarSkia.tsx
import React from 'react';
import { Group, Circle, RoundedRect, Text, Image, useImage } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';
import { FONTS } from '../../utils/fonts';

type MenuTopBarSkiaProps = {
  layout: MenuLayout;
  coins: number;
};

export const MenuTopBarSkia: React.FC<MenuTopBarSkiaProps> = ({ layout, coins }) => {
  const formatCoins = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  const settingsIcon = useImage(require('../../assets/images/settings.png'));

  return (
    <Group>
      {/* PILL PLAYER */}
      <RoundedRect
        x={layout.playerNameRect.x}
        y={layout.playerNameRect.y}
        width={layout.playerNameRect.w}
        height={layout.playerNameRect.h}
        r={layout.playerNameRect.r}
        color="rgba(30, 41, 59, 0.85)"
      />

      <RoundedRect
        x={layout.playerNameRect.x + 2}
        y={layout.playerNameRect.y + 2}
        width={layout.playerNameRect.w - 4}
        height={layout.playerNameRect.h - 4}
        r={Math.max(0, layout.playerNameRect.r - 2)}
        style="stroke"
        strokeWidth={2.5}
        color="rgba(139, 92, 246, 0.75)"
      />

      {/* AVATAR */}
      <Circle
        cx={layout.avatarRect.x + layout.avatarRect.w / 2}
        cy={layout.avatarRect.y + layout.avatarRect.h / 2}
        r={layout.avatarRect.w / 2}
        color="rgba(139, 92, 246, 1.0)"
      />

      <Circle
        cx={layout.avatarRect.x + layout.avatarRect.w / 2}
        cy={layout.avatarRect.y + layout.avatarRect.h / 2}
        r={layout.avatarRect.w / 2 - 2}
        style="stroke"
        strokeWidth={2.5}
        color="rgba(168, 85, 247, 1.0)"
      />

      <Text
        x={layout.playerNameRect.x + layout.playerNameRect.w * 0.25}
        y={layout.playerNameRect.y + layout.playerNameRect.h * 0.68}
        text="PLAYER"
        font={FONTS.headerName}
        color="#ffffff"
      />

      <RoundedRect
        x={layout.playerNameRect.x + layout.playerNameRect.w - layout.playerNameRect.h * 0.85}
        y={layout.playerNameRect.y + layout.playerNameRect.h * 0.15}
        width={layout.playerNameRect.h * 0.70}
        height={layout.playerNameRect.h * 0.70}
        r={layout.playerNameRect.h * 0.08}
        color="rgba(139, 92, 246, 0.90)"
      />

      <Text
        x={layout.playerNameRect.x + layout.playerNameRect.w - layout.playerNameRect.h * 0.60}
        y={layout.playerNameRect.y + layout.playerNameRect.h * 0.68}
        text="+"
        font={FONTS.headerCoins}
        color="#ffffff"
      />

      {/* PILL COINS */}
      <RoundedRect
        x={layout.coinsRect.x}
        y={layout.coinsRect.y}
        width={layout.coinsRect.w}
        height={layout.coinsRect.h}
        r={layout.coinsRect.r}
        color="rgba(30, 41, 59, 0.85)"
      />

      <RoundedRect
        x={layout.coinsRect.x + 2}
        y={layout.coinsRect.y + 2}
        width={layout.coinsRect.w - 4}
        height={layout.coinsRect.h - 4}
        r={Math.max(0, layout.coinsRect.r - 2)}
        style="stroke"
        strokeWidth={2.5}
        color="rgba(251, 191, 36, 0.85)"
      />

      <Circle
        cx={layout.coinsRect.x + layout.coinsRect.h * 0.50}
        cy={layout.coinsRect.y + layout.coinsRect.h / 2}
        r={layout.coinsRect.h * 0.35}
        color="rgba(251, 191, 36, 0.90)"
      />

      <Text
        x={layout.coinsRect.x + layout.coinsRect.h * 0.90}
        y={layout.coinsRect.y + layout.coinsRect.h * 0.68}
        text={formatCoins(coins)}
        font={FONTS.headerCoins}
        color="#ffffff"
      />

      <RoundedRect
        x={layout.coinsRect.x + layout.coinsRect.w - layout.coinsRect.h * 0.85}
        y={layout.coinsRect.y + layout.coinsRect.h * 0.15}
        width={layout.coinsRect.h * 0.70}
        height={layout.coinsRect.h * 0.70}
        r={layout.coinsRect.h * 0.08}
        color="rgba(34, 197, 94, 0.90)"
      />

      <Text
        x={layout.coinsRect.x + layout.coinsRect.w - layout.coinsRect.h * 0.60}
        y={layout.coinsRect.y + layout.coinsRect.h * 0.68}
        text="+"
        font={FONTS.headerCoins}
        color="#ffffff"
      />

      {/* SETTINGS avec icône engrenage */}
      <Circle
        cx={layout.settingsRect.x + layout.settingsRect.w / 2}
        cy={layout.settingsRect.y + layout.settingsRect.h / 2}
        r={layout.settingsRect.w / 2}
        color="rgba(30, 41, 59, 0.85)"
      />

      <Circle
        cx={layout.settingsRect.x + layout.settingsRect.w / 2}
        cy={layout.settingsRect.y + layout.settingsRect.h / 2}
        r={layout.settingsRect.w / 2 - 2}
        style="stroke"
        strokeWidth={2.5}
        color="rgba(148, 163, 184, 0.75)"
      />

      {/* Icône settings (engrenage) */}
      {settingsIcon && (
        <Image
          image={settingsIcon}
          x={layout.settingsRect.x + layout.settingsRect.w * 0.25}
          y={layout.settingsRect.y + layout.settingsRect.h * 0.25}
          width={layout.settingsRect.w * 0.50}
          height={layout.settingsRect.h * 0.50}
          opacity={0.85}
        />
      )}
    </Group>
  );
};