// src/components/menu/MenuTopBarSkia.tsx
import React, { useMemo } from 'react';
import { Group, Circle, RoundedRect, Text, Image, useImage, Skia } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';
import { FONTS } from '../../utils/fonts';

type Props = {
  layout: MenuLayout;
  coins: number;
  playerName: string;
  avatarId: string; // a01..a15
};

// src/components/menu/MenuTopBarSkia.tsx

const getAvatarSource = (id: string) => {
  switch (id) {
    case 'a02': return require('../../assets/avatars/avatar2.png');
    case 'a03': return require('../../assets/avatars/avatar3.png');
    case 'a04': return require('../../assets/avatars/avatar4.png');
    case 'a05': return require('../../assets/avatars/avatar5.png');
    case 'a06': return require('../../assets/avatars/avatar6.png');
    case 'a07': return require('../../assets/avatars/avatar7.png');
    case 'a08': return require('../../assets/avatars/avatar8.png');
    case 'a09': return require('../../assets/avatars/avatar9.png');
    case 'a10': return require('../../assets/avatars/avatar10.png');
    case 'a11': return require('../../assets/avatars/avatar11.png');
    case 'a12': return require('../../assets/avatars/avatar12.png');
    case 'a13': return require('../../assets/avatars/avatar13.png');
    case 'a14': return require('../../assets/avatars/avatar14.png');
    case 'a15': return require('../../assets/avatars/avatar15.png');
    case 'a01':
    default: return require('../../assets/avatars/avatar1.png');
  }
};


export const MenuTopBarSkia: React.FC<Props> = ({ layout, coins, playerName, avatarId }) => {
  const formatCoins = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const settingsIcon = useImage(require('../../assets/images/settings_menu.png'));

  const avatarSrc = useMemo(() => getAvatarSource(avatarId), [avatarId]);
  const avatarImg = useImage(avatarSrc);

  // ✅ AVATAR: plus gros + clip + liseré visible
  const cx = layout.avatarRect.x + layout.avatarRect.w / 2;
  const cy = layout.avatarRect.y + layout.avatarRect.h / 2;

  const OUTER_SCALE = 1.35; // plus gros
  const outerR = (layout.avatarRect.w / 2) * OUTER_SCALE;

  const STROKE_W = 2.5;
  const innerR = outerR - (STROKE_W + 2);

  const IMG_SCALE = 1.15;
  const imgW = outerR * 2 * IMG_SCALE;
  const imgH = outerR * 2 * IMG_SCALE;
  const imgX = cx - imgW / 2;
  const imgY = cy - imgH / 2;

  const clipPath = Skia.Path.Make();
  clipPath.addCircle(cx, cy, innerR);

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
      <Circle cx={cx} cy={cy} r={outerR} color="rgba(139, 92, 246, 1.0)" />

      {avatarImg && (
        <Group clip={clipPath}>
          <Image image={avatarImg} x={imgX} y={imgY} width={imgW} height={imgH} />
        </Group>
      )}

      <Circle
        cx={cx}
        cy={cy}
        r={innerR}
        style="stroke"
        strokeWidth={STROKE_W}
        color="rgba(168, 85, 247, 1.0)"
      />

      <Text
        x={layout.playerNameRect.x + layout.playerNameRect.w * 0.25}
        y={layout.playerNameRect.y + layout.playerNameRect.h * 0.68}
        text={(playerName || 'PLAYER').toUpperCase()}
        font={FONTS.headerName}
        color="#ffffff"
      />

      {/* + name */}
      <RoundedRect
        x={layout.playerNameRect.x + layout.playerNameRect.w - layout.playerNameRect.h * 0.85}
        y={layout.playerNameRect.y + layout.playerNameRect.h * 0.15}
        width={layout.playerNameRect.h * 0.7}
        height={layout.playerNameRect.h * 0.7}
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

      {/* SETTINGS */}
      {settingsIcon && (
        <Image
          image={settingsIcon}
          x={layout.settingsRect.x + layout.settingsRect.w * 0.05}
          y={layout.settingsRect.y + layout.settingsRect.h * 0.05}
          width={layout.settingsRect.w * 0.90}
          height={layout.settingsRect.h * 0.90}
        />
      )}
    </Group>
  );
};
