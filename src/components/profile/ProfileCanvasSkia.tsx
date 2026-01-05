// src/components/profile/ProfileCanvasSkia.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Text } from 'react-native';
import { Canvas, RoundedRect, Text as SkiaText, Group, matchFont } from '@shopify/react-native-skia';
import type { PlayerProfile } from '../../meta/playerProfile';
import { SHOP_BALLS } from '../shop/shopCatalog';
import { CHEST_BALLS } from '../../config/bonusConfig';
import { BallPreviewSkia } from '../shop/BallPreviewSkia';
import { CollectionModal } from './CollectionModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FONT_TITLE = matchFont({ fontFamily: 'sans-serif', fontSize: 24, fontWeight: '900' });
const FONT_STAT_VALUE = matchFont({ fontFamily: 'sans-serif', fontSize: 20, fontWeight: '900' });
const FONT_STAT_LABEL = matchFont({ fontFamily: 'sans-serif', fontSize: 10, fontWeight: '700' });
const FONT_SECTION = matchFont({ fontFamily: 'sans-serif', fontSize: 18, fontWeight: '900' });
const FONT_CARD_TITLE = matchFont({ fontFamily: 'sans-serif', fontSize: 16, fontWeight: '900' });
const FONT_CARD_COUNT = matchFont({ fontFamily: 'sans-serif', fontSize: 14, fontWeight: '700' });
const FONT_UPGRADE = matchFont({ fontFamily: 'sans-serif', fontSize: 14, fontWeight: '700' });
const FONT_UPGRADE_PCT = matchFont({ fontFamily: 'sans-serif', fontSize: 12, fontWeight: '700' });

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

  // Layout constants
  const padding = 24;
  const headerH = 70;
  const statsY = headerH + 20;
  const statsH = 80;
  const cardsY = statsY + statsH + 30;
  const cardH = 180;
  const cardGap = 20;
  const upgradesY = cardsY + cardH * 2 + cardGap * 2 + 30;

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* Background */}
        <RoundedRect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} r={0} color="rgba(10, 10, 20, 0.98)" />

        {/* Header line */}
        <RoundedRect x={padding} y={headerH - 2} width={SCREEN_WIDTH - padding * 2} height={2} r={0} color="rgba(255, 107, 213, 0.3)" />

        {/* Title */}
        <SkiaText x={padding} y={45} text="PROFILE" font={FONT_TITLE} color="#FFE6FF" />

        {/* Stats Cards */}
        <Group>
          {/* Coins */}
          <RoundedRect x={padding} y={statsY} width={(SCREEN_WIDTH - padding * 2 - 24) / 3} height={statsH} r={12} color="rgba(255, 107, 213, 0.1)" />
          <RoundedRect x={padding} y={statsY} width={(SCREEN_WIDTH - padding * 2 - 24) / 3} height={statsH} r={12} color="rgba(255, 107, 213, 0.3)" style="stroke" strokeWidth={2} />
          <SkiaText x={padding + 20} y={statsY + 35} text={`💰 ${profile.totalCoins}`} font={FONT_STAT_VALUE} color="#FFE6FF" />
          <SkiaText x={padding + 20} y={statsY + 60} text="Coins" font={FONT_STAT_LABEL} color="#9CA3AF" />

          {/* Best Score */}
          <RoundedRect x={padding + (SCREEN_WIDTH - padding * 2) / 3 + 12} y={statsY} width={(SCREEN_WIDTH - padding * 2 - 24) / 3} height={statsH} r={12} color="rgba(255, 107, 213, 0.1)" />
          <RoundedRect x={padding + (SCREEN_WIDTH - padding * 2) / 3 + 12} y={statsY} width={(SCREEN_WIDTH - padding * 2 - 24) / 3} height={statsH} r={12} color="rgba(255, 107, 213, 0.3)" style="stroke" strokeWidth={2} />
          <SkiaText x={padding + (SCREEN_WIDTH - padding * 2) / 3 + 32} y={statsY + 35} text={`🏆 ${profile.bestScore}`} font={FONT_STAT_VALUE} color="#FFE6FF" />
          <SkiaText x={padding + (SCREEN_WIDTH - padding * 2) / 3 + 32} y={statsY + 60} text="Best Score" font={FONT_STAT_LABEL} color="#9CA3AF" />

          {/* Balls */}
          <RoundedRect x={padding + (SCREEN_WIDTH - padding * 2) * 2 / 3 + 24} y={statsY} width={(SCREEN_WIDTH - padding * 2 - 24) / 3} height={statsH} r={12} color="rgba(255, 107, 213, 0.1)" />
          <RoundedRect x={padding + (SCREEN_WIDTH - padding * 2) * 2 / 3 + 24} y={statsY} width={(SCREEN_WIDTH - padding * 2 - 24) / 3} height={statsH} r={12} color="rgba(255, 107, 213, 0.3)" style="stroke" strokeWidth={2} />
          <SkiaText x={padding + (SCREEN_WIDTH - padding * 2) * 2 / 3 + 44} y={statsY + 35} text={`🎱 ${profile.ownedBalls.length}`} font={FONT_STAT_VALUE} color="#FFE6FF" />
          <SkiaText x={padding + (SCREEN_WIDTH - padding * 2) * 2 / 3 + 44} y={statsY + 60} text="Balls" font={FONT_STAT_LABEL} color="#9CA3AF" />
        </Group>

        {/* Section title */}
        <SkiaText x={padding} y={cardsY - 15} text="🎱 COLLECTIONS" font={FONT_SECTION} color="#FFE6FF" />

        {/* Shop Balls Card Background */}
        <RoundedRect x={padding} y={cardsY} width={SCREEN_WIDTH - padding * 2} height={cardH} r={16} color="rgba(255, 107, 213, 0.1)" />
        <RoundedRect x={padding} y={cardsY} width={SCREEN_WIDTH - padding * 2} height={cardH} r={16} color="rgba(255, 107, 213, 0.3)" style="stroke" strokeWidth={2} />
        <SkiaText x={padding + 20} y={cardsY + 30} text="SHOP BALLS" font={FONT_CARD_TITLE} color="#FFE6FF" />
        <SkiaText x={padding + 20} y={cardsY + 55} text={`${shopOwned} / ${shopBalls.length}`} font={FONT_CARD_COUNT} color="#fbbf24" />

        {/* Chest Balls Card Background */}
        <RoundedRect x={padding} y={cardsY + cardH + cardGap} width={SCREEN_WIDTH - padding * 2} height={cardH} r={16} color="rgba(255, 107, 213, 0.1)" />
        <RoundedRect x={padding} y={cardsY + cardH + cardGap} width={SCREEN_WIDTH - padding * 2} height={cardH} r={16} color="rgba(34, 211, 238, 0.3)" style="stroke" strokeWidth={2} />
        <SkiaText x={padding + 20} y={cardsY + cardH + cardGap + 30} text="CHEST BALLS" font={FONT_CARD_TITLE} color="#FFE6FF" />
        <SkiaText x={padding + 20} y={cardsY + cardH + cardGap + 55} text={`${chestOwned} / ${chestBalls.length}`} font={FONT_CARD_COUNT} color="#22d3ee" />

        {/* Upgrades Section */}
        <SkiaText x={padding} y={upgradesY} text="⚡ UPGRADES" font={FONT_SECTION} color="#FFE6FF" />

        {/* Shield */}
        <RoundedRect x={padding} y={upgradesY + 20} width={SCREEN_WIDTH - padding * 2} height={60} r={12} color="rgba(255, 107, 213, 0.1)" />
        <RoundedRect x={padding} y={upgradesY + 20} width={SCREEN_WIDTH - padding * 2} height={60} r={12} color="rgba(255, 107, 213, 0.3)" style="stroke" strokeWidth={2} />
        <SkiaText x={padding + 60} y={upgradesY + 45} text="Shield Bank" font={FONT_UPGRADE} color="#E5E7EB" />
        {/* Progress bar */}
        <RoundedRect x={padding + 60} y={upgradesY + 52} width={SCREEN_WIDTH - padding * 2 - 80} height={8} r={4} color="rgba(100, 100, 120, 0.3)" />
        <RoundedRect x={padding + 60} y={upgradesY + 52} width={(SCREEN_WIDTH - padding * 2 - 80) * 0.25} height={8} r={4} color="#ff6bd5" />
        <SkiaText x={SCREEN_WIDTH - padding - 50} y={upgradesY + 45} text="25%" font={FONT_UPGRADE_PCT} color="#9CA3AF" />

        {/* AutoPlay */}
        <RoundedRect x={padding} y={upgradesY + 90} width={SCREEN_WIDTH - padding * 2} height={60} r={12} color="rgba(255, 107, 213, 0.1)" />
        <RoundedRect x={padding} y={upgradesY + 90} width={SCREEN_WIDTH - padding * 2} height={60} r={12} color="rgba(255, 107, 213, 0.3)" style="stroke" strokeWidth={2} />
        <SkiaText x={padding + 60} y={upgradesY + 115} text="Auto-Play Bank" font={FONT_UPGRADE} color="#E5E7EB" />
        <RoundedRect x={padding + 60} y={upgradesY + 122} width={SCREEN_WIDTH - padding * 2 - 80} height={8} r={4} color="rgba(100, 100, 120, 0.3)" />
        <RoundedRect x={padding + 60} y={upgradesY + 122} width={(SCREEN_WIDTH - padding * 2 - 80) * 0.25} height={8} r={4} color="#ff6bd5" />
        <SkiaText x={SCREEN_WIDTH - padding - 50} y={upgradesY + 115} text="25%" font={FONT_UPGRADE_PCT} color="#9CA3AF" />
      </Canvas>

      {/* Close button (React overlay) */}
      <Pressable style={styles.closeButton} onPress={onBack}>
        <Text style={styles.closeButtonText}>✕</Text>
      </Pressable>

      {/* Shop Balls Card - Clickable area + Previews */}
      <Pressable style={[styles.cardHitbox, { top: cardsY }]} onPress={() => setShowShopModal(true)}>
        <View style={styles.previewGrid}>
          {shopBalls.slice(0, 8).map(ball => (
            <View key={ball.id} style={styles.previewItem}>
              <BallPreviewSkia ballId={ball.id} size={30} />
            </View>
          ))}
        </View>
      </Pressable>

      {/* Chest Balls Card - Clickable area + Previews */}
      <Pressable style={[styles.cardHitbox, { top: cardsY + cardH + cardGap }]} onPress={() => setShowChestModal(true)}>
        <View style={styles.previewGrid}>
          {chestBalls.slice(0, 8).map(ball => (
            <View key={ball.id} style={styles.previewItem}>
              <BallPreviewSkia ballId={ball.id} size={30} />
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvas: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 213, 0.2)',
    borderWidth: 2,
    borderColor: '#ff6bd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFE6FF',
  },
  cardHitbox: {
    position: 'absolute',
    left: 24,
    width: SCREEN_WIDTH - 48,
    height: 180,
  },
  previewGrid: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewItem: {
    width: 30,
    height: 30,
  },
});