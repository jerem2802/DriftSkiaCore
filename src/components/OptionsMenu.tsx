// src/components/OptionsMenu.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameplay';
import { MusicManager } from '../audio/MusicManager';
import { loadAudioSettings, saveAudioSettings } from '../audio/audioSettings';

type Props = {
  onClose: () => void;
};

type MenuScreen = 'main' | 'settings' | 'about'; // ✅ RETIRE 'profile'

export const OptionsMenu: React.FC<Props> = ({ onClose }) => {
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>('main');
  const [musicVolume, setMusicVolume] = useState(0.7); // 0.0 - 1.0
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const SLIDER_W = CANVAS_WIDTH * 0.40;

  useEffect(() => {
    loadAudioSettings().then((s) => {
      setMusicVolume(s.musicVolume / 10);
      setMusicEnabled(s.musicEnabled);
      setSfxEnabled(s.sfxEnabled);
    });
  }, []);

  const applyMusicVolume = (ratio: number) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    setMusicVolume(clamped);
    MusicManager.setVolume(clamped);
    saveAudioSettings({ musicVolume: Math.round(clamped * 10) });
  };

  const handleSliderTouch = (locationX: number) => {
    if (!musicEnabled) return;
    applyMusicVolume(locationX / SLIDER_W);
  };

  const handleMusicToggle = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    MusicManager.setEnabled(next);
    saveAudioSettings({ musicEnabled: next });
  };

  const handleSfxToggle = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    saveAudioSettings({ sfxEnabled: next });
  };

  // ✅ SUPPRIME TOUT LE BLOC PROFILE
  // if (currentScreen === 'profile') { ... }

  if (currentScreen === 'settings') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setCurrentScreen('main')} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔊 AUDIO</Text>

            <Pressable style={styles.settingItem} onPress={handleMusicToggle}>
              <Text style={styles.settingLabel}>Music</Text>
              <View style={styles.toggle}>
                <View style={[styles.toggleTrack, musicEnabled && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, musicEnabled && styles.toggleThumbActive]} />
                </View>
              </View>
            </Pressable>

            <View style={[styles.settingItem, !musicEnabled && styles.settingItemDisabled]}>
              <Text style={styles.settingLabel}>Music Volume</Text>
              <View
                style={styles.sliderTrack}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(e) => handleSliderTouch(e.nativeEvent.locationX)}
                onResponderMove={(e) => handleSliderTouch(e.nativeEvent.locationX)}
              >
                <View style={[styles.sliderFill, { width: SLIDER_W * musicVolume }]} />
                <View style={[styles.sliderThumb, { left: SLIDER_W * musicVolume - 9 }]} />
              </View>
            </View>

            <Pressable style={styles.settingItem} onPress={handleSfxToggle}>
              <Text style={styles.settingLabel}>SFX</Text>
              <View style={styles.toggle}>
                <View style={[styles.toggleTrack, sfxEnabled && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, sfxEnabled && styles.toggleThumbActive]} />
                </View>
              </View>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📳 HAPTICS</Text>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Vibrations</Text>
              <View style={styles.toggle}>
                <View style={[styles.toggleTrack, styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, styles.toggleThumbActive]} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 GAMEPLAY</Text>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Show FPS Counter</Text>
              <View style={styles.toggle}>
                <View style={styles.toggleTrack}>
                  <View style={styles.toggleThumb} />
                </View>
              </View>
            </View>
          </View>

          <Pressable style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>🗑️ RESET ALL DATA</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (currentScreen === 'about') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setCurrentScreen('main')} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>ABOUT</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>DRIFT-RING</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutSubtitle}>A Zen Orbital Game</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍💻 DEVELOPED BY</Text>
            <Text style={styles.aboutText}>Jey - JT Piscines</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 DESIGN & CODE</Text>
            <Text style={styles.aboutText}>React Native + Skia</Text>
            <Text style={styles.aboutText}>Reanimated Worklets</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎵 MUSIC</Text>
            <Text style={styles.aboutText}>Suno v5 Generation</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📧 CONTACT</Text>
            <Text style={styles.aboutText}>jtpiscines@example.com</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>OPTIONS</Text>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.mainMenu}>
        {/* ✅ SUPPRIME LE BOUTON PROFILE */}
        
        <Pressable style={styles.menuButton} onPress={() => setCurrentScreen('settings')}>
          <Text style={styles.menuButtonIcon}>⚙️</Text>
          <Text style={styles.menuButtonText}>SETTINGS</Text>
          <Text style={styles.menuButtonArrow}>→</Text>
        </Pressable>

        <Pressable style={styles.menuButton} onPress={() => setCurrentScreen('about')}>
          <Text style={styles.menuButtonIcon}>ℹ️</Text>
          <Text style={styles.menuButtonText}>ABOUT</Text>
          <Text style={styles.menuButtonArrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderWidth: 2,
    borderColor: '#60a5fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#60a5fa',
  },
  mainMenu: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 213, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 213, 0.3)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  menuButtonIcon: {
    fontSize: 32,
  },
  menuButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 1,
  },
  menuButtonArrow: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff6bd5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 107, 213, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 213, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  settingItemDisabled: {
    opacity: 0.4,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  sliderTrack: {
    width: CANVAS_WIDTH * 0.40,
    height: 6,
    backgroundColor: 'rgba(100, 100, 120, 0.3)',
    borderRadius: 3,
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 6,
    backgroundColor: '#ff6bd5',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ff6bd5',
    marginLeft: -9,
    top: -6,
  },
  toggle: {
    width: 50,
    height: 28,
  },
  toggleTrack: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: 'rgba(100, 100, 120, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: '#22c55e',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B7280',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    backgroundColor: '#22c55e',
    alignSelf: 'flex-end',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ef4444',
    letterSpacing: 1,
  },
  aboutSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  aboutTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFE6FF',
    letterSpacing: 2,
  },
  aboutVersion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  aboutSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
    fontStyle: 'italic',
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
    paddingLeft: 8,
  },
});