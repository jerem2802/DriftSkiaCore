// src/components/menu/MenuHeaderSkia.tsx
import React from 'react';
import { Group, Image, useImage } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';

type Props = { layout: MenuLayout };

export const MenuHeaderSkia: React.FC<Props> = ({ layout }) => {
  const ringImg = useImage(require('../../assets/images/menu_ring.png'));
  const typoImg = useImage(require('../../assets/images/typo_menu.png'));

  const ring = layout.heroRingRect;
  const logo = layout.heroLogoRect;

  return (
    <Group>
      {ringImg && (
        <Image image={ringImg} x={ring.x} y={ring.y} width={ring.w} height={ring.h} fit="cover" />
      )}
      {typoImg && (
        <Image image={typoImg} x={logo.x} y={logo.y} width={logo.w} height={logo.h} fit="cover" />
      )}
    </Group>
  );
};
