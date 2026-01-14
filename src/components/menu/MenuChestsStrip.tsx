// src/components/menu/MenuChestsStrip.tsx
import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Pressable, Text as RNText } from 'react-native';
import type { MenuLayout } from './menuLayout';

type ChestStatus = 'locked' | 'countdown' | 'ready';

type ChestLogic = {
  bronzeStatus: ChestStatus;
  silverStatus: ChestStatus;
  neonStatus: ChestStatus;
  bronzeTime: number;
  silverTime: number;
  neonTime: number;
  handleBronzeUnlock: () => void;
  handleBronzeWatchAd: () => void;
  handleBronzeOpen: () => void;
  handleSilverUnlock: () => void;
  handleSilverWatchAd: () => void;
  handleSilverOpen: () => void;
  handleNeonUnlock: () => void;
  handleNeonWatchAd: () => void;
  handleNeonOpen: () => void;
};

type Props = {
  layout: MenuLayout;
  logic: ChestLogic;
};

const fmt = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${h}:${pad(m)}:${pad(ss)}`;
};

export const MenuChestsStrip: React.FC<Props> = ({ layout, logic }) => {
  const st = useMemo(
    () => ({
      root: { position: 'absolute' as const, left: 0, top: 0, width: layout.W, height: layout.H },
    }),
    [layout.W, layout.H]
  );

  const onChestPress = useCallback(
    (type: 'bronze' | 'silver' | 'neon') => {
      if (type === 'bronze') {
        if (logic.bronzeStatus === 'locked') logic.handleBronzeUnlock();
        else if (logic.bronzeStatus === 'countdown') return; // Pas de tap pendant countdown
        else logic.handleBronzeOpen();
      }
      if (type === 'silver') {
        if (logic.silverStatus === 'locked') logic.handleSilverUnlock();
        else if (logic.silverStatus === 'countdown') return;
        else logic.handleSilverOpen();
      }
      if (type === 'neon') {
        if (logic.neonStatus === 'locked') logic.handleNeonUnlock();
        else if (logic.neonStatus === 'countdown') return;
        else logic.handleNeonOpen();
      }
    },
    [logic]
  );

  const countdownText = (type: 'bronze' | 'silver' | 'neon') => {
    const status = type === 'bronze' ? logic.bronzeStatus : type === 'silver' ? logic.silverStatus : logic.neonStatus;
    if (status === 'countdown') {
      const t = type === 'bronze' ? logic.bronzeTime : type === 'silver' ? logic.silverTime : logic.neonTime;
      return `⏰ ${fmt(t)}`;
    }
    if (status === 'ready') return 'READY!';
    return '';
  };

  const watchAdRect = (type: 'bronze' | 'silver' | 'neon') => {
    const card = type === 'bronze' ? layout.chestRowBronzeRect : type === 'silver' ? layout.chestRowSilverRect : layout.chestRowNeonRect;
    return {
      x: card.x,
      y: card.y + card.h + layout.H * 0.012,
      w: card.w,
      h: layout.H * 0.045,
      r: card.r,
    };
  };

  return (
    <View style={st.root} pointerEvents="auto">
      {/* BRONZE - hitbox invisible */}
      <Pressable
        style={[
          styles.cardHit,
          {
            left: layout.chestRowBronzeRect.x,
            top: layout.chestRowBronzeRect.y,
            width: layout.chestRowBronzeRect.w,
            height: layout.chestRowBronzeRect.h,
          },
        ]}
        onPress={() => onChestPress('bronze')}
      >
        {countdownText('bronze') && (
          <View style={[styles.countdown, {
            top: layout.chestRowBronzeRect.h * 0.05,
            width: layout.chestRowBronzeRect.w,
          }]}>
            <RNText
              style={[styles.countdownText, { fontSize: layout.font.countdown }]}
              allowFontScaling={false}
            >
              {countdownText('bronze')}
            </RNText>
          </View>
        )}
      </Pressable>

      {/* Watch Ad Bronze */}
      {logic.bronzeStatus === 'countdown' && (
        <Pressable
          onPress={logic.handleBronzeWatchAd}
          style={[
            styles.watch,
            {
              left: watchAdRect('bronze').x,
              top: watchAdRect('bronze').y,
              width: watchAdRect('bronze').w,
              height: watchAdRect('bronze').h,
              borderRadius: watchAdRect('bronze').r,
            },
          ]}
        >
          <RNText style={[styles.watchText, { fontSize: layout.font.labelSmall }]} allowFontScaling={false}>
            ▶ Watch Ad (-3h)
          </RNText>
        </Pressable>
      )}

      {/* SILVER - hitbox invisible */}
      <Pressable
        style={[
          styles.cardHit,
          {
            left: layout.chestRowSilverRect.x,
            top: layout.chestRowSilverRect.y,
            width: layout.chestRowSilverRect.w,
            height: layout.chestRowSilverRect.h,
          },
        ]}
        onPress={() => onChestPress('silver')}
      >
        {countdownText('silver') && (
          <View style={[styles.countdown, {
            top: layout.chestRowSilverRect.h * 0.05,
            width: layout.chestRowSilverRect.w,
          }]}>
            <RNText
              style={[styles.countdownText, { fontSize: layout.font.countdown }]}
              allowFontScaling={false}
            >
              {countdownText('silver')}
            </RNText>
          </View>
        )}
      </Pressable>

      {/* Watch Ad Silver */}
      {logic.silverStatus === 'countdown' && (
        <Pressable
          onPress={logic.handleSilverWatchAd}
          style={[
            styles.watch,
            {
              left: watchAdRect('silver').x,
              top: watchAdRect('silver').y,
              width: watchAdRect('silver').w,
              height: watchAdRect('silver').h,
              borderRadius: watchAdRect('silver').r,
            },
          ]}
        >
          <RNText style={[styles.watchText, { fontSize: layout.font.labelSmall }]} allowFontScaling={false}>
            ▶ Watch Ad (-3h)
          </RNText>
        </Pressable>
      )}

      {/* NEON - hitbox invisible */}
      <Pressable
        style={[
          styles.cardHit,
          {
            left: layout.chestRowNeonRect.x,
            top: layout.chestRowNeonRect.y,
            width: layout.chestRowNeonRect.w,
            height: layout.chestRowNeonRect.h,
          },
        ]}
        onPress={() => onChestPress('neon')}
      >
        {countdownText('neon') && (
          <View style={[styles.countdown, {
            top: layout.chestRowNeonRect.h * 0.05,
            width: layout.chestRowNeonRect.w,
          }]}>
            <RNText
              style={[styles.countdownText, { fontSize: layout.font.countdown }]}
              allowFontScaling={false}
            >
              {countdownText('neon')}
            </RNText>
          </View>
        )}
      </Pressable>

      {/* Watch Ad Neon */}
      {logic.neonStatus === 'countdown' && (
        <Pressable
          onPress={logic.handleNeonWatchAd}
          style={[
            styles.watch,
            {
              left: watchAdRect('neon').x,
              top: watchAdRect('neon').y,
              width: watchAdRect('neon').w,
              height: watchAdRect('neon').h,
              borderRadius: watchAdRect('neon').r,
            },
          ]}
        >
          <RNText style={[styles.watchText, { fontSize: layout.font.labelSmall }]} allowFontScaling={false}>
            ▶ Watch Ad (-3h)
          </RNText>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardHit: { position: 'absolute' },

  countdown: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },

  watch: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchText: {
    color: 'rgba(34, 197, 94, 0.95)',
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});