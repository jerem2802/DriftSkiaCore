import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Text as RNText } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Circle,
  Blur,
  Group,
} from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue, useDerivedValue } from 'react-native-reanimated';
import type { PlayerProfile } from '../../meta/playerProfile';
import { SHOP_BALLS } from '../shop/shopCatalog';
import { CHEST_BALLS } from '../../config/bonusConfig';
import { GlassCard } from './glasscard';
import { useCollectionGesture } from './useCollectionGesture';
import { LAYOUT, COLORS, getCardX } from './collectionLayout';
import { usePreloadedAssets } from '../../contexts/PreloadContext';

type Props = {
  profile: PlayerProfile;
  onBack: () => void;
};

type Ball = {
  id: string;
  name: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
};

export const CollectionScreen: React.FC<Props> = ({ profile, onBack }) => {
  const allBalls = useMemo<Ball[]>(() => {
    const shop = SHOP_BALLS.map((b) => ({
      id: b.id,
      name: b.name,
      rarity: ('rarity' in b ? b.rarity : undefined) as Ball['rarity'],
    }));

    const chest = [...CHEST_BALLS.common, ...CHEST_BALLS.rare, ...CHEST_BALLS.legendary].map((b) => ({
      id: b.id,
      name: b.name,
      rarity: b.rarity as Ball['rarity'],
    }));

    return [...shop, ...chest];
  }, []);

  const ownedBalls = useMemo(
    () => allBalls.filter((b) => profile.ownedBalls.includes(b.id)),
    [allBalls, profile.ownedBalls]
  );

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

  const startX = (LAYOUT.W - LAYOUT.CARD_W) / 2;
  const startY = (LAYOUT.H - LAYOUT.CARD_H) / 2;

  // ✅ charge 1 fois ici (stable)
  const { glassCard: metalImage } = usePreloadedAssets();

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.body}>
          <Canvas style={styles.canvas} pointerEvents="none">
            {/* Background */}
            <RoundedRect x={0} y={0} width={LAYOUT.W} height={LAYOUT.H} r={0}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(LAYOUT.W, LAYOUT.H)}
                colors={['#06000f', '#120a20', '#06000f']}
              />
            </RoundedRect>

            <Circle cx={LAYOUT.W * 0.8} cy={LAYOUT.H * 0.3} r={200} color={COLORS.GLOW_PINK} opacity={0.08}>
              <Blur blur={100} />
            </Circle>

            <Circle cx={LAYOUT.W * 0.2} cy={LAYOUT.H * 0.7} r={250} color={COLORS.GLOW_CYAN} opacity={0.06}>
              <Blur blur={120} />
            </Circle>

            {/* Cards */}
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
        {/* slot gauche = même largeur que le bouton close -> centrage parfait */}
        <View style={styles.headerLeftSlot} />

        <View style={styles.headerCenter}>
          {/* halo néon (fake blur) */}
          <View style={styles.headerGlow} />

          {/* card glass */}
          <View style={styles.headerCard}>
            <RNText style={styles.title}>COLLECTION</RNText>
            <View style={styles.underline} />
          </View>
        </View>

        <Pressable onPress={onBack} style={styles.closeBtn} hitSlop={10}>
          <RNText style={styles.closeTxt}>✕</RNText>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer} pointerEvents="none">
        <RNText style={styles.counter}>
          {ownedBalls.length} / {allBalls.length} UNLOCKED
        </RNText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  body: { flex: 1 },
  canvas: { width: LAYOUT.W, height: LAYOUT.H },

  // ✅ header descendu + centré
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingTop: 44, // ✅ sous la zone top foncée
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerLeftSlot: {
    width: 50,
    height: 50,
  },

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
    opacity: 0.20,
    shadowColor: COLORS.BORDER_START,
    shadowOpacity: 0.85,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },

  headerCard: {
    width: 310,
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
  lineHeight: 28,           // ✅ important (égale à fontSize)
  textAlign: 'center',
  includeFontPadding: false, // ✅ Android: enlève le padding interne des fonts
  textAlignVertical: 'center',// ✅ Android: aide au centrage vertical
  transform: [{ translateY: 3 }], // ✅ micro offset visuel
},



  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counter: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT_GRAY,
    letterSpacing: 2,
  },
});
