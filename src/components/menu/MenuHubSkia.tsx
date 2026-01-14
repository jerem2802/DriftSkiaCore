// src/components/menu/MenuHubSkia.tsx
import React, { useMemo } from 'react';
import { Group } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';
import { GlassCardSkia } from './GlassCardSkia';
import { MenuChestsCardsSkia } from './MenuChestsCardsSkia';
import { MenuChestButtonsSkia } from './MenuChestButtonsSkia';
import { PlayButtonSkia } from './PlayButtonSkia';

type ChestStatus = 'locked' | 'countdown' | 'ready';

type MenuHubSkiaProps = {
  layout: MenuLayout;
  bronzeStatus: ChestStatus;
  silverStatus: ChestStatus;
  neonStatus: ChestStatus;
};

export const MenuHubSkia: React.FC<MenuHubSkiaProps> = ({ layout, bronzeStatus, silverStatus, neonStatus }) => {
  const p = useMemo(
    () => ({
      navA: 'rgba(255,255,255,0.08)',
      navB: 'rgba(0,0,0,0.28)',
    }),
    []
  );

  return (
    <Group>
      <PlayButtonSkia layout={layout} />
      <MenuChestsCardsSkia layout={layout} bronzeStatus={bronzeStatus} silverStatus={silverStatus} neonStatus={neonStatus} />
      <MenuChestButtonsSkia layout={layout} bronzeStatus={bronzeStatus} silverStatus={silverStatus} neonStatus={neonStatus} />
      <GlassCardSkia rect={layout.navRect} a={p.navA} b={p.navB} heavy />
    </Group>
  );
};