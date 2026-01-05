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

  const isShop = title.includes('SHOP');
  const accentColor = isShop ? '#ff6bd5' : '#22d3ee';

  const renderBall = ({ item }: { item: Ball }) => {
    const owned = profile.ownedBalls.includes(item.id);
    const equipped = profile.selectedBallId === item.id;

    const rarityInfo = item.rarity
      ? {
          label: item.rarity === 'common' ? 'BRONZE' : item.rarity === 'rare' ? 'SILVER' : item.rarity === 'epic' ? 'GOLD' : 'NEON',
          color: item.rarity === 'common' ? '#d97706' : item.rarity === 'rare' ? '#6b7280' : item.rarity === 'epic' ? '#eab308' : '#ff6bd5',
        }
      : null;

    return (
      <Pressable
        style={[
          styles.row,
          equipped && styles.rowEquipped,
          { borderLeftColor: equipped ? '#22c55e' : owned ? accentColor : '#3a3a4a' },
        ]}
        onPress={() => owned && handleEquip(item.id)}
        disabled={!owned}
      >
        {/* Outer glow equipped */}
        {equipped && <View style={styles.rowGlow} />}

        {/* Left: Ball Icon */}
        <View style={styles.iconZone}>
          <View style={styles.ballContainer}>
            {/* Bille TOUJOURS visible */}
            <BallPreviewSkia ballId={item.id} size={68} />
            
            {/* Cadenas overlay pour locked */}
            {!owned && (
              <View style={styles.lockOverlay}>
                <View style={[styles.lockGlow, { backgroundColor: accentColor }]} />
                <View style={[styles.lockCircle, { borderColor: accentColor }]}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              </View>
            )}
            
            {/* Badge equipped */}
            {equipped && (
              <View style={styles.equippedBadge}>
                <Text style={styles.equippedIcon}>✓</Text>
              </View>
            )}
          </View>
        </View>

        {/* Center: Info */}
        <View style={styles.infoZone}>
          <Text style={[styles.ballName, !owned && styles.ballNameLocked]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            {isShop ? (
              <>
                <View style={[styles.tag, { backgroundColor: '#8b5cf622', borderColor: '#8b5cf6' }]}>
                  <Text style={[styles.tagText, { color: '#c4b5fd' }]}>SHOP</Text>
                </View>
                {item.price !== undefined && (
                  <View style={[styles.tag, { backgroundColor: '#fbbf2422', borderColor: '#fbbf24' }]}>
                    <Text style={[styles.tagText, { color: '#fbbf24' }]}>{item.price} 💰</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={[styles.tag, { backgroundColor: '#06b6d422', borderColor: '#06b6d4' }]}>
                  <Text style={[styles.tagText, { color: '#22d3ee' }]}>CHEST</Text>
                </View>
                {rarityInfo && (
                  <View style={[styles.tag, { backgroundColor: `${rarityInfo.color}22`, borderColor: rarityInfo.color }]}>
                    <Text style={[styles.tagText, { color: rarityInfo.color }]}>{rarityInfo.label}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Right: Status/Action */}
        <View style={styles.actionZone}>
          {equipped ? (
            <View style={styles.statusEquipped}>
              <Text style={styles.statusEquippedText}>EQUIPPED</Text>
            </View>
          ) : owned ? (
            <View style={[styles.btnEquip, { backgroundColor: `${accentColor}22`, borderColor: accentColor }]}>
              <Text style={[styles.btnEquipText, { color: accentColor }]}>EQUIP</Text>
            </View>
          ) : (
            <View style={styles.statusLocked}>
              <Text style={styles.statusLockedText}>LOCKED</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* BG layers */}
      <View style={styles.bgGradient} />
      <View style={[styles.bgGlow, { backgroundColor: accentColor }]} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: `${accentColor}66` }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { textShadowColor: accentColor }]}>{title}</Text>
          <View style={[styles.titleUnderline, { backgroundColor: accentColor }]} />
          <Text style={styles.subtitle}>
            {profile.ownedBalls.filter(id => balls.some(b => b.id === id)).length} / {balls.length} OWNED
          </Text>
        </View>
        <Pressable style={[styles.closeBtn, { borderColor: accentColor, backgroundColor: `${accentColor}22` }]} onPress={onClose}>
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={balls}
        keyExtractor={i => i.id}
        renderItem={renderBall}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    backgroundColor: '#0a0014',
    zIndex: 10000,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0014',
  },
  bgGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 30,
    borderBottomWidth: 2,
    backgroundColor: '#0a0014EE',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 4,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  titleUnderline: {
    height: 4,
    width: 120,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
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
    color: '#FFE6FF',
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  separator: {
    height: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2a',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderWidth: 2,
    borderColor: '#2a2a3a',
    padding: 14,
    paddingLeft: 10,
    minHeight: 90,
    position: 'relative',
  },
  rowEquipped: {
    backgroundColor: '#22c55e11',
    borderColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  rowGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 18,
    backgroundColor: '#22c55e',
    opacity: 0.1,
  },
  iconZone: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ballContainer: {
    position: 'relative',
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.2,
  },
  lockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: '#0a0014',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  lockIcon: {
    fontSize: 20,
  },
  equippedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  equippedIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  infoZone: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  ballName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 0.5,
  },
  ballNameLocked: {
    color: '#6b7280',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionZone: {
    width: 100,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusEquipped: {
    backgroundColor: '#22c55e22',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusEquippedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#22c55e',
    letterSpacing: 1,
  },
  btnEquip: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnEquipText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusLocked: {
    backgroundColor: '#3a3a4a22',
    borderWidth: 2,
    borderColor: '#3a3a4a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusLockedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 1,
  },
});