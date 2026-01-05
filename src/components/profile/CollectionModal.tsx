// src/components/profile/CollectionModal.tsx
import React from 'react';
import { View, StyleSheet, Pressable, FlatList, Text } from 'react-native';
import { setSelectedBall, type PlayerProfile } from '../../meta/playerProfile';
import { BallPreviewSkia } from '../shop/BallPreviewSkia';

type Ball = {
  id: string;
  name: string;
  price?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
};

type Props = {
  title: string;
  balls: Ball[];
  profile: PlayerProfile;
  onClose: () => void;
  onProfileUpdate: () => void;
};

export const CollectionModal: React.FC<Props> = ({ title, balls, profile, onClose, onProfileUpdate }) => {
  const handleEquip = async (ballId: string) => {
    await setSelectedBall(ballId);
    onProfileUpdate();
  };

  const renderBall = ({ item }: { item: Ball }) => {
    const owned = profile.ownedBalls.includes(item.id);
    const equipped = profile.selectedBallId === item.id;

    return (
      <View style={styles.ballWrapper}>
        <Pressable
          style={[styles.ballCard, !owned && styles.ballCardLocked]}
          onPress={() => owned && handleEquip(item.id)}
          disabled={!owned}
        >
          <View style={styles.ballIconContainer}>
            <View style={!owned && styles.ballOverlay}>
              <BallPreviewSkia ballId={item.id} size={50} />
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
            {owned ? item.name : 'Locked'}
          </Text>
          {!owned && item.price !== undefined && (
            <Text style={styles.ballPrice}>{item.price}💰</Text>
          )}
          {!owned && item.rarity && (
            <Text style={styles.ballRarity}>
              {item.rarity === 'common' ? 'Bronze' : item.rarity === 'rare' ? 'Silver' : 'Neon'}
            </Text>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      {/* Grid */}
      <FlatList
        data={balls}
        keyExtractor={(item) => item.id}
        renderItem={renderBall}
        numColumns={4}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 20, 0.98)',
    zIndex: 10000,
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
  title: {
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ballWrapper: {
    flex: 1,
    maxWidth: '25%',
  },
  ballCard: {
    backgroundColor: 'rgba(255, 107, 213, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 213, 0.3)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  ballCardLocked: {
    backgroundColor: 'rgba(50, 50, 60, 0.3)',
    borderColor: 'rgba(100, 100, 120, 0.3)',
  },
  ballIconContainer: {
    position: 'relative',
    width: 50,
    height: 50,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  lockIcon: {
    fontSize: 11,
  },
  equippedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equippedText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
  ballName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E5E7EB',
    textAlign: 'center',
  },
  ballNameLocked: {
    color: '#6B7280',
  },
  ballPrice: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fbbf24',
  },
  ballRarity: {
    fontSize: 8,
    fontWeight: '700',
    color: '#60a5fa',
  },
});