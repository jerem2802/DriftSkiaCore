// src/components/PauseOverlay.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MusicManager } from '../audio/MusicManager';
import { saveAudioSettings } from '../audio/audioSettings';

type Props = {
  onResume: () => void;
  onQuit: () => void;
};

export const PauseOverlay: React.FC<Props> = ({ onResume, onQuit }) => {
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

        <Pressable style={styles.primaryButton} onPress={onResume}>
          <Text style={styles.primaryText}>▶  REPRENDRE</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleMusicToggle}>
          <Text style={styles.secondaryText}>
            {musicEnabled ? '🔊  MUSIQUE ON' : '🔇  MUSIQUE OFF'}
          </Text>
        </Pressable>

        <Pressable style={styles.quitButton} onPress={onQuit}>
          <Text style={styles.quitText}>🏠  QUITTER</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#080d1a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,107,213,0.3)',
    padding: 32,
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: 'rgba(255,107,213,0.15)',
    borderWidth: 2,
    borderColor: '#ff6bd5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ff6bd5',
    letterSpacing: 1,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(96,165,250,0.4)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#93c5fd',
    letterSpacing: 1,
  },
  quitButton: {
    width: '100%',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f87171',
    letterSpacing: 1,
  },
});
