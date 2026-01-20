// src/components/menu/MenuNavIconsSkia.tsx
import React from 'react';
import { Group, Image, useImage } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';

type NavTab = 'shop' | 'leaderboard' | 'collection';

type Props = {
  layout: MenuLayout;
  activeTab: NavTab;
};

const ACTIVE_SCALE = 1.15;
const INACTIVE_SCALE = 1.0;

export const MenuNavIconsSkia: React.FC<Props> = ({ layout, activeTab }) => {
  const shopIcon = useImage(require('../../assets/images/shop.png'));
  const cupIcon = useImage(require('../../assets/images/cup.png'));
  const collectionIcon = useImage(require('../../assets/images/collection.png'));

  const shopScale = activeTab === 'shop' ? ACTIVE_SCALE : INACTIVE_SCALE;
  const leaderboardScale = activeTab === 'leaderboard' ? ACTIVE_SCALE : INACTIVE_SCALE;
  const collectionScale = activeTab === 'collection' ? ACTIVE_SCALE : INACTIVE_SCALE;

  const navItemRect = (index: 0 | 1 | 2) => {
    'worklet';
    const pad = layout.navRect.w * 0.08;
    const gap = layout.navRect.w * 0.06;
    const w = (layout.navRect.w - pad * 2 - gap * 2) / 3;
    const x = layout.navRect.x + pad + index * (w + gap);
    const y = layout.navRect.y + layout.navRect.h * 0.25;
    const h = layout.navRect.h * 0.8;
    return { x, y, w, h };
  };

  if (!shopIcon || !cupIcon || !collectionIcon) return null;

  const shopRect = navItemRect(0);
  const shopCx = shopRect.x + shopRect.w / 2;
  const shopCy = shopRect.y + shopRect.h / 2;
  const shopIconSize = shopRect.h * 0.95;

  const leaderboardRect = navItemRect(1);
  const leaderboardCx = leaderboardRect.x + leaderboardRect.w / 2;
  const leaderboardCy = leaderboardRect.y + leaderboardRect.h / 2;
  const leaderboardIconSize = leaderboardRect.h * 0.95;

  const collectionRect = navItemRect(2);
  const collectionCx = collectionRect.x + collectionRect.w / 2;
  const collectionCy = collectionRect.y + collectionRect.h / 2;
  const collectionIconSize = collectionRect.h * 0.95;

  return (
    <Group>
      <Group
        transform={[
          { translateX: shopCx },
          { translateY: shopCy },
          { scale: shopScale },
          { translateX: -shopCx },
          { translateY: -shopCy },
        ]}
      >
        <Image
          image={shopIcon}
          x={shopCx - shopIconSize / 2}
          y={shopCy - shopIconSize / 2}
          width={shopIconSize}
          height={shopIconSize}
          fit="contain"
        />
      </Group>

      <Group
        transform={[
          { translateX: leaderboardCx },
          { translateY: leaderboardCy },
          { scale: leaderboardScale },
          { translateX: -leaderboardCx },
          { translateY: -leaderboardCy },
        ]}
      >
        <Image
          image={cupIcon}
          x={leaderboardCx - leaderboardIconSize / 2}
          y={leaderboardCy - leaderboardIconSize / 2}
          width={leaderboardIconSize}
          height={leaderboardIconSize}
          fit="contain"
        />
      </Group>

      <Group
        transform={[
          { translateX: collectionCx },
          { translateY: collectionCy },
          { scale: collectionScale },
          { translateX: -collectionCx },
          { translateY: -collectionCy },
        ]}
      >
        <Image
          image={collectionIcon}
          x={collectionCx - collectionIconSize / 2}
          y={collectionCy - collectionIconSize / 2}
          width={collectionIconSize}
          height={collectionIconSize}
          fit="contain"
        />
      </Group>
    </Group>
  );
};
