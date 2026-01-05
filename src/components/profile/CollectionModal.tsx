// src/components/profile/CollectionModal.tsx
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Pressable, Text, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { setSelectedBall, type PlayerProfile } from '../../meta/playerProfile';
import { BallCard } from './BallCard';

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
  onClose: () => void;
  onProfileUpdate: () => void;
};

export const CollectionModal: React.FC<Props> = ({ title, balls, profile, onClose, onProfileUpdate }) => {
  const isShop = title.includes('SHOP');
  const accent = isShop ? '#ff6bd5' : '#22d3ee';
  const accentGradient = useMemo(() => (isShop ? ['#22d3ee', '#a855f7'] : ['#22d3ee', '#0891b2']), [isShop]);
  const ownedCount = profile.ownedBalls.filter(id => balls.some(b => b.id === id)).length;

  const handleAction = useCallback(
    (ballId: string, owned: boolean) => {
      if (owned) {
        setSelectedBall(ballId);
        onProfileUpdate();
      }
    },
    [onProfileUpdate]
  );

  const renderItem = useCallback(
    ({ item }: { item: Ball }) => {
      const owned = profile.ownedBalls.includes(item.id);
      const equipped = profile.selectedBallId === item.id;

      return <BallCard ball={item} owned={owned} equipped={equipped} accent={accent} accentGradient={accentGradient} onAction={handleAction} />;
    },
    [profile.ownedBalls, profile.selectedBallId, accent, accentGradient, handleAction]
  );

  const keyExtractor = useCallback((item: Ball) => item.id, []);

  return (
    <View style={styles.container}>
      {/* BG */}
      <LinearGradient colors={['#0a0014', '#0f0520', '#0a0014']} style={styles.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.titleText}>{title}</Text>
          <View style={[styles.underline, { backgroundColor: accent }]} />
          <Text style={styles.subtitleText}>
            {ownedCount} / {balls.length} OWNED
          </Text>
        </View>
        <Pressable onPress={onClose} style={[styles.closeBtn, { borderColor: accent }]}>
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      </View>

      {/* FlatList optimisé */}
      <FlatList
        data={balls}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={5}
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
    zIndex: 10000,
    backgroundColor: '#0a0014',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  titleText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 3,
  },
  underline: {
    height: 4,
    width: 120,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CCC',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTxt: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 32,
  },
});