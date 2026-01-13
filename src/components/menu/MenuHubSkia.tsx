// src/components/menu/MenuHubSkia.tsx
import React, { useMemo } from 'react';
import { Group } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';
import { GlassCardSkia } from './GlassCardSkia';
import { MenuChestsCardsSkia } from './MenuChestsCardsSkia';

type MenuHubSkiaProps = {
  layout: MenuLayout;
};

export const MenuHubSkia: React.FC<MenuHubSkiaProps> = ({ layout }) => {
  const p = useMemo(
    () => ({
      // play cyan (comme ref)
      playA: 'rgba(34,211,238,0.30)',
      playB: 'rgba(59,130,246,0.18)',
      playGlow: 'rgba(34,211,238,0.75)',

      // nav
      navA: 'rgba(255,255,255,0.08)',
      navB: 'rgba(0,0,0,0.28)',
    }),
    []
  );

  return (
    <Group>
      {/* PLAY */}
      <GlassCardSkia rect={layout.playRect} a={p.playA} b={p.playB} heavy glow={p.playGlow} />

      {/* CHESTS CARDS */}
      <MenuChestsCardsSkia layout={layout} />

      {/* BOTTOM NAV BAR */}
      <GlassCardSkia rect={layout.navRect} a={p.navA} b={p.navB} heavy />
    </Group>
  );
};