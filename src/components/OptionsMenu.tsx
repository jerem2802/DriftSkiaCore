// src/components/OptionsMenu.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameplay';
import ProfileScreen from './ProfileScreen';

type Props = {
  onClose: () => void;
};

type MenuScreen = 'main' | 'profile' | 'settings' | 'about';

export const OptionsMenu: React.FC<Props> = ({ onClose }) => {
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>('main');

  if (currentScreen === 'profile') {
    return <ProfileScreen onClose={() => setCurrentScreen('main')} />;
  }

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
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Music Volume</Text>
              <View style={styles.volumeBar}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((segment) => (
                  <View key={segment} style={[styles.volumeSegment, segment <= 7 && styles.volumeSegmentActive]} />
                ))}
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>SFX Volume</Text>
              <View style={styles.volumeBar}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((segment) => (
                  <View key={segment} style={[styles.volumeSegment, segment <= 10 && styles.volumeSegmentActive]} />
                ))}
              </View>
            </View>
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
        <Pressable style={styles.menuButton} onPress={() => setCurrentScreen('profile')}>
          <Text style={styles.menuButtonIcon}>👤</Text>
          <Text style={styles.menuButtonText}>PROFILE</Text>
          <Text style={styles.menuButtonArrow}>→</Text>
        </Pressable>

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
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  volumeBar: {
    flexDirection: 'row',
    gap: 4,
    height: 24,
    width: 120,
  },
  volumeSegment: {
    flex: 1,
    backgroundColor: 'rgba(100, 100, 120, 0.3)',
    borderRadius: 4,
  },
  volumeSegmentActive: {
    backgroundColor: '#ff6bd5',
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