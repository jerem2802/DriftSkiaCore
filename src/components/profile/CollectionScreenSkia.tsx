// src/components/profile/CollectionScreenSkia.tsx
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Text as RNText, Dimensions } from 'react-native';
import {
  Canvas,
  Group,
  RoundedRect,
  LinearGradient,
  vec,
  Shadow,
  Circle,
  Blur,
} from '@shopify/react-native-skia';

import { useFrameCallback, useSharedValue } from 'react-native-reanimated';

import type { PlayerProfile } from '../../meta/playerProfile';
import { SHOP_BALLS } from '../shop/shopCatalog';
import { CHEST_BALLS } from '../../config/bonusConfig';

import { CollectionDetailScreen } from './CollectionDetailScreen';
import { BallPreviewNode } from '../shop/BallPreviewNode';

const { width: W, height: H } = Dimensions.get('window');

type Props = {
  profile: PlayerProfile;
  onProfileUpdate: () => void;
  onBack: () => void;
};

type OpenCollection = null | 'shop' | 'chest';

export const CollectionScreenSkia: React.FC<Props> = ({ profile, onProfileUpdate, onBack }) => {
  const [openCollection, setOpenCollection] = useState<OpenCollection>(null);

  const shopBalls = useMemo(() => SHOP_BALLS, []);
  const chestBalls = useMemo(
    () => [...CHEST_BALLS.common, ...CHEST_BALLS.rare, ...CHEST_BALLS.legendary],
    []
  );

  const shopOwned = useMemo(
    () => shopBalls.filter((b) => profile.ownedBalls.includes(b.id)).length,
    [shopBalls, profile.ownedBalls]
  );
  const chestOwned = useMemo(
    () => chestBalls.filter((b) => profile.ownedBalls.includes(b.id)).length,
    [chestBalls, profile.ownedBalls]
  );

  // time for previews
  const time = useSharedValue(0);
  useFrameCallback((fi) => {
    'worklet';
    time.value = (fi.timestamp ?? 0) / 1000;
  });

  if (openCollection === 'shop') {
    return (
      <CollectionDetailScreen
        title="SHOP BALLS"
        balls={shopBalls}
        profile={profile}
        onBack={() => setOpenCollection(null)}
        onProfileUpdate={onProfileUpdate}
      />
    );
  }

  if (openCollection === 'chest') {
    return (
      <CollectionDetailScreen
        title="CHEST BALLS"
        balls={chestBalls}
        profile={profile}
        onBack={() => setOpenCollection(null)}
        onProfileUpdate={onProfileUpdate}
      />
    );
  }

  // Layout
  const p = 16;
  const statsY = 80;
  const statsH = 90;
  const cardW = (W - p * 2 - 20) / 3;

  const collY = statsY + statsH + 24;
  const collH = 200;
  const collGap = 20;

  const upgradesY = collY + collH * 2 + collGap + 24;

  const shieldPercent = (profile.upgrades.shieldBank / 4) * 100;
  const autoPlayPercent = (profile.upgrades.autoPlayBank / 4) * 100;

  // previews row geometry (shared)
  const stripX = p + 16;
  const stripW = W - p * 2 - 32;
  const stripH = 66;
  const stripPad = 18;

  const previewCount = 6;
  const previewSize = 34;
  const previewAvail = stripW - stripPad * 2;
  const gap = previewCount > 1 ? (previewAvail - previewCount * previewSize) / (previewCount - 1) : 0;

  const renderPreviewRow = (ballsForRow: { id: string }[], cy: number, accent: string) => {
    const items = ballsForRow.slice(0, previewCount);

    return (
      <Group>
        {/* clip strip */}
        <RoundedRect x={stripX} y={cy - stripH / 2} width={stripW} height={stripH} r={14} color="#00000066" />
        <RoundedRect
          x={stripX}
          y={cy - stripH / 2}
          width={stripW}
          height={stripH}
          r={14}
          style="stroke"
          strokeWidth={1}
          color={accent}
          opacity={0.25}
        />

        <Group clip={{ x: stripX, y: cy - stripH / 2, width: stripW, height: stripH }}>
          {items.map((b, idx) => {
            const cx = stripX + stripPad + previewSize / 2 + idx * (previewSize + gap);
            return (
              <Group key={`${b.id}-${idx}`}>
                <Circle cx={cx} cy={cy} r={previewSize / 2 + 10} color={accent} opacity={0.06}>
                  <Blur blur={14} />
                </Circle>
                <BallPreviewNode ballId={b.id} cx={cx} cy={cy} size={previewSize} time={time} />
              </Group>
            );
          })}
        </Group>
      </Group>
    );
  };

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} pointerEvents="none">
        <Group>
          {/* BACKGROUND */}
          <RoundedRect x={0} y={0} width={W} height={H} r={0}>
            <LinearGradient start={vec(0, 0)} end={vec(W, H)} colors={['#0a0014', '#120a20', '#0a0014']} />
          </RoundedRect>

          {/* AMBIENT GLOWS */}
          <Circle cx={W * 0.8} cy={statsY} r={120} color="#ff6bd5" opacity={0.08}>
            <Blur blur={60} />
          </Circle>
          <Circle cx={W * 0.2} cy={collY + 100} r={150} color="#22d3ee" opacity={0.08}>
            <Blur blur={60} />
          </Circle>

          {/* STATS CARDS */}
          {[
            { x: p, color: '#ff6bd5', glow: '#ff6bd5' },
            { x: p + cardW + 10, color: '#fbbf24', glow: '#fbbf24' },
            { x: p + (cardW + 10) * 2, color: '#22d3ee', glow: '#22d3ee' },
          ].map((card, i) => (
            <Group key={i}>
              <RoundedRect x={card.x - 2} y={statsY - 2} width={cardW + 4} height={statsH + 4} r={16} color={card.glow} opacity={0.3}>
                <Blur blur={12} />
              </RoundedRect>

              <RoundedRect x={card.x} y={statsY} width={cardW} height={statsH} r={16}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(cardW, statsH)}
                  colors={[`${card.color}22`, `${card.color}11`, '#00000055']}
                />
                <Shadow dx={0} dy={8} blur={20} color={`${card.glow}88`} />
              </RoundedRect>

              <RoundedRect x={card.x} y={statsY} width={cardW} height={statsH} r={16} style="stroke" strokeWidth={2} color={card.color} opacity={0.8} />
              <RoundedRect x={card.x + 2} y={statsY + 2} width={cardW - 4} height={statsH - 4} r={14} style="stroke" strokeWidth={1} color={card.color} opacity={0.3} />
            </Group>
          ))}

          {/* SHOP CARD */}
          <Group>
            <RoundedRect x={p - 3} y={collY - 3} width={W - p * 2 + 6} height={collH + 6} r={22} color="#ff6bd5" opacity={0.2}>
              <Blur blur={16} />
            </RoundedRect>

            <RoundedRect x={p} y={collY} width={W - p * 2} height={collH} r={20}>
              <LinearGradient start={vec(0, 0)} end={vec(W - p * 2, collH)} colors={['#ff6bd533', '#8b5cf622', '#00000066']} />
              <Shadow dx={0} dy={10} blur={30} color="#ff6bd566" />
            </RoundedRect>

            <RoundedRect x={p} y={collY} width={W - p * 2} height={collH} r={20} style="stroke" strokeWidth={3} color="#ff6bd5" opacity={0.9} />
            <RoundedRect x={p + 3} y={collY + 3} width={W - p * 2 - 6} height={collH - 6} r={18} style="stroke" strokeWidth={1} color="#ff6bd5" opacity={0.3} />

            <Circle cx={W - p - 40} cy={collY + 40} r={70} color="#ff6bd5" opacity={0.15}>
              <Blur blur={40} />
            </Circle>

            {/* preview strip */}
            {renderPreviewRow(shopBalls, collY + collH - 80 + stripH / 2, '#ff6bd5')}
          </Group>

          {/* CHEST CARD */}
          <Group>
            <RoundedRect x={p - 3} y={collY + collH + collGap - 3} width={W - p * 2 + 6} height={collH + 6} r={22} color="#22d3ee" opacity={0.2}>
              <Blur blur={16} />
            </RoundedRect>

            <RoundedRect x={p} y={collY + collH + collGap} width={W - p * 2} height={collH} r={20}>
              <LinearGradient start={vec(0, 0)} end={vec(W - p * 2, collH)} colors={['#22d3ee33', '#06b6d422', '#00000066']} />
              <Shadow dx={0} dy={10} blur={30} color="#22d3ee66" />
            </RoundedRect>

            <RoundedRect x={p} y={collY + collH + collGap} width={W - p * 2} height={collH} r={20} style="stroke" strokeWidth={3} color="#22d3ee" opacity={0.9} />
            <RoundedRect x={p + 3} y={collY + collH + collGap + 3} width={W - p * 2 - 6} height={collH - 6} r={18} style="stroke" strokeWidth={1} color="#22d3ee" opacity={0.3} />

            <Circle cx={W - p - 40} cy={collY + collH + collGap + 40} r={70} color="#22d3ee" opacity={0.15}>
              <Blur blur={40} />
            </Circle>

            {/* preview strip */}
            {renderPreviewRow(chestBalls, collY + collH + collGap + collH - 80 + stripH / 2, '#22d3ee')}
          </Group>

          {/* UPGRADES */}
          {[
            { y: upgradesY + 35, percent: shieldPercent, color1: '#ff6bd5', color2: '#a855f7' },
            { y: upgradesY + 125, percent: autoPlayPercent, color1: '#22d3ee', color2: '#06b6d4' },
          ].map((up, i) => {
            const barW = W - p * 2 - 110;
            const fillW = (barW * up.percent) / 100;

            return (
              <Group key={i}>
                <RoundedRect x={p - 2} y={up.y - 2} width={W - p * 2 + 4} height={74} r={16} color={up.color1} opacity={0.2}>
                  <Blur blur={12} />
                </RoundedRect>

                <RoundedRect x={p} y={up.y} width={W - p * 2} height={70} r={14}>
                  <LinearGradient start={vec(0, 0)} end={vec(W - p * 2, 70)} colors={[`${up.color1}22`, `${up.color2}11`, '#00000055']} />
                  <Shadow dx={0} dy={6} blur={16} color={`${up.color1}66`} />
                </RoundedRect>

                <RoundedRect x={p} y={up.y} width={W - p * 2} height={70} r={14} style="stroke" strokeWidth={2} color={up.color1} opacity={0.7} />

                <RoundedRect x={p + 60} y={up.y + 42} width={barW} height={14} r={7} color="#ffffff11" />
                <RoundedRect x={p + 60} y={up.y + 42} width={barW} height={14} r={7} style="stroke" strokeWidth={1} color={up.color1} opacity={0.3} />

                <RoundedRect x={p + 60 - 2} y={up.y + 42 - 2} width={fillW + 4} height={18} r={9} color={up.color1} opacity={0.4}>
                  <Blur blur={8} />
                </RoundedRect>

                <RoundedRect x={p + 60} y={up.y + 42} width={fillW} height={14} r={7}>
                  <LinearGradient start={vec(0, 0)} end={vec(Math.max(1, fillW), 14)} colors={[up.color1, up.color2]} />
                  <Shadow dx={0} dy={2} blur={8} color={`${up.color1}CC`} />
                </RoundedRect>
              </Group>
            );
          })}
        </Group>
      </Canvas>

      {/* TEXT LAYER (RN) */}
      <View style={styles.textLayer} pointerEvents="none">
        {/* Stats */}
        <RNText style={[styles.statIcon, { left: p + cardW / 2 - 14, top: statsY + 18 }]}>💰</RNText>
        <RNText style={[styles.statNum, { left: p + cardW / 2 - 30, top: statsY + 46 }]}>{profile.totalCoins}</RNText>
        <RNText style={[styles.statLbl, { left: p + cardW / 2 - 18, top: statsY + 70 }]}>COINS</RNText>

        <RNText style={[styles.statIcon, { left: p + cardW + 10 + cardW / 2 - 14, top: statsY + 18 }]}>🏆</RNText>
        <RNText style={[styles.statNum, { left: p + cardW + 10 + cardW / 2 - 30, top: statsY + 46 }]}>{profile.bestScore}</RNText>
        <RNText style={[styles.statLbl, { left: p + cardW + 10 + cardW / 2 - 32, top: statsY + 70 }]}>BEST SCORE</RNText>

        <RNText style={[styles.statIcon, { left: p + (cardW + 10) * 2 + cardW / 2 - 14, top: statsY + 18 }]}>🎱</RNText>
        <RNText style={[styles.statNum, { left: p + (cardW + 10) * 2 + cardW / 2 - 20, top: statsY + 46 }]}>{profile.ownedBalls.length}</RNText>
        <RNText style={[styles.statLbl, { left: p + (cardW + 10) * 2 + cardW / 2 - 18, top: statsY + 70 }]}>BALLS</RNText>

        {/* Collections */}
        <RNText style={[styles.collTitle, { left: p + 20, top: collY + 20 }]}>SHOP BALLS</RNText>
        <RNText style={[styles.collSub, { left: p + 20, top: collY + 46 }]}>Collectibles from the shop</RNText>
        <RNText style={[styles.collCount, { left: p + 20, top: collY + 72, color: '#fbbf24' }]}>
          {shopOwned} / {shopBalls.length} OWNED
        </RNText>

        <RNText style={[styles.collTitle, { left: p + 20, top: collY + collH + collGap + 20 }]}>CHEST BALLS</RNText>
        <RNText style={[styles.collSub, { left: p + 20, top: collY + collH + collGap + 46 }]}>Exclusive rewards</RNText>
        <RNText style={[styles.collCount, { left: p + 20, top: collY + collH + collGap + 72, color: '#22d3ee' }]}>
          {chestOwned} / {chestBalls.length} OWNED
        </RNText>

        {/* Upgrades */}
        <RNText style={[styles.upTitle, { left: p, top: upgradesY }]}>⚡ UPGRADES</RNText>
        <RNText style={[styles.upIcon, { left: p + 16, top: upgradesY + 55 }]}>🛡️</RNText>
        <RNText style={[styles.upName, { left: p + 60, top: upgradesY + 52 }]}>Shield Bank</RNText>
        <RNText style={[styles.upPct, { right: p + 16, top: upgradesY + 52 }]}>{Math.round(shieldPercent)}%</RNText>

        <RNText style={[styles.upIcon, { left: p + 16, top: upgradesY + 145 }]}>⚡</RNText>
        <RNText style={[styles.upName, { left: p + 60, top: upgradesY + 142 }]}>Auto-Play Bank</RNText>
        <RNText style={[styles.upPct, { right: p + 16, top: upgradesY + 142 }]}>{Math.round(autoPlayPercent)}%</RNText>
      </View>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <RNText style={styles.title}>COLLECTION</RNText>
          <View style={styles.titleUnderline} />
        </View>
        <Pressable style={styles.closeBtn} onPress={onBack}>
          <RNText style={styles.closeTxt}>✕</RNText>
        </Pressable>
      </View>

      {/* HITBOXES */}
      <Pressable style={[styles.hitbox, { top: collY, height: collH }]} onPress={() => setOpenCollection('shop')} />
      <Pressable style={[styles.hitbox, { top: collY + collH + collGap, height: collH }]} onPress={() => setOpenCollection('chest')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  canvas: { width: W, height: H },
  textLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#ff6bd555',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 4,
    textShadowColor: '#ff6bd5',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  titleUnderline: { height: 3, width: 80, backgroundColor: '#ff6bd5', marginTop: 4, borderRadius: 2 },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ff6bd522',
    borderWidth: 2,
    borderColor: '#ff6bd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTxt: { fontSize: 24, fontWeight: '700', color: '#FFE6FF' },

  statIcon: { position: 'absolute', fontSize: 32 },
  statNum: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '900',
    color: '#FFE6FF',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statLbl: { position: 'absolute', fontSize: 9, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1 },

  collTitle: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  collSub: { position: 'absolute', fontSize: 12, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5 },
  collCount: { position: 'absolute', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  upTitle: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 2,
    textShadowColor: '#ff6bd5',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  upIcon: { position: 'absolute', fontSize: 28 },
  upName: { position: 'absolute', fontSize: 15, fontWeight: '700', color: '#E5E7EB' },
  upPct: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '900',
    color: '#FFE6FF',
    textShadowColor: '#ff6bd5',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  hitbox: { position: 'absolute', left: 16, width: W - 32 },
});