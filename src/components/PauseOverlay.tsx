// src/components/PauseOverlay.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MusicManager } from '../audio/MusicManager';
import { saveAudioSettings } from '../audio/audioSettings';

type Props = {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
};

export const PauseOverlay: React.FC<Props> = ({ onResume, onRestart, onQuit }) => {
  const [musicEnabled, setMusicEnabled] = React.useState(MusicManager.isEnabled());

  const handleMusicToggle = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    MusicManager.setEnabled(next);
    saveAudioSettings({ musicEnabled: next });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>

        <Text style={styles.title}>PAUSE</Text>
        <View style={styles.divider} />

        <Pressable style={({ pressed }) => [styles.row, styles.rowPrimary, pressed && styles.pressed]} onPress={onResume}>
          <Text style={styles.rowIcon}>▶</Text>
          <Text style={[styles.rowLabel, styles.rowLabelPrimary]}>Reprendre</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onRestart}>
          <Text style={styles.rowIcon}>↺</Text>
          <Text style={styles.rowLabel}>Nouvelle partie</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={handleMusicToggle}>
          <Text style={styles.rowIcon}>{musicEnabled ? '🎵' : '🔇'}</Text>
          <Text style={styles.rowLabel}>Musique</Text>
          <View style={[styles.badge, musicEnabled && styles.badgeOn]}>
            <Text style={[styles.badgeText, musicEnabled && styles.badgeTextOn]}>
              {musicEnabled ? 'ON' : 'OFF'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={({ pressed }) => [styles.row, styles.rowQuit, pressed && styles.pressed]} onPress={onQuit}>
          <Text style={styles.rowIcon}>⬡</Text>
          <Text style={[styles.rowLabel, styles.rowLabelQuit]}>Quitter la partie</Text>
        </Pressable>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '78%',
    maxWidth: 310,
    backgroundColor: '#060c1a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  title: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 4,
    textAlign: 'center',
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 17,
    gap: 14,
  },
  rowPrimary: {
    backgroundColor: 'rgba(255,107,213,0.08)',
  },
  rowQuit: {
    // subtle red tint on hover only
  },
  pressed: {
    opacity: 0.6,
  },
  rowIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.3,
  },
  rowLabelPrimary: {
    color: '#ff6bd5',
    fontWeight: '700',
  },
  rowLabelQuit: {
    color: 'rgba(248,113,113,0.85)',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  badgeOn: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderColor: 'rgba(34,197,94,0.4)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  badgeTextOn: {
    color: '#4ade80',
  },
});
