import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';

type MainMenuScreenProps = {
  onPlay: () => void;
  onTuto: () => void;
  onOptions: () => void;
  onShop: () => void; // ✅ NEW
};

const backgroundSource = require('../assets/images/menu_driftring.png');

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onPlay,
  onTuto,
  onOptions,
  onShop,
}) => {
  return (
    <ImageBackground source={backgroundSource} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        {/* HEADER : TUTO + SHOP / OPTIONS */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.headerButton} onPress={onTuto}>
              <Text style={styles.headerButtonText}>TUTO</Text>
            </Pressable>

            <Pressable style={styles.headerButton} onPress={onShop}>
              <Text style={styles.headerButtonText}>SHOP</Text>
            </Pressable>
          </View>

          <Pressable style={styles.headerButton} onPress={onOptions}>
            <Text style={styles.headerButtonText}>⚙</Text>
          </Pressable>
        </View>

        {/* TITRE (plus bas, on stylisera plus tard) */}
        <View pointerEvents="none" style={styles.titleWrap}>
          <Text style={styles.title}>DRIFT-RING</Text>
        </View>

        {/* CENTRE : PLAY */}
        <View style={styles.center}>
          <Pressable style={styles.playButton} onPress={onPlay}>
            <Text style={styles.playText}>PLAY</Text>
          </Pressable>

          {/* Meta, plus tard on pourra passer un bestScore en props */}
          <Text style={styles.metaText}>Best : --</Text>
        </View>

        {/* BAS : hint audio */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pour une expérience optimale, utilise un casque.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default MainMenuScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  /* HEADER */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#e5e7eb',
  },

  /* TITLE */
  titleWrap: {
    alignItems: 'center',
    marginTop: 90, // ✅ descend le titre vers le milieu (ajustable)
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#f9fafb',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  /* CENTRE */
  center: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 80,
  },
  playButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#ff6bd5',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  playText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#ffe6ff',
  },
  metaText: {
    marginTop: 16,
    fontSize: 14,
    color: '#e5e7eb',
    opacity: 0.9,
  },

  /* BAS */
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
