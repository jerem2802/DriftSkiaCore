// src/components/menu/MenuHitBoxes.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable, Text as RNText } from 'react-native';
import type { MenuLayout } from './menuLayout';

type MenuHitBoxesProps = {
  layout: MenuLayout;

  onProfile: () => void;
  onShopCoins: () => void;
  onSettings: () => void;

  onPlay: () => void;
  onShop: () => void;
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

    // HERO
    heroHit: { position: 'absolute', left: 0, top: l.heroRingRect.y, width: l.W, height: l.heroRingRect.h },

    // PLAY
    playHit: { position: 'absolute', left: l.playRect.x, top: l.playRect.y, width: l.playRect.w, height: l.playRect.h },
    playCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    playText: { color: '#ffffff', fontWeight: '900', letterSpacing: 2, fontSize: Math.round(l.font.play * 0.55) },

    // NAV
    navShop: { position: 'absolute', ...navItemRect(l.navRect, 0) },
    navProfile: { position: 'absolute', ...navItemRect(l.navRect, 1) },
    navInv: { position: 'absolute', ...navItemRect(l.navRect, 2) },
    navCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navText: { color: '#cbd5e1', fontWeight: '900', letterSpacing: 1.2, fontSize: l.font.small, textAlign: 'center' },

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
  onCollection,
}) => {
  const s = useMemo(() => makeStyles(layout), [layout]);

  return (
    <View style={s.root} pointerEvents="auto">
      {/* TOP BAR HITBOXES */}
      <Pressable style={s.avatarHit} onPress={onProfile} />
      <Pressable style={s.playerNameHit} onPress={onProfile} />
      <Pressable style={s.coinsHit} onPress={onShopCoins} />
      <Pressable style={s.settingsHit} onPress={onSettings} />

      {/* HERO tap → Collection */}
      <Pressable style={s.heroHit} onPress={onCollection} />

      {/* PLAY */}
      <Pressable style={s.playHit} onPress={onPlay}>
        <View style={s.playCenter}>
          <RNText style={s.playText} allowFontScaling={false}>
            PLAY
          </RNText>
        </View>
      </Pressable>

      {/* NAV */}
      <Pressable style={s.navShop} onPress={onShop}>
        <View style={s.navCenter}>
          <RNText style={s.navText} allowFontScaling={false}>
            SHOP
          </RNText>
        </View>
      </Pressable>
      <Pressable style={s.navProfile} onPress={onProfile}>
        <View style={s.navCenter}>
          <RNText style={s.navText} allowFontScaling={false}>
            PROFILE
          </RNText>
        </View>
      </Pressable>
      <Pressable style={s.navInv} onPress={onCollection}>
        <View style={s.navCenter}>
          <RNText style={s.navText} allowFontScaling={false}>
            INVENTORY
          </RNText>
        </View>
      </Pressable>

      <RNText style={s.footer} numberOfLines={1} allowFontScaling={false}>
        For the best experience, use headphones.
      </RNText>
    </View>
  );
};