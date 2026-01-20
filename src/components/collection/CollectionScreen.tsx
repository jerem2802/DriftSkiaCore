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
  useImage,
} from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue, useDerivedValue } from 'react-native-reanimated';
import type { PlayerProfile } from '../../meta/playerProfile';
import { SHOP_BALLS } from '../shop/shopCatalog';
import { CHEST_BALLS } from '../../config/bonusConfig';
import { GlassCard } from './glasscard';
import { useCollectionGesture } from './useCollectionGesture';
import { LAYOUT, COLORS, getCardX } from './collectionLayout';

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
  const metalImage = useImage(require('../../assets/images/glasscard.png'));

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
        <View>
          <RNText style={styles.title}>COLLECTION</RNText>
          <View style={styles.underline} />
        </View>

        <Pressable onPress={onBack} style={styles.closeBtn}>
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
  canvas: {
    width: LAYOUT.W,
    height: LAYOUT.H,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    paddingTop: 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.TEXT_WHITE,
    letterSpacing: 4,
  },
  underline: {
    height: 4,
    width: 140,
    backgroundColor: COLORS.BORDER_START,
    marginTop: 6,
    borderRadius: 2,
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
  closeTxt: { color: COLORS.TEXT_WHITE, fontSize: 24, fontWeight: '800' },
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
