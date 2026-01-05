// src/components/profile/ProfileCanvasSkia.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text as RNText, Dimensions } from 'react-native';
import { Canvas, Group, RoundedRect, LinearGradient, vec, Shadow, Circle, Blur } from '@shopify/react-native-skia';
import type { PlayerProfile } from '../../meta/playerProfile';
import { SHOP_BALLS } from '../shop/shopCatalog';
import { CHEST_BALLS } from '../../config/bonusConfig';
import { BallPreviewSkia } from '../shop/BallPreviewSkia';
import { CollectionModal } from './CollectionModal';

const { width: W, height: H } = Dimensions.get('window');

type Props = {
  profile: PlayerProfile;
  onProfileUpdate: () => void;
  onBack: () => void;
};

export const ProfileCanvasSkia: React.FC<Props> = ({ profile, onProfileUpdate, onBack }) => {
  const [showShopModal, setShowShopModal] = useState(false);
  const [showChestModal, setShowChestModal] = useState(false);

  const shopBalls = SHOP_BALLS;
  const chestBalls = [...CHEST_BALLS.common, ...CHEST_BALLS.rare, ...CHEST_BALLS.legendary];
  const shopOwned = shopBalls.filter(b => profile.ownedBalls.includes(b.id)).length;
  const chestOwned = chestBalls.filter(b => profile.ownedBalls.includes(b.id)).length;

  // Layout cyberpunk
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

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} pointerEvents="none">
        <Group>
          {/* BACKGROUND GRADIENT ANIMÉ */}
          <RoundedRect x={0} y={0} width={W} height={H} r={0}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(W, H)}
              colors={['#0a0014', '#120a20', '#0a0014']}
            />
          </RoundedRect>

          {/* AMBIENT GLOWS */}
          <Circle cx={W * 0.8} cy={statsY} r={120} color="#ff6bd5" opacity={0.08}>
            <Blur blur={60} />
          </Circle>
          <Circle cx={W * 0.2} cy={collY + 100} r={150} color="#22d3ee" opacity={0.08}>
            <Blur blur={60} />
          </Circle>

          {/* STATS CARDS - CYBERPUNK */}
          {[
            { x: p, color: '#ff6bd5', glow: '#ff6bd5', icon: '💰' },
            { x: p + cardW + 10, color: '#fbbf24', glow: '#fbbf24', icon: '🏆' },
            { x: p + (cardW + 10) * 2, color: '#22d3ee', glow: '#22d3ee', icon: '🎱' },
          ].map((card, i) => (
            <Group key={i}>
              {/* GLOW LAYER */}
              <RoundedRect x={card.x - 2} y={statsY - 2} width={cardW + 4} height={statsH + 4} r={16} color={card.glow} opacity={0.3}>
                <Blur blur={12} />
              </RoundedRect>
              {/* CARD BG */}
              <RoundedRect x={card.x} y={statsY} width={cardW} height={statsH} r={16}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(cardW, statsH)}
                  colors={[`${card.color}22`, `${card.color}11`, '#00000055']}
                />
                <Shadow dx={0} dy={8} blur={20} color={`${card.glow}88`} />
              </RoundedRect>
              {/* BORDER NEON */}
              <RoundedRect x={card.x} y={statsY} width={cardW} height={statsH} r={16} style="stroke" strokeWidth={2} color={card.color} opacity={0.8} />
              {/* INNER GLOW */}
              <RoundedRect x={card.x + 2} y={statsY + 2} width={cardW - 4} height={statsH - 4} r={14} style="stroke" strokeWidth={1} color={card.color} opacity={0.3} />
            </Group>
          ))}

          {/* SHOP CARD - GLASSY */}
          <Group>
            {/* OUTER GLOW */}
            <RoundedRect x={p - 3} y={collY - 3} width={W - p * 2 + 6} height={collH + 6} r={22} color="#ff6bd5" opacity={0.2}>
              <Blur blur={16} />
            </RoundedRect>
            {/* CARD GLASS */}
            <RoundedRect x={p} y={collY} width={W - p * 2} height={collH} r={20}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(W - p * 2, collH)}
                colors={['#ff6bd533', '#8b5cf622', '#00000066']}
              />
              <Shadow dx={0} dy={10} blur={30} color="#ff6bd566" />
            </RoundedRect>
            {/* BORDER NEON */}
            <RoundedRect x={p} y={collY} width={W - p * 2} height={collH} r={20} style="stroke" strokeWidth={3} color="#ff6bd5" opacity={0.9} />
            {/* INNER BORDER */}
            <RoundedRect x={p + 3} y={collY + 3} width={W - p * 2 - 6} height={collH - 6} r={18} style="stroke" strokeWidth={1} color="#ff6bd5" opacity={0.3} />
            {/* ACCENT GLOW */}
            <Circle cx={W - p - 40} cy={collY + 40} r={70} color="#ff6bd5" opacity={0.15}>
              <Blur blur={40} />
            </Circle>
            {/* PREVIEW ZONE */}
            <RoundedRect x={p + 16} y={collY + collH - 80} width={W - p * 2 - 32} height={66} r={14}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(W - p * 2 - 32, 66)}
                colors={['#00000077', '#00000099']}
              />
            </RoundedRect>
            <RoundedRect x={p + 16} y={collY + collH - 80} width={W - p * 2 - 32} height={66} r={14} style="stroke" strokeWidth={1} color="#ff6bd5" opacity={0.3} />
          </Group>

          {/* CHEST CARD - GLASSY */}
          <Group>
            <RoundedRect x={p - 3} y={collY + collH + collGap - 3} width={W - p * 2 + 6} height={collH + 6} r={22} color="#22d3ee" opacity={0.2}>
              <Blur blur={16} />
            </RoundedRect>
            <RoundedRect x={p} y={collY + collH + collGap} width={W - p * 2} height={collH} r={20}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(W - p * 2, collH)}
                colors={['#22d3ee33', '#06b6d422', '#00000066']}
              />
              <Shadow dx={0} dy={10} blur={30} color="#22d3ee66" />
            </RoundedRect>
            <RoundedRect x={p} y={collY + collH + collGap} width={W - p * 2} height={collH} r={20} style="stroke" strokeWidth={3} color="#22d3ee" opacity={0.9} />
            <RoundedRect x={p + 3} y={collY + collH + collGap + 3} width={W - p * 2 - 6} height={collH - 6} r={18} style="stroke" strokeWidth={1} color="#22d3ee" opacity={0.3} />
            <Circle cx={W - p - 40} cy={collY + collH + collGap + 40} r={70} color="#22d3ee" opacity={0.15}>
              <Blur blur={40} />
            </Circle>
            <RoundedRect x={p + 16} y={collY + collH + collGap + collH - 80} width={W - p * 2 - 32} height={66} r={14}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(W - p * 2 - 32, 66)}
                colors={['#00000077', '#00000099']}
              />
            </RoundedRect>
            <RoundedRect x={p + 16} y={collY + collH + collGap + collH - 80} width={W - p * 2 - 32} height={66} r={14} style="stroke" strokeWidth={1} color="#22d3ee" opacity={0.3} />
          </Group>

          {/* UPGRADES - THICK BARS */}
          {[
            { y: upgradesY + 35, percent: shieldPercent, color1: '#ff6bd5', color2: '#a855f7' },
            { y: upgradesY + 125, percent: autoPlayPercent, color1: '#22d3ee', color2: '#06b6d4' },
          ].map((up, i) => {
            const barW = W - p * 2 - 110;
            const fillW = (barW * up.percent) / 100;
            return (
              <Group key={i}>
                {/* CARD GLOW */}
                <RoundedRect x={p - 2} y={up.y - 2} width={W - p * 2 + 4} height={74} r={16} color={up.color1} opacity={0.2}>
                  <Blur blur={12} />
                </RoundedRect>
                {/* CARD BG */}
                <RoundedRect x={p} y={up.y} width={W - p * 2} height={70} r={14}>
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(W - p * 2, 70)}
                    colors={[`${up.color1}22`, `${up.color2}11`, '#00000055']}
                  />
                  <Shadow dx={0} dy={6} blur={16} color={`${up.color1}66`} />
                </RoundedRect>
                {/* BORDER */}
                <RoundedRect x={p} y={up.y} width={W - p * 2} height={70} r={14} style="stroke" strokeWidth={2} color={up.color1} opacity={0.7} />
                {/* BAR BG */}
                <RoundedRect x={p + 60} y={up.y + 42} width={barW} height={14} r={7} color="#ffffff11" />
                <RoundedRect x={p + 60} y={up.y + 42} width={barW} height={14} r={7} style="stroke" strokeWidth={1} color={up.color1} opacity={0.3} />
                {/* BAR FILL GLOW */}
                <RoundedRect x={p + 60 - 2} y={up.y + 42 - 2} width={fillW + 4} height={18} r={9} color={up.color1} opacity={0.4}>
                  <Blur blur={8} />
                </RoundedRect>
                {/* BAR FILL */}
                <RoundedRect x={p + 60} y={up.y + 42} width={fillW} height={14} r={7}>
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(fillW, 14)}
                    colors={[up.color1, up.color2]}
                  />
                  <Shadow dx={0} dy={2} blur={8} color={`${up.color1}CC`} />
                </RoundedRect>
              </Group>
            );
          })}
        </Group>
      </Canvas>

      {/* TEXTES */}
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

      {/* Header */}
 <View style={styles.header}>
        <View>
          <RNText style={styles.title}>PROFILE</RNText>
          <View style={styles.titleUnderline} />
        </View>
        <Pressable style={styles.closeBtn} onPress={onBack}>
          <RNText style={styles.closeTxt}>✕</RNText>
        </Pressable>
      </View>

      {/* Hitboxes */}
      <Pressable 
        style={[styles.hitbox, { top: collY, height: collH }]} 
        onPress={() => {
          console.log('🔥 SHOP PRESSED !');
          setShowShopModal(true);
        }}
      >
        <View style={styles.preview}>
          {shopBalls.slice(0, 8).map(b => (
            <View key={b.id} style={styles.prevItem}>
              <BallPreviewSkia ballId={b.id} size={36} />
            </View>
          ))}
        </View>
      </Pressable>

      <Pressable 
        style={[styles.hitbox, { top: collY + collH + collGap, height: collH }]} 
        onPress={() => {
          console.log('🔥 CHEST PRESSED !');
          setShowChestModal(true);
        }}
      >
        <View style={styles.preview}>
          {chestBalls.slice(0, 8).map(b => (
            <View key={b.id} style={styles.prevItem}>
              <BallPreviewSkia ballId={b.id} size={36} />
            </View>
          ))}
        </View>
      </Pressable>

      {/* Modals */}
      {showShopModal && (
        <CollectionModal
          title="SHOP BALLS"
          balls={shopBalls}
          profile={profile}
          onClose={() => setShowShopModal(false)}
          onProfileUpdate={onProfileUpdate}
        />
      )}
      {showChestModal && (
        <CollectionModal
          title="CHEST BALLS"
          balls={chestBalls}
          profile={profile}
          onClose={() => setShowChestModal(false)}
          onProfileUpdate={onProfileUpdate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  canvas: { width: W, height: H },
  textLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, height: 75, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 24, borderBottomWidth: 2, borderBottomColor: '#ff6bd555' },
  title: { fontSize: 32, fontWeight: '900', color: '#FFE6FF', letterSpacing: 4, textShadowColor: '#ff6bd5', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  titleUnderline: { height: 3, width: 80, backgroundColor: '#ff6bd5', marginTop: 4, borderRadius: 2 },
  closeBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ff6bd522', borderWidth: 2, borderColor: '#ff6bd5', justifyContent: 'center', alignItems: 'center' },
  closeTxt: { fontSize: 24, fontWeight: '700', color: '#FFE6FF' },
  statIcon: { position: 'absolute', fontSize: 32 },
  statNum: { position: 'absolute', fontSize: 24, fontWeight: '900', color: '#FFE6FF', textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  statLbl: { position: 'absolute', fontSize: 9, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1 },
  collTitle: { position: 'absolute', fontSize: 22, fontWeight: '900', color: '#FFE6FF', letterSpacing: 2, textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  collSub: { position: 'absolute', fontSize: 12, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5 },
  collCount: { position: 'absolute', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  upTitle: { position: 'absolute', fontSize: 20, fontWeight: '900', color: '#FFE6FF', letterSpacing: 2, textShadowColor: '#ff6bd5', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  upIcon: { position: 'absolute', fontSize: 28 },
  upName: { position: 'absolute', fontSize: 15, fontWeight: '700', color: '#E5E7EB' },
  upPct: { position: 'absolute', fontSize: 18, fontWeight: '900', color: '#FFE6FF', textShadowColor: '#ff6bd5', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  hitbox: { position: 'absolute', left: 16, width: W - 32 },
  preview: { position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  prevItem: { width: 36, height: 36 },
});