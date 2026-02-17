// src/components/menu/MenuHubSkia.tsx
import React from 'react';
import { Group } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';
import { MenuChestsCardsSkia } from './MenuChestsCardsSkia';
import { MenuChestButtonsSkia } from './MenuChestButtonsSkia';
import { MenuWatchAdButtonsSkia } from './MenuWatchAdButtonsSkia';
import { MenuNavIconsSkia } from './MenuNavIconsSkia';
import { PlayButtonSkia } from './PlayButtonSkia';

type ChestStatus = 'locked' | 'countdown' | 'ready';

type MenuHubSkiaProps = {
  layout: MenuLayout;
  bronzeStatus: ChestStatus;
  silverStatus: ChestStatus;
  neonStatus: ChestStatus;
  activeTab: 'shop' | 'leaderboard' | 'collection';
  isPremium?: boolean;
};

export const MenuHubSkia: React.FC<MenuHubSkiaProps> = ({
  layout,
  bronzeStatus,
  silverStatus,
  neonStatus,
  activeTab,
  isPremium = false,
}) => {
  return (
    <Group>
      <PlayButtonSkia layout={layout} />
      <MenuChestsCardsSkia layout={layout} bronzeStatus={bronzeStatus} silverStatus={silverStatus} neonStatus={neonStatus} />
      <MenuChestButtonsSkia layout={layout} bronzeStatus={bronzeStatus} silverStatus={silverStatus} neonStatus={neonStatus} />
      <MenuWatchAdButtonsSkia layout={layout} bronzeStatus={bronzeStatus} silverStatus={silverStatus} neonStatus={neonStatus} isPremium={isPremium} />
      <MenuNavIconsSkia layout={layout} activeTab={activeTab} />
    </Group>
  );
};