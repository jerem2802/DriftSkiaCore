// src/components/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { loadProfile, setSelectedBall, type PlayerProfile } from '../meta/playerProfile';
import { SHOP_BALLS } from './shop/shopCatalog';
import { CHEST_BALLS } from '../config/bonusConfig';
import { BallPreviewSkia } from './shop/BallPreviewSkia';

type ProfileScreenProps = {
  onClose: () => void;
  onBallChanged?: () => void; // ✅ AJOUT
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onClose, onBallChanged }) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    loadProfile().then(p => setProfile(p));
  }, []);

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#FFF' }}>Loading...</Text>
      </View>
    );
  }

  const handleEquipBall = async (ballId: string) => {
    const updated = await setSelectedBall(ballId);
    setProfile(updated);
    onBallChanged?.(); // ✅ NOTIFIE App.tsx
  };

  const isOwned = (ballId: string) => profile.ownedBalls.includes(ballId);
  const isEquipped = (ballId: string) => profile.selectedBallId === ballId;

  // Toutes les balles du shop
  const shopBalls = SHOP_BALLS;

  // Toutes les balles des coffres (common + rare + legendary)
  const chestBalls = [
    ...CHEST_BALLS.common,
    ...CHEST_BALLS.rare,
    ...CHEST_BALLS.legendary,
  ];

  const totalBalls = shopBalls.length + chestBalls.length;
  const ownedCount = profile.ownedBalls.length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* STATS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 STATS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>💰 {profile.totalCoins}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🏆 {profile.bestScore}</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>
          </View>
        </View>

        {/* BALLS COLLECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎱 MY BALLS ({ownedCount}/{totalBalls})</Text>

          {/* SHOP BALLS */}
          <Text style={styles.subsectionTitle}>SHOP BALLS</Text>
          <View style={styles.ballGrid}>
            {shopBalls.map((ball: any) => {
              const owned = isOwned(ball.id);
              const equipped = isEquipped(ball.id);

              return (
                <Pressable
                  key={ball.id}
                  style={[styles.ballCard, !owned && styles.ballCardLocked]}
                  onPress={() => owned && handleEquipBall(ball.id)}
                  disabled={!owned}
                >
                  <View style={styles.ballIconContainer}>
                    <View style={!owned && styles.ballOverlay}>
                      <BallPreviewSkia ballId={ball.id} size={40} />
                    </View>
                    {!owned && (
                      <View style={styles.lockBadge}>
                        <Text style={styles.lockIcon}>🔒</Text>
                      </View>
                    )}
                    {equipped && (
                      <View style={styles.equippedBadge}>
                        <Text style={styles.equippedText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.ballName, !owned && styles.ballNameLocked]} numberOfLines={1}>
                    {owned ? ball.name : 'Locked'}
                  </Text>
                  {!owned && <Text style={styles.ballPrice}>{ball.price}💰</Text>}
                </Pressable>
              );
            })}
          </View>

          {/* CHEST BALLS */}
          <Text style={styles.subsectionTitle}>CHEST BALLS</Text>
          <View style={styles.ballGrid}>
            {chestBalls.map((ball) => {
              const owned = isOwned(ball.id);
              const equipped = isEquipped(ball.id);

              return (
                <Pressable
                  key={ball.id}
                  style={[styles.ballCard, !owned && styles.ballCardLocked]}
                  onPress={() => owned && handleEquipBall(ball.id)}
                  disabled={!owned}
                >
                  <View style={styles.ballIconContainer}>
                    <View style={!owned && styles.ballOverlay}>
                      <BallPreviewSkia ballId={ball.id} size={40} />
                    </View>
                    {!owned && (
                      <View style={styles.lockBadge}>
                        <Text style={styles.lockIcon}>🔒</Text>
                      </View>
                    )}
                    {equipped && (
                      <View style={styles.equippedBadge}>
                        <Text style={styles.equippedText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.ballName, !owned && styles.ballNameLocked]} numberOfLines={1}>
                    {owned ? ball.name : 'Locked'}
                  </Text>
                  {!owned && (
                    <Text style={styles.ballSource}>
                      {ball.rarity === 'common' ? 'Bronze' : ball.rarity === 'rare' ? 'Silver' : 'Neon'}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* UPGRADES SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ UPGRADES</Text>

          {/* Shield Bank */}
          <View style={styles.upgradeItem}>
            <Text style={styles.upgradeIcon}>🛡️</Text>
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeName}>Shield Bank</Text>
              <View style={styles.upgradeBar}>
                {[1, 2, 3, 4].map((segment) => (
                  <View
                    key={segment}
                    style={[
                      styles.upgradeSegment,
                      segment <= 1 && styles.upgradeSegmentActive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.upgradeLevel}>Lvl 1/4 (1 shield max)</Text>
            </View>
          </View>

          {/* Auto-Play Bank */}
          <View style={styles.upgradeItem}>
            <Text style={styles.upgradeIcon}>⚡</Text>
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeName}>Auto-Play Bank</Text>
              <View style={styles.upgradeBar}>
                {[1, 2, 3, 4].map((segment) => (
                  <View
                    key={segment}
                    style={[
                      styles.upgradeSegment,
                      segment <= 1 && styles.upgradeSegmentActive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.upgradeLevel}>Lvl 1/4 (3s)</Text>
            </View>
          </View>

          {/* Score Multiplier */}
          <View style={styles.upgradeItem}>
            <Text style={styles.upgradeIcon}>⭐</Text>
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeName}>Score Multiplier</Text>
              <View style={styles.upgradeBar}>
                {[1, 2, 3, 4, 5, 6].map((segment) => (
                  <View
                    key={segment}
                    style={[
                      styles.upgradeSegment,
                      segment <= 1 && styles.upgradeSegmentActive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.upgradeLevel}>Lvl 1/6 (x1)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 20, 0.98)',
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 107, 213, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 2,
  },
  closeButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 1,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 107, 213, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 213, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFE6FF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  ballGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ballCard: {
    width: (SCREEN_WIDTH - 48 - 36) / 4,
    backgroundColor: 'rgba(255, 107, 213, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 213, 0.3)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    gap: 4,
  },
  ballCardLocked: {
    backgroundColor: 'rgba(50, 50, 60, 0.3)',
    borderColor: 'rgba(100, 100, 120, 0.3)',
  },
  ballIconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballOverlay: {
    opacity: 0.25,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  lockIcon: {
    fontSize: 10,
  },
  equippedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equippedText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
  },
  ballName: {
    fontSize: 8,
    fontWeight: '700',
    color: '#E5E7EB',
    textAlign: 'center',
  },
  ballNameLocked: {
    color: '#6B7280',
  },
  ballPrice: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fbbf24',
  },
  ballSource: {
    fontSize: 7,
    fontWeight: '700',
    color: '#60a5fa',
  },
  upgradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 107, 213, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 213, 0.3)',
    borderRadius: 12,
    padding: 12,
  },
  upgradeIcon: {
    fontSize: 32,
  },
  upgradeInfo: {
    flex: 1,
    gap: 4,
  },
  upgradeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  upgradeBar: {
    flexDirection: 'row',
    gap: 4,
    height: 8,
  },
  upgradeSegment: {
    flex: 1,
    backgroundColor: 'rgba(100, 100, 120, 0.3)',
    borderRadius: 4,
  },
  upgradeSegmentActive: {
    backgroundColor: '#ff6bd5',
  },
  upgradeLevel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});