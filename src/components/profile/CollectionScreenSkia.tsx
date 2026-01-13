// src/components/profile/CollectionScreenSkia.tsx
import React, { useMemo, useCallback } from 'react';
import { Dimensions, StyleSheet, View, Pressable, Text as RNText, Platform } from 'react-native';
import {
  Canvas,
  Group,
  RoundedRect,
  LinearGradient,
  vec,
  Circle,
  Blur,
  matchFont,
} from '@shopify/react-native-skia';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  useFrameCallback,
} from 'react-native-reanimated';

import type { PlayerProfile } from '../../meta/playerProfile';
import { setSelectedBall } from '../../meta/playerProfile';

import { CollectionCardSkia } from './CollectionCardSkia';

const { width: W, height: H } = Dimensions.get('window');

const HEADER_H = 110;
const PAD_X = 16;

const CARD_H = 160;
const CARD_GAP = 14;
const STRIDE = CARD_H + CARD_GAP;

type Ball = {
  id: string;
  name: string;
  desc?: string;
  price?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
};

type Props = {
  title: string;
  balls: Ball[];
  profile: PlayerProfile;
  onBack: () => void;
  onProfileUpdate: () => void;
};

const getRarityInfo = (rarity?: string) => {
  const map = {
    common: { label: 'COMMON', color: '#f59e0b' },
    rare: { label: 'RARE', color: '#3b82f6' },
    epic: { label: 'EPIC', color: '#a855f7' },
    legendary: { label: 'LEGENDARY', color: '#ff6bd5' },
  };
  return rarity && map[rarity as keyof typeof map] ? map[rarity as keyof typeof map] : null;
};

const clampW = (v: number, min: number, max: number) => {
  'worklet';
  return Math.min(max, Math.max(min, v));
};

