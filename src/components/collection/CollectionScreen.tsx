// src/components/collection/CollectionScreen.tsx
import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text as RNText } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Circle,
  Blur,
  Group,
  Image,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useFrameCallback,
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

import type { PlayerProfile } from '../../meta/playerProfile';
import { setSelectedBall } from '../../meta/playerProfile';
import { SHOP_BALLS } from '../shop/shopCatalog';
import { CHEST_BALLS } from '../../config/bonusConfig';
import { GlassCard } from './glasscard';
import { useCollectionGesture } from './useCollectionGesture';
import { LAYOUT, COLORS, getCardX } from './collectionLayout';
import { usePreloadedAssets } from '../../contexts/PreloadContext';

const CARD_TOTAL_WIDTH = LAYOUT.CARD_W + LAYOUT.CARD_GAP;

// ✅ NEW: blue equipped theme (only UI)
const EQUIP_BLUE_BG = 'rgba(40, 140, 255, 0.26)';
const EQUIP_BLUE_BORDER = 'rgba(80, 170, 255, 0.95)';
const EQUIP_BLUE_TEXT = 'rgba(215, 240, 255, 0.98)';

type Props = {
  profile: PlayerProfile;
  onBack: () => void;
  _onProfileUpdate: () => void; // compat / eslint
  onSelectedBallIdChange: (id: string) => void; // sera appelé UNIQUEMENT au exit
};

type Ball = {
  id: string;
  name: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
};

export const CollectionScreen: React.FC<Props> = ({
  profile,
  onBack,
  _onProfileUpdate,
  onSelectedBallIdChange,
}) => {
  const allBalls = useMemo<Ball[]>(() => {
    const shop = SHOP_BALLS.map((b) => ({
      id: b.id,
      name: b.name,
      rarity: ('rarity' in b ? b.rarity : undefined) as Ball['rarity'],
    }));

    const chest = [...CHEST_BALLS.common, ...CHEST_BALLS.rare, ...CHEST_BALLS.legendary].map(
      (b) => ({
        id: b.id,
        name: b.name,
        rarity: b.rarity as Ball['rarity'],
      })
    );

    return [...shop, ...chest];
  }, []);

  const ownedBalls = useMemo(
    () => allBalls.filter((b) => profile.ownedBalls.includes(b.id)),
    [allBalls, profile.ownedBalls]
  );

  const ownedBallIds = useMemo(() => ownedBalls.map((b) => b.id), [ownedBalls]);

  // ✅ pending selection (JS ref) : AUCUN setState App pendant Collection
  const pendingSelectedIdRef = useRef<string | null>(null);

  // ✅ index selection UI (SharedValue)
  const selectedIndexSV = useSharedValue(0);

  useEffect(() => {
    const idx = ownedBallIds.indexOf(profile.selectedBallId);
    selectedIndexSV.value = idx >= 0 ? idx : 0;
  }, [profile.selectedBallId, ownedBallIds, selectedIndexSV]);

  const time = useSharedValue(0);
  useFrameCallback((fi) => {
    'worklet';
    time.value = (fi.timestamp ?? 0) / 1000;
  });

  const { scrollX, isDragging, dragVelocity, gesture } = useCollectionGesture({
    ballCount: ownedBalls.length,
  });

  const scrollTransform = useDerivedValue(() => {
    'worklet';
    return [{ translateX: scrollX.value }];
  }, [scrollX]);

  const focusedIndexDV = useDerivedValue(() => {
    'worklet';
    const n = ownedBallIds.length;
    if (n <= 0) {
      return 0;
    }
    const raw = -scrollX.value / CARD_TOTAL_WIDTH;
    const idx = Math.round(raw);
    return Math.max(0, Math.min(n - 1, idx));
  }, [scrollX, ownedBallIds.length]);

  const isEquippedDV = useDerivedValue(() => {
    'worklet';
    return focusedIndexDV.value === selectedIndexSV.value;
  });

  const equipBtnAnim = useAnimatedStyle(() => {
    return { opacity: isEquippedDV.value ? 0.55 : 1 };
  });

  // ✅ NEW: color changes (no logic change)
  const equipBtnColorAnim = useAnimatedStyle(() => {
    return {
      backgroundColor: isEquippedDV.value ? EQUIP_BLUE_BG : 'rgba(10,10,18,0.55)',
      borderColor: isEquippedDV.value ? EQUIP_BLUE_BORDER : COLORS.BORDER_START,
    };
  });

  const equipTxtColorAnim = useAnimatedStyle(() => {
    return {
      color: isEquippedDV.value ? EQUIP_BLUE_TEXT : 'rgba(255,255,255,0.92)',
    };
  });

  const equipTxtEquipAnim = useAnimatedStyle(() => {
    return { opacity: isEquippedDV.value ? 0 : 1 };
  });

  const equipTxtEquippedAnim = useAnimatedStyle(() => {
    return { opacity: isEquippedDV.value ? 1 : 0 };
  });

  const startX = (LAYOUT.W - LAYOUT.CARD_W) / 2;
  const startY = (LAYOUT.H - LAYOUT.CARD_H) / 2;

  const assets = usePreloadedAssets();
  const metalImage = assets.glassCard;
  const bgCollection = assets.backgroundCollection;

  // ✅ JS helper (no setState, just ref)
  const setPendingJS = useCallback((id: string) => {
    pendingSelectedIdRef.current = id;
  }, []);

  // ✅ Tap UI-thread (instant) + store pending in JS ref (no App rerender)
  const equipTap = useMemo(() => {
    return Gesture.Tap()
      .maxDuration(250)
      .onStart(() => {
        'worklet';
        if (isDragging.value) return;

        const n = ownedBallIds.length;
        if (n <= 0) return;

        const idx = Math.max(0, Math.min(n - 1, Math.round(-scrollX.value / CARD_TOTAL_WIDTH)));
        if (idx === selectedIndexSV.value) return;

        selectedIndexSV.value = idx; // ✅ instant UI

        const id = ownedBallIds[idx];
        if (!id) return;

        // ✅ store pending only (no setState)
        runOnJS(setPendingJS)(id);
      });
  }, [ownedBallIds, scrollX, selectedIndexSV, isDragging, setPendingJS]);

  // ✅ Commit uniquement au exit (X)
  const commitAndBack = useCallback(() => {
    const pending = pendingSelectedIdRef.current;
    if (pending && pending !== profile.selectedBallId) {
      // 1) Update App (light) — au moment où tu quittes l’écran
      onSelectedBallIdChange(pending);

      // 2) Persist AsyncStorage en background (peut stutter, mais tu as déjà quitté)
      setSelectedBall(pending).catch(() => {});

      // 3) optionnel: garde pour compat (si tu veux reload plus tard)
      _onProfileUpdate();
    }

    onBack();
  }, [onBack, onSelectedBallIdChange, profile.selectedBallId, _onProfileUpdate]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.body}>
          <Canvas style={styles.canvas} pointerEvents="none">
            {bgCollection ? (
              <Group>
                <Image image={bgCollection} x={0} y={0} width={LAYOUT.W} height={LAYOUT.H} fit="cover" />
                <RoundedRect x={0} y={0} width={LAYOUT.W} height={LAYOUT.H} r={0} color="#00000055" />
              </Group>
            ) : (
              <RoundedRect x={0} y={0} width={LAYOUT.W} height={LAYOUT.H} r={0}>
                <LinearGradient start={vec(0, 0)} end={vec(LAYOUT.W, LAYOUT.H)} colors={['#06000f', '#120a20', '#06000f']} />
              </RoundedRect>
            )}

            <Circle cx={LAYOUT.W * 0.8} cy={LAYOUT.H * 0.3} r={200} color={COLORS.GLOW_PINK} opacity={0.08}>
              <Blur blur={100} />
            </Circle>
            <Circle cx={LAYOUT.W * 0.2} cy={LAYOUT.H * 0.7} r={250} color={COLORS.GLOW_CYAN} opacity={0.06}>
              <Blur blur={120} />
            </Circle>

            <Group transform={scrollTransform}>
              {ownedBalls.map((ball, i) => {
                const x = getCardX(i) + startX;
                const y = startY;
                return (
                  <GlassCard
                    key={ball.id}
                    ball={ball}
                    x={x}
                    y={y}
                    scrollX={scrollX}
                    isDragging={isDragging}
                    dragVelocity={dragVelocity}
                    time={time}
                    metalImage={metalImage}
                  />
                );
              })}
            </Group>
          </Canvas>
        </View>
      </GestureDetector>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftSlot} />
        <View style={styles.headerCenter}>
          <View style={styles.headerGlow} />
          <View style={styles.headerCard}>
            <RNText style={styles.title}>COLLECTION</RNText>
            <View style={styles.underline} />
          </View>
        </View>

        <Pressable onPress={commitAndBack} style={styles.closeBtn} hitSlop={10}>
          <RNText style={styles.closeTxt}>✕</RNText>
        </Pressable>
      </View>

      {/* Equip button (UI thread) */}
      <View style={styles.equipWrap} pointerEvents="box-none">
        <GestureDetector gesture={equipTap}>
          <Animated.View style={[styles.equipBtn, equipBtnAnim, equipBtnColorAnim]}>
            <View style={styles.equipPressable}>
              <View style={styles.equipTxtWrap}>
                <Animated.Text style={[styles.equipTxt, equipTxtColorAnim, equipTxtEquipAnim]}>
                  EQUIP
                </Animated.Text>
                <Animated.Text
                  style={[
                    styles.equipTxt,
                    styles.equipTxtAbs,
                    equipTxtColorAnim,
                    equipTxtEquippedAnim,
                  ]}
                >
                  EQUIPPED
                </Animated.Text>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  body: { flex: 1 },
  canvas: { width: LAYOUT.W, height: LAYOUT.H },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingTop: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerLeftSlot: { width: 50, height: 50 },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
  },

  headerGlow: {
    position: 'absolute',
    width: 310,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.BORDER_START,
    opacity: 0.2,
    shadowColor: COLORS.BORDER_START,
    shadowOpacity: 0.85,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },

  headerCard: {
    width: Math.min(310, LAYOUT.W * 0.88),
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(10,10,18,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.96)',
    letterSpacing: 7,
    textTransform: 'uppercase',
    textShadowColor: COLORS.BORDER_START,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },

  underline: {
    height: 3,
    width: 140,
    marginTop: 8,
    borderRadius: 3,
    backgroundColor: COLORS.BORDER_START,
    shadowColor: COLORS.BORDER_START,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },

  closeBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.BORDER_START,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeTxt: {
    color: COLORS.TEXT_WHITE,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 28,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    transform: [{ translateY: 3 }],
  },

  equipWrap: {
    position: 'absolute',
    bottom: 78,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  equipBtn: {
    width: 220,
    height: 54,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.BORDER_START,
    backgroundColor: 'rgba(10,10,18,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.BORDER_START,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    overflow: 'hidden',
  },

  equipPressable: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  equipTxtWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  equipTxtAbs: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  equipTxt: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
  },
});
