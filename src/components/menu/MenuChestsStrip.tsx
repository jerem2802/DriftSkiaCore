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

  const pickCountdown = useCallback(() => {
    if (logic.bronzeStatus === 'countdown') return 'bronze';
    if (logic.silverStatus === 'countdown') return 'silver';
    if (logic.neonStatus === 'countdown') return 'neon';
    return null;
  }, [logic.bronzeStatus, logic.silverStatus, logic.neonStatus]);

  const countdownChest = pickCountdown();

  const watchAd = useCallback(() => {
    if (countdownChest === 'bronze') logic.handleBronzeWatchAd();
    if (countdownChest === 'silver') logic.handleSilverWatchAd();
    if (countdownChest === 'neon') logic.handleNeonWatchAd();
  }, [countdownChest, logic]);

  const onChestPress = useCallback(
    (type: 'bronze' | 'silver' | 'neon') => {
      if (type === 'bronze') {
        if (logic.bronzeStatus === 'locked') logic.handleBronzeUnlock();
        else if (logic.bronzeStatus === 'countdown') logic.handleBronzeWatchAd();
        else logic.handleBronzeOpen();
      }
      if (type === 'silver') {
        if (logic.silverStatus === 'locked') logic.handleSilverUnlock();
        else if (logic.silverStatus === 'countdown') logic.handleSilverWatchAd();
        else logic.handleSilverOpen();
      }
      if (type === 'neon') {
        if (logic.neonStatus === 'locked') logic.handleNeonUnlock();
        else if (logic.neonStatus === 'countdown') logic.handleNeonWatchAd();
        else logic.handleNeonOpen();
      }
    },
    [logic]
  );

  const chestLabel = (type: 'bronze' | 'silver' | 'neon') => {
    const status = type === 'bronze' ? logic.bronzeStatus : type === 'silver' ? logic.silverStatus : logic.neonStatus;
    if (status === 'ready') return 'OPEN';
    return 'Unlock';
  };

  const badgeText = (type: 'bronze' | 'silver' | 'neon') => {
    const status = type === 'bronze' ? logic.bronzeStatus : type === 'silver' ? logic.silverStatus : logic.neonStatus;
    if (status === 'countdown') {
      const t = type === 'bronze' ? logic.bronzeTime : type === 'silver' ? logic.silverTime : logic.neonTime;
      return `⏰ ${fmt(t)}`;
    }
    if (status === 'ready') return 'READY!';
    return '';
  };

  const badgeColor = (type: 'bronze' | 'silver' | 'neon') => {
    const status = type === 'bronze' ? logic.bronzeStatus : type === 'silver' ? logic.silverStatus : logic.neonStatus;
    if (status === 'ready') {
      return type === 'neon' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(255, 255, 255, 0.92)';
    }
    return 'rgba(255, 255, 255, 0.88)';
  };

  const buttonColor = (type: 'bronze' | 'silver' | 'neon') => {
    if (type === 'bronze') return ['rgba(245, 158, 11, 0.75)', 'rgba(217, 119, 6, 0.85)'];
    if (type === 'silver') return ['rgba(59, 130, 246, 0.75)', 'rgba(37, 99, 235, 0.85)'];
    return ['rgba(34, 197, 94, 0.75)', 'rgba(22, 163, 74, 0.85)'];
  };

  const showWatch = countdownChest !== null;

  return (
    <View style={st.root} pointerEvents="auto">
      {/* BRONZE */}
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
        {badgeText('bronze') ? (
          <View
            style={[
              styles.badge,
              {
                left: layout.chestBronzeBadgeRect.x,
                top: layout.chestBronzeBadgeRect.y,
                width: layout.chestBronzeBadgeRect.w,
                height: layout.chestBronzeBadgeRect.h,
                borderRadius: layout.chestBronzeBadgeRect.r,
                backgroundColor: logic.bronzeStatus === 'ready' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(0, 0, 0, 0.65)',
              },
            ]}
          >
            <RNText
              style={[styles.badgeText, { fontSize: layout.font.countdown, color: badgeColor('bronze') }]}
              allowFontScaling={false}
              numberOfLines={1}
            >
              {badgeText('bronze')}
            </RNText>
          </View>
        ) : null}

        <View
          style={[
            styles.btn,
            {
              left: layout.chestBronzeButtonRect.x,
              top: layout.chestBronzeButtonRect.y,
              width: layout.chestBronzeButtonRect.w,
              height: layout.chestBronzeButtonRect.h,
              borderRadius: layout.chestBronzeButtonRect.r,
              backgroundColor: buttonColor('bronze')[0],
              borderColor: buttonColor('bronze')[1],
            },
          ]}
        >
          <RNText
            style={[styles.btnText, { fontSize: layout.font.chestButton }]}
            allowFontScaling={false}
            numberOfLines={1}
          >
            {chestLabel('bronze')}
          </RNText>
        </View>
      </Pressable>

      {/* SILVER */}
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
        {badgeText('silver') ? (
          <View
            style={[
              styles.badge,
              {
                left: layout.chestSilverBadgeRect.x,
                top: layout.chestSilverBadgeRect.y,
                width: layout.chestSilverBadgeRect.w,
                height: layout.chestSilverBadgeRect.h,
                borderRadius: layout.chestSilverBadgeRect.r,
                backgroundColor: logic.silverStatus === 'ready' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(0, 0, 0, 0.65)',
              },
            ]}
          >
            <RNText
              style={[styles.badgeText, { fontSize: layout.font.countdown, color: badgeColor('silver') }]}
              allowFontScaling={false}
              numberOfLines={1}
            >
              {badgeText('silver')}
            </RNText>
          </View>
        ) : null}

        <View
          style={[
            styles.btn,
            {
              left: layout.chestSilverButtonRect.x,
              top: layout.chestSilverButtonRect.y,
              width: layout.chestSilverButtonRect.w,
              height: layout.chestSilverButtonRect.h,
              borderRadius: layout.chestSilverButtonRect.r,
              backgroundColor: buttonColor('silver')[0],
              borderColor: buttonColor('silver')[1],
            },
          ]}
        >
          <RNText
            style={[styles.btnText, { fontSize: layout.font.chestButton }]}
            allowFontScaling={false}
            numberOfLines={1}
          >
            {chestLabel('silver')}
          </RNText>
        </View>
      </Pressable>

      {/* NEON */}
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
        {badgeText('neon') ? (
          <View
            style={[
              styles.badge,
              {
                left: layout.chestNeonBadgeRect.x,
                top: layout.chestNeonBadgeRect.y,
                width: layout.chestNeonBadgeRect.w,
                height: layout.chestNeonBadgeRect.h,
                borderRadius: layout.chestNeonBadgeRect.r,
                backgroundColor: logic.neonStatus === 'ready' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(0, 0, 0, 0.65)',
              },
            ]}
          >
            <RNText
              style={[styles.badgeText, { fontSize: layout.font.countdown, color: badgeColor('neon') }]}
              allowFontScaling={false}
              numberOfLines={1}
            >
              {badgeText('neon')}
            </RNText>
          </View>
        ) : null}

        <View
          style={[
            styles.btn,
            {
              left: layout.chestNeonButtonRect.x,
              top: layout.chestNeonButtonRect.y,
              width: layout.chestNeonButtonRect.w,
              height: layout.chestNeonButtonRect.h,
              borderRadius: layout.chestNeonButtonRect.r,
              backgroundColor: buttonColor('neon')[0],
              borderColor: buttonColor('neon')[1],
            },
          ]}
        >
          <RNText
            style={[styles.btnText, { fontSize: layout.font.chestButton }]}
            allowFontScaling={false}
            numberOfLines={1}
          >
            {chestLabel('neon')}
          </RNText>
        </View>
      </Pressable>

      {/* WATCH AD (centré sous les 3 cards) */}
      {showWatch ? (
        <Pressable
          onPress={watchAd}
          style={[
            styles.watch,
            {
              left: layout.watchAdRect.x,
              top: layout.watchAdRect.y,
              width: layout.watchAdRect.w,
              height: layout.watchAdRect.h,
              borderRadius: layout.watchAdRect.r,
            },
          ]}
        >
          <RNText style={[styles.watchText, { fontSize: layout.font.labelSmall }]} allowFontScaling={false}>
            ▶ Watch Ad (-3h)
          </RNText>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  cardHit: { position: 'absolute' },

  badge: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontWeight: '900',
    letterSpacing: 1,
  },

  btn: {
    position: 'absolute',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 1.4,
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