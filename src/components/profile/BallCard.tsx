// src/components/profile/BallCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BallPreviewSkia } from '../shop/BallPreviewSkia';

type Ball = {
  id: string;
  name: string;
  desc?: string;
  price?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
};

type Props = {
  ball: Ball;
  owned: boolean;
  equipped: boolean;
  accent: string;
  accentGradient: string[];
  onAction: (ballId: string, owned: boolean) => void;
};

const getRarityInfo = (rarity?: string) => {
  if (!rarity) return null;
  const map = {
    common: { label: 'COMMON', color: '#f59e0b' },
    rare: { label: 'RARE', color: '#3b82f6' },
    epic: { label: 'EPIC', color: '#a855f7' },
    legendary: { label: 'LEGENDARY', color: '#ff6bd5' },
  };
  return map[rarity as keyof typeof map] || null;
};

export const BallCard = React.memo<Props>(({ ball, owned, equipped, accent, accentGradient, onAction }) => {
  const rarityInfo = getRarityInfo(ball.rarity);
  const disabled = !owned;

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={equipped ? ['#22c55e', '#16a34a'] : accentGradient}
        style={styles.cardBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.card}>
          {/* Left: Ball Zone */}
          <View style={styles.ballZone}>
            <View style={styles.ballGlow}>
              <BallPreviewSkia ballId={ball.id} size={100} />
            </View>
            {!owned && (
              <View style={[styles.lockBadge, { borderColor: accent, backgroundColor: `${accent}CC` }]}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            )}
          </View>

          {/* Right: Content */}
          <View style={styles.contentZone}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={1}>
                {ball.name}
              </Text>
              {rarityInfo && (
                <View style={[styles.rarityBadge, { backgroundColor: `${rarityInfo.color}33` }]}>
                  <Text style={[styles.rarityText, { color: rarityInfo.color }]}>{rarityInfo.label}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text style={styles.cardDesc} numberOfLines={2}>
              {ball.desc || 'A powerful stream of liquid energy that leaves a dazzling trail.'}
            </Text>

            {/* Bottom Row: Price + Button */}
            <View style={styles.bottomRow}>
              {ball.price !== undefined && (
                <View style={styles.priceZone}>
                  <Text style={styles.priceIcon}>💰</Text>
                  <Text style={styles.priceText}>{ball.price}</Text>
                </View>
              )}

              <Pressable onPress={() => onAction(ball.id, owned)} style={styles.btnWrapper} disabled={disabled}>
                <LinearGradient
                  colors={equipped ? ['#22c55e', '#16a34a'] : owned ? accentGradient : ['#2a2a3a', '#1a1a2a']}
                  style={styles.btn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.btnText}>{equipped ? 'EQUIPPED' : owned ? 'EQUIP' : 'LOCKED'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  cardWrapper: {
    height: 160,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardBorder: {
    flex: 1,
    borderRadius: 20,
    padding: 3,
  },
  card: {
    flex: 1,
    backgroundColor: '#0f0a1a',
    borderRadius: 18,
    flexDirection: 'row',
    padding: 12,
  },
  ballZone: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#2a1a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ballGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
  },
  contentZone: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CCCCDD',
    lineHeight: 14,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceIcon: {
    fontSize: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fbbf24',
  },
  btnWrapper: {
    width: 100,
  },
  btn: {
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
});