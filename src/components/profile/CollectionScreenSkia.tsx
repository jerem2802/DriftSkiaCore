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
  Text as SkiaText,
  matchFont,
} from '@shopify/react-native-skia';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withTiming,
  useFrameCallback,
} from 'react-native-reanimated';

import type { PlayerProfile } from '../../meta/playerProfile';
import { setSelectedBall } from '../../meta/playerProfile';
import { BallPreviewNode } from '../shop/BallPreviewNode';

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



const trunc = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1)}…`);

export const CollectionScreenSkia: React.FC<Props> = ({
  title,
  balls,
  profile,
  onBack,
  onProfileUpdate,
}) => {
  const isShop = title.includes('SHOP');
  const accent = isShop ? '#ff6bd5' : '#22d3ee';

  // time (seconds)
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

  // Reanimated scroll (0 -> top, negative -> down)
  const scrollY = useSharedValue(0);
  const startY = useSharedValue(0);

  const listTransform = useDerivedValue(() => [{ translateY: scrollY.value }]);

  const pan = useMemo(() => {
    const RUBBER = 0.35; // résistance overscroll
    const SNAP_MS = 170;

    return Gesture.Pan()
      .activeOffsetY([-8, 8])
      .failOffsetX([-12, 12])
      .onBegin(() => {
        if (maxScroll <= 0) return;
        startY.value = scrollY.value;
      })
      .onUpdate((e) => {
        if (maxScroll <= 0) {
          scrollY.value = 0;
          return;
        }

        const raw = startY.value + e.translationY;

        // rubber band haut
        if (raw > 0) {
          scrollY.value = raw * RUBBER;
          return;
        }

        // rubber band bas
        if (raw < -maxScroll) {
          const extra = raw + maxScroll; // négatif
          scrollY.value = -maxScroll + extra * RUBBER;
          return;
        }

        scrollY.value = raw;
      })
      .onEnd((e) => {
        if (maxScroll <= 0) {
          scrollY.value = 0;
          return;
        }

        // snap si hors bornes
        if (scrollY.value > 0) {
          scrollY.value = withTiming(0, { duration: SNAP_MS, easing: Easing.out(Easing.cubic) });
          return;
        }
        if (scrollY.value < -maxScroll) {
          scrollY.value = withTiming(-maxScroll, { duration: SNAP_MS, easing: Easing.out(Easing.cubic) });
          return;
        }

        // decay normal
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

  // Fonts (Android needs explicit family)
  const family = Platform.OS === 'android' ? 'sans-serif' : 'System';

  const fontSub = useMemo(
    () => matchFont({ fontFamily: family, fontSize: 12, fontWeight: '800' as any }),
    [family]
  );
  const fontName = useMemo(
    () => matchFont({ fontFamily: family, fontSize: 18, fontWeight: '900' as any }),
    [family]
  );
  const fontDesc = useMemo(
    () => matchFont({ fontFamily: family, fontSize: 12, fontWeight: '700' as any }),
    [family]
  );
  const fontBadge = useMemo(
    () => matchFont({ fontFamily: family, fontSize: 10, fontWeight: '900' as any }),
    [family]
  );
  const fontBtn = useMemo(
    () => matchFont({ fontFamily: family, fontSize: 12, fontWeight: '900' as any }),
    [family]
  );

  const canText = !!fontSub && !!fontName && !!fontDesc && !!fontBadge && !!fontBtn;

  const cardW = W - PAD_X * 2;
  const coinR = 6;

  return (
    <View style={styles.root}>
      {/* Header RN */}
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
          <Canvas style={{ width: W, height: H }} pointerEvents="none">
            {/* Background */}
            <RoundedRect x={0} y={0} width={W} height={H} r={0}>
              <LinearGradient start={vec(0, 0)} end={vec(W, H)} colors={['#070012', '#120a20', '#070012']} />
            </RoundedRect>

            {/* Ambient glows */}
            <Circle cx={W * 0.82} cy={HEADER_H + 20} r={140} color={accent} opacity={0.08}>
              <Blur blur={60} />
            </Circle>
            <Circle cx={W * 0.22} cy={HEADER_H + 220} r={170} color={isShop ? '#22d3ee' : '#ff6bd5'} opacity={0.06}>
              <Blur blur={70} />
            </Circle>

            {/* LIST CLIP */}
            <Group clip={{ x: 0, y: listTop, width: W, height: viewportH }}>
              <Group transform={listTransform}>
                {balls.map((ball, i) => {
                  const y = listTop + i * STRIDE;

                  const owned = ownedSet.has(ball.id);
                  const equipped = profile.selectedBallId === ball.id;
                  const rarity = getRarityInfo(ball.rarity);

                  const border = equipped ? '#22c55e' : accent;
                  const btnBg = equipped ? '#22c55e33' : owned ? `${accent}33` : '#2a2a3a77';
                  const btnStroke = equipped ? '#22c55e' : owned ? accent : '#444455';
                  const btnTextColor = equipped ? '#22c55e' : owned ? accent : '#888899';

                  const orbX = PAD_X + 12 + 65;
                  const orbY = y + 15 + 65;

                  const btnX = PAD_X + cardW - 116;
                  const btnY = y + 108;

                  const label = equipped ? 'EQUIPPED' : owned ? 'EQUIP' : 'LOCKED';
                  const labelX =
                    label === 'EQUIPPED' ? btnX + 10 : label === 'LOCKED' ? btnX + 18 : btnX + 26;

                  return (
                    <Group key={ball.id}>
                      <RoundedRect x={PAD_X} y={y} width={cardW} height={CARD_H} r={20}>
                        <LinearGradient
                          start={vec(PAD_X, y)}
                          end={vec(PAD_X + cardW, y + CARD_H)}
                          colors={equipped ? ['#22c55e1f', '#0b0614'] : ['#171427', '#0b0614']}
                        />
                      </RoundedRect>

                      <RoundedRect
                        x={PAD_X}
                        y={y}
                        width={cardW}
                        height={CARD_H}
                        r={20}
                        style="stroke"
                        strokeWidth={equipped ? 3 : 2}
                        color={border}
                      />

                      <RoundedRect x={PAD_X + 12} y={y + 15} width={130} height={130} r={65} color="#231535" />
                      <Circle cx={orbX} cy={orbY} r={56} color={accent} opacity={0.1} />

                      {/* Preview */}
                      <BallPreviewNode ballId={ball.id} cx={orbX} cy={orbY} size={100} time={time} />

                      {/* LOCK badge */}
                      {!owned && canText && (
                        <Group>
                          <Circle cx={orbX + 36} cy={orbY + 36} r={16} color={`${accent}CC`} />
                          <SkiaText x={orbX + 24} y={orbY + 41} text="LOCK" font={fontBadge!} color="#000" />
                        </Group>
                      )}

                      {canText && (
                        <>
                          <SkiaText
                            x={PAD_X + 160}
                            y={y + 34}
                            text={trunc(ball.name ?? '', 22)}
                            font={fontName!}
                            color={owned ? '#FFFFFF' : '#8a88a3'}
                          />

                          {rarity && (
                            <Group>
                              <RoundedRect
                                x={PAD_X + 160}
                                y={y + 44}
                                width={92}
                                height={22}
                                r={8}
                                color={`${rarity.color}33`}
                              />
                              <SkiaText
                                x={PAD_X + 170}
                                y={y + 60}
                                text={rarity.label}
                                font={fontBadge!}
                                color={rarity.color}
                              />
                            </Group>
                          )}

                          <SkiaText
                            x={PAD_X + 160}
                            y={y + 88}
                            text={trunc(ball.desc ?? '...', 60)}
                            font={fontDesc!}
                            color="#c7c6d6"
                          />

                          {/* PRICE */}
                          {ball.price !== undefined && (
                            <Group>
                              <Circle cx={PAD_X + 160 + coinR} cy={y + 118} r={coinR} color="#fbbf24" />
                              <Circle cx={PAD_X + 160 + coinR} cy={y + 118} r={coinR + 2} color="#fbbf24" opacity={0.18}>
                                <Blur blur={6} />
                              </Circle>
                              <SkiaText
                                x={PAD_X + 160 + coinR * 2 + 6}
                                y={y + 122}
                                text={`${ball.price}`}
                                font={fontSub!}
                                color="#fbbf24"
                              />
                            </Group>
                          )}

                          {/* Button */}
                          <RoundedRect x={btnX} y={btnY} width={100} height={38} r={12} color={btnBg} />
                          <RoundedRect
                            x={btnX}
                            y={btnY}
                            width={100}
                            height={38}
                            r={12}
                            style="stroke"
                            strokeWidth={2}
                            color={btnStroke}
                          />
                          <SkiaText x={labelX} y={btnY + 25} text={label} font={fontBtn!} color={btnTextColor} />
                        </>
                      )}
                    </Group>
                  );
                })}
              </Group>
            </Group>
          </Canvas>

          {/* Hitboxes (NO runOnJS, no virtualization) */}
          <View style={[styles.hitboxViewport, { top: listTop, height: viewportH }]} pointerEvents="box-none">
            <Animated.View style={[styles.hitboxLayer, hitboxStyle]} pointerEvents="box-none">
              {balls.map((ball, i) => {
                const owned = ownedSet.has(ball.id);
                const top = i * STRIDE; // viewport already starts at listTop
                return (
                  <Pressable
                    key={`tap-${ball.id}`}
                    style={{ position: 'absolute', left: PAD_X, top, width: cardW, height: CARD_H }}
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

  closeBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