export const CollectionScreenSkia: React.FC<Props> = ({
  title,
  balls,
  profile,
  onBack,
  onProfileUpdate,
}) => {
  const isShop = title.includes('SHOP');
  const accent = isShop ? '#ff6bd5' : '#22d3ee';
  const accent2 = isShop ? '#a855f7' : '#06b6d4';

  // time (seconds) for previews
  const time = useSharedValue(0);
  useFrameCallback((fi) => {
    'worklet';
    time.value = (fi.timestamp ?? 0) / 1000;
  });

  const ownedSet = useMemo(() => new Set(profile.ownedBalls), [profile.ownedBalls]);
  const ownedCount = useMemo(
    () => balls.reduce((n, b) => n + (ownedSet.has(b.id) ? 1 : 0), 0),
    [balls, ownedSet]
  );

  const listTop = HEADER_H + 10;
  const viewportH = H - listTop;

  const contentH = Math.max(0, balls.length * STRIDE - CARD_GAP);
  const maxScroll = Math.max(0, contentH - viewportH);

  const scrollY = useSharedValue(0);
  const startY = useSharedValue(0);

  const listTransform = useDerivedValue(() => [{ translateY: scrollY.value }]);

  const pan = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetY([-8, 8])
      .failOffsetX([-12, 12])
      .onBegin(() => {
        startY.value = scrollY.value;
      })
      .onUpdate((e) => {
        const next = startY.value + e.translationY;
        scrollY.value = clampW(next, -maxScroll, 0);
      })
      .onEnd((e) => {
        scrollY.value = withDecay({
          velocity: e.velocityY,
          clamp: [-maxScroll, 0],
        });
      });
  }, [maxScroll, scrollY, startY]);

  const hitboxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value }],
  }));

  const onTapBall = useCallback(
    async (ballId: string, owned: boolean) => {
      if (!owned) return;
      await setSelectedBall(ballId);
      onProfileUpdate();
    },
    [onProfileUpdate]
  );

  // Fonts
  const family = Platform.OS === 'android' ? 'sans-serif' : 'System';
  const fontSub = useMemo(() => matchFont({ fontFamily: family, fontSize: 12, fontWeight: '800' as any }), [family]);
  const fontName = useMemo(() => matchFont({ fontFamily: family, fontSize: 18, fontWeight: '900' as any }), [family]);
  const fontDesc = useMemo(() => matchFont({ fontFamily: family, fontSize: 12, fontWeight: '700' as any }), [family]);
  const fontBadge = useMemo(() => matchFont({ fontFamily: family, fontSize: 10, fontWeight: '900' as any }), [family]);
  const fontBtn = useMemo(() => matchFont({ fontFamily: family, fontSize: 12, fontWeight: '900' as any }), [family]);

  const fonts =
    fontSub && fontName && fontDesc && fontBadge && fontBtn
      ? { fontSub, fontName, fontDesc, fontBadge, fontBtn }
      : undefined;

  const cardW = W - PAD_X * 2;

  // to avoid `react-native/no-inline-styles`: style objects built as vars
  const hitboxBase = useMemo(
    () => ({ position: 'absolute' as const, left: PAD_X, width: cardW, height: CARD_H }),
    [cardW]
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <RNText style={styles.hTitle}>{title}</RNText>
          <View style={[styles.underline, { backgroundColor: accent }]} />
          <RNText style={styles.hSub}>
            {ownedCount} / {balls.length} OWNED
          </RNText>
        </View>

        <Pressable onPress={onBack} style={[styles.closeBtn, { borderColor: accent }]}>
          <RNText style={styles.closeTxt}>✕</RNText>
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <View style={styles.body}>
          <Canvas style={styles.canvas} pointerEvents="none">
            <RoundedRect x={0} y={0} width={W} height={H} r={0}>
              <LinearGradient start={vec(0, 0)} end={vec(W, H)} colors={['#06000f', '#120a20', '#06000f']} />
            </RoundedRect>

            <Circle cx={W * 0.82} cy={HEADER_H + 10} r={170} color={accent} opacity={0.10}>
              <Blur blur={80} />
            </Circle>
            <Circle cx={W * 0.20} cy={HEADER_H + 240} r={200} color={accent2} opacity={0.07}>
              <Blur blur={90} />
            </Circle>

            <Group clip={{ x: 0, y: listTop, width: W, height: viewportH }}>
              <Group transform={listTransform}>
                {balls.map((ball, i) => {
                  const y = listTop + i * STRIDE;
                  const owned = ownedSet.has(ball.id);
                  const equipped = profile.selectedBallId === ball.id;
                  const rarity = getRarityInfo(ball.rarity);

                  return (
                    <CollectionCardSkia
                      key={ball.id}
                      x={PAD_X}
                      y={y}
                      w={cardW}
                      h={CARD_H}
                      ball={ball}
                      rarity={rarity}
                      owned={owned}
                      equipped={equipped}
                      accent={accent}
                      accent2={accent2}
                      fonts={fonts}
                      time={time}
                    />
                  );
                })}
              </Group>
            </Group>
          </Canvas>

          <View style={[styles.hitboxViewport, { top: listTop, height: viewportH }]} pointerEvents="box-none">
            <Animated.View style={[styles.hitboxLayer, hitboxStyle]} pointerEvents="box-none">
              {balls.map((ball, i) => {
                const owned = ownedSet.has(ball.id);
                const top = i * STRIDE;
                const s = { ...hitboxBase, top };
                return (
                  <Pressable
                    key={`tap-${ball.id}`}
                    style={s}
                    onPress={() => onTapBall(ball.id, owned)}
                  />
                );
              })}
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  canvas: { width: W, height: H },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_H,
    paddingTop: 24,
    paddingHorizontal: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.20)',
  },
  hTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  underline: { height: 4, width: 120, marginTop: 8, borderRadius: 2 },
  hSub: { marginTop: 6, fontSize: 12, fontWeight: '800', color: '#d1d5db', letterSpacing: 1 },

  closeBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  closeTxt: { color: '#fff', fontSize: 24, fontWeight: '800' },

  body: { flex: 1 },

  hitboxViewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  hitboxLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
