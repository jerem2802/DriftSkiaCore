// src/components/profile/ProfileScreen.tsx
import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, Pressable, TextInput, Image, useWindowDimensions, ScrollView } from 'react-native';
import { CANVAS_WIDTH } from '../../constants/gameplay';

const AVATAR_SIZE = Math.min(160, CANVAS_WIDTH * 0.42);
import type { PlayerProfile } from '../../meta/playerProfile';
import { setPlayerIdentity } from '../../meta/playerProfile';

type Props = {
  profile: PlayerProfile;
  onBack: () => void;
  onProfileUpdate: () => void;
};

type AvatarItem = { id: string; src: any };

export const ProfileScreen: React.FC<Props> = ({ profile, onBack, onProfileUpdate }) => {
  const { width } = useWindowDimensions();

  const pendingNameRef = useRef(profile.playerName || 'Player');
  const pendingAvatarRef = useRef(profile.avatarId || 'a01');

  const [name, setName] = useState(pendingNameRef.current);
  const [avatarId, setAvatarId] = useState(pendingAvatarRef.current);

  const bestScore = profile.bestScore ?? 0;

  const AVATARS: AvatarItem[] = useMemo(
    () => [
      { id: 'a01', src: require('../../assets/avatars/avatar1.png') },
      { id: 'a02', src: require('../../assets/avatars/avatar2.png') },
      { id: 'a03', src: require('../../assets/avatars/avatar3.png') },
      { id: 'a04', src: require('../../assets/avatars/avatar4.png') },
      { id: 'a05', src: require('../../assets/avatars/avatar5.png') },
      { id: 'a06', src: require('../../assets/avatars/avatar6.png') },
      { id: 'a07', src: require('../../assets/avatars/avatar7.png') },
      { id: 'a08', src: require('../../assets/avatars/avatar8.png') },
      { id: 'a09', src: require('../../assets/avatars/avatar9.png') },
      { id: 'a10', src: require('../../assets/avatars/avatar10.png') },
      { id: 'a11', src: require('../../assets/avatars/avatar11.png') },
      { id: 'a12', src: require('../../assets/avatars/avatar12.png') },
      { id: 'a13', src: require('../../assets/avatars/avatar13.png') },
      { id: 'a14', src: require('../../assets/avatars/avatar14.png') },
      { id: 'a15', src: require('../../assets/avatars/avatar15.png') },
    ],
    []
  );

  // ✅ Avatar sizing (4 columns)
  const COLS = 4;
  const H_PADDING = 18;
  const GAP = 12;
  const available = Math.max(280, width - H_PADDING * 2);
  const rawSize = Math.floor((available - GAP * (COLS - 1)) / COLS);
  const AV_SIZE = Math.max(92, Math.min(126, rawSize));
  const RING = 3;

  // ✅ Avatar framing: zoom + shift
  const ZOOM = 0.9;
  const SHIFT_Y = -0.01;

  const handleSelectAvatar = (id: string) => {
    setAvatarId(id);
    pendingAvatarRef.current = id;
  };

  const handleBack = async () => {
    const nextName = (pendingNameRef.current || '').trim().slice(0, 8) || 'Player';
    const nextAvatar = (pendingAvatarRef.current || 'a01').trim() || 'a01';

    try {
      await setPlayerIdentity({ playerName: nextName, avatarId: nextAvatar });
    } catch {}

    onProfileUpdate();
    onBack();
  };

  // ✅ Get currently selected avatar source
  const selectedAvatarSrc = useMemo(() => {
    const found = AVATARS.find((a) => a.id === avatarId);
    return found?.src;
  }, [avatarId, AVATARS]);

  return (
    <View style={styles.root}>
      {/* ============================================ */}
      {/* TOP BAR */}
      {/* ============================================ */}
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backTxt}>✕</Text>
        </Pressable>
        <Text style={styles.title}>PROFILE</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================ */}
        {/* HERO SECTION - Large avatar + name + score */}
        {/* ============================================ */}
        <View style={styles.heroSection}>
          {/* Large Avatar Display */}
          <View style={styles.heroAvatarContainer}>
            <View style={styles.heroAvatarRing}>
              {selectedAvatarSrc && (
                <Image
                  source={selectedAvatarSrc}
                  style={styles.heroAvatarImage}
                />
              )}
            </View>
            {/* Glow effect */}
            <View style={styles.heroAvatarGlow} />
          </View>

          {/* Name Input - Integrated in hero */}
          <View style={styles.heroNameCard}>
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                pendingNameRef.current = t;
              }}
              placeholder="Your name"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.heroNameInput}
              maxLength={8}
              textAlign="center"
            />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>BEST SCORE</Text>
              <Text style={styles.statValue}>{bestScore}</Text>
            </View>
          </View>
        </View>

        {/* ============================================ */}
        {/* AVATAR SELECTOR SECTION */}
        {/* ============================================ */}
        <View style={styles.avatarSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>CHOOSE AVATAR</Text>
            </View>
          </View>

          <View style={[styles.grid, { gap: GAP }]}>
            {AVATARS.map((a) => {
              const selected = a.id === avatarId;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => handleSelectAvatar(a.id)}
                  style={{ width: AV_SIZE, height: AV_SIZE, marginBottom: GAP }}
                  hitSlop={6}
                >
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        width: AV_SIZE,
                        height: AV_SIZE,
                        borderRadius: AV_SIZE / 2,
                        borderWidth: RING,
                      },
                      selected ? styles.avatarCircleSelected : styles.avatarCircleIdle,
                    ]}
                  >
                    <Image
                      source={a.src}
                      style={{
                        width: AV_SIZE * ZOOM,
                        height: AV_SIZE * ZOOM,
                        resizeMode: 'cover',
                        transform: [{ translateY: AV_SIZE * SHIFT_Y }],
                      }}
                    />

                    {selected && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkTxt}>✓</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#000',
  },

  topBar: {
    height: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  backTxt: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '800' 
  },

  title: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '900', 
    letterSpacing: 2 
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
  },

  // ============================================
  // HERO SECTION
  // ============================================
  heroSection: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
  },

  heroAvatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  heroAvatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: 'rgba(251, 191, 36, 0.95)',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(251, 191, 36, 1)',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },

  heroAvatarImage: {
    width: AVATAR_SIZE * 1.15,
    height: AVATAR_SIZE * 1.15,
    resizeMode: 'cover',
    transform: [{ translateY: -2 }],
  },

  heroAvatarGlow: {
    position: 'absolute',
    width: AVATAR_SIZE + 20,
    height: AVATAR_SIZE + 20,
    borderRadius: (AVATAR_SIZE + 20) / 2,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    opacity: 0.5,
  },

  heroNameCard: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.60)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
    shadowColor: 'rgba(139, 92, 246, 1)',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  heroNameInput: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '85%',
    maxWidth: 320,
  },

  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.70)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.65)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: 'rgba(34, 197, 94, 1)',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  statLabel: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  statValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ============================================
  // AVATAR SECTION
  // ============================================
  avatarSection: {
    marginTop: 20,
  },

  sectionHeader: {
    marginBottom: 20,
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.95)',
    marginRight: 10,
  },

  sectionTitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 12,
    rowGap: 12,
  },

  avatarCircle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },

  avatarCircleIdle: { 
    borderColor: 'rgba(168, 85, 247, 0.60)',
    shadowColor: 'rgba(168, 85, 247, 1)',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  avatarCircleSelected: {
    borderColor: 'rgba(251, 191, 36, 0.95)',
    backgroundColor: 'rgba(139, 92, 246, 0.20)',
    shadowColor: 'rgba(251, 191, 36, 1)',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  checkBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(34, 197, 94, 1.0)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#000',
    shadowColor: 'rgba(34, 197, 94, 1)',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },

  checkTxt: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '900' 
  },
});