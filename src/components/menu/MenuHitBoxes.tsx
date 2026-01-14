// src/components/menu/MenuHitBoxes.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import type { MenuLayout } from './menuLayout';

type MenuHitBoxesProps = {
  layout: MenuLayout;

  onProfile: () => void;
  onShopCoins: () => void;
  onSettings: () => void;

  onPlay: () => void;
  onShop: () => void;
  onLeaderboard: () => void;
  onCollection: () => void;
};

const navItemRect = (nav: { x: number; y: number; w: number; h: number }, index: 0 | 1 | 2) => {
  const pad = nav.w * 0.08;
  const gap = nav.w * 0.06;
  const w = (nav.w - pad * 2 - gap * 2) / 3;
  const x = nav.x + pad + index * (w + gap);
  const y = nav.y + nav.h * 0.10;
  const h = nav.h * 0.80;
  return { x, y, w, h };
};

const makeStyles = (l: MenuLayout) =>
  StyleSheet.create({
    root: { position: 'absolute', left: 0, top: 0, width: l.W, height: l.H },

    // TOP BAR HITBOXES
    avatarHit: { position: 'absolute', left: l.avatarRect.x, top: l.avatarRect.y, width: l.avatarRect.w, height: l.avatarRect.h },
    playerNameHit: { position: 'absolute', left: l.playerNameRect.x, top: l.playerNameRect.y, width: l.playerNameRect.w, height: l.playerNameRect.h },
    coinsHit: { position: 'absolute', left: l.coinsRect.x, top: l.coinsRect.y, width: l.coinsRect.w, height: l.coinsRect.h },
    settingsHit: { position: 'absolute', left: l.settingsRect.x, top: l.settingsRect.y, width: l.settingsRect.w, height: l.settingsRect.h },

    // PLAY (hitbox sans texte - le texte est dans PlayButtonSkia)
    playHit: { position: 'absolute', left: l.playRect.x, top: l.playRect.y, width: l.playRect.w, height: l.playRect.h },

    // NAV
    navShop: { position: 'absolute', ...navItemRect(l.navRect, 0) },
    navLeaderboard: { position: 'absolute', ...navItemRect(l.navRect, 1) },
    navCollection: { position: 'absolute', ...navItemRect(l.navRect, 2) },

    footer: {
      position: 'absolute',
      left: l.W * 0.08,
      right: l.W * 0.08,
      bottom: l.footerBottom,
      textAlign: 'center',
      color: '#cbd5e1',
      fontWeight: '800',
      fontSize: l.font.ui,
      opacity: 0.95,
    },
  });

export const MenuHitBoxes: React.FC<MenuHitBoxesProps> = ({
  layout,
  onProfile,
  onShopCoins,
  onSettings,
  onPlay,
  onShop,
  onLeaderboard,
  onCollection,
}) => {
  const s = useMemo(() => makeStyles(layout), [layout]);

  return (
    <View style={s.root} pointerEvents="box-none">
      {/* TOP BAR HITBOXES */}
      <Pressable style={s.avatarHit} onPress={onProfile} />
      <Pressable style={s.playerNameHit} onPress={onProfile} />
      <Pressable style={s.coinsHit} onPress={onShopCoins} />
      <Pressable style={s.settingsHit} onPress={onSettings} />

      {/* PLAY - hitbox invisible, texte/style dans PlayButtonSkia */}
      <Pressable style={s.playHit} onPress={onPlay} />

      {/* NAV - hitboxes invisibles */}
      <Pressable style={s.navShop} onPress={onShop} />
      <Pressable style={s.navLeaderboard} onPress={onLeaderboard} />
      <Pressable style={s.navCollection} onPress={onCollection} />


    </View>
  );
};