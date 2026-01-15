// src/components/menu/MenuHitBoxes.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable, type ViewStyle } from 'react-native';
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
  const y = nav.y + nav.h * 0.40; // PLUS BAS (40% au lieu de 10%)
  const h = nav.h * 0.45; // PLUS PETIT (45% au lieu de 80%)
  return { x, y, w, h };
};

const makeStyles = (l: MenuLayout) => {
  const shopRect = navItemRect(l.navRect, 0);
  const leaderboardRect = navItemRect(l.navRect, 1);
  const collectionRect = navItemRect(l.navRect, 2);

  return StyleSheet.create({
    root: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: l.W,
      height: l.H,
    } as ViewStyle,
    avatarHit: {
      position: 'absolute',
      left: l.avatarRect.x,
      top: l.avatarRect.y,
      width: l.avatarRect.w,
      height: l.avatarRect.h,
    } as ViewStyle,
    coinsHit: {
      position: 'absolute',
      left: l.coinsRect.x,
      top: l.coinsRect.y,
      width: l.coinsRect.w,
      height: l.coinsRect.h,
    } as ViewStyle,
    settingsHit: {
      position: 'absolute',
      left: l.settingsRect.x,
      top: l.settingsRect.y,
      width: l.settingsRect.w,
      height: l.settingsRect.h,
    } as ViewStyle,
    playHit: {
      position: 'absolute',
      left: l.playRect.x,
      top: l.playRect.y,
      width: l.playRect.w,
      height: l.playRect.h,
    } as ViewStyle,
    navShop: {
      position: 'absolute',
      left: shopRect.x,
      top: shopRect.y,
      width: shopRect.w,
      height: shopRect.h,
    } as ViewStyle,
    navLeaderboard: {
      position: 'absolute',
      left: leaderboardRect.x,
      top: leaderboardRect.y,
      width: leaderboardRect.w,
      height: leaderboardRect.h,
    } as ViewStyle,
    navCollection: {
      position: 'absolute',
      left: collectionRect.x,
      top: collectionRect.y,
      width: collectionRect.w,
      height: collectionRect.h,
    } as ViewStyle,
  });
};

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
  const styles = useMemo(() => makeStyles(layout), [layout]);

  return (
    <View style={styles.root}>
      <Pressable style={styles.avatarHit} onPress={onProfile} />
      <Pressable style={styles.coinsHit} onPress={onShopCoins} />
      <Pressable style={styles.settingsHit} onPress={onSettings} />
      <Pressable style={styles.playHit} onPress={onPlay} />

      <Pressable style={styles.navShop} onPress={() => {
        console.log('🛒 SHOP CLICKED!');
        onShop();
      }} />

      <Pressable style={styles.navLeaderboard} onPress={() => {
        console.log('🏆 LEADERBOARD CLICKED!');
        onLeaderboard();
      }} />

      <Pressable style={styles.navCollection} onPress={() => {
        console.log('💼 COLLECTION CLICKED!');
        onCollection();
      }} />
    </View>
  );
};