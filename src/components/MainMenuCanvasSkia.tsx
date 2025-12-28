// src/components/MainMenuCanvasSkia.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text as RNText } from 'react-native';
import { Canvas, Image, useImage, RoundedRect } from '@shopify/react-native-skia';
import Animated, { useAnimatedStyle, withTiming, Easing, useAnimatedReaction } from 'react-native-reanimated';

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameplay';
import { ChestBoxSkia } from './chests/ChestBoxSkia';
import { ChestOpeningAnimation } from './chests/ChestOpeningAnimation';
import { RewardPanelSkia } from './chests/RewardPanelSkia';
import { OptionsMenu } from './OptionsMenu';
import { useChestLogic } from '../game/hooks/useChestLogic';

type Props = {
  visible: boolean;
  onPlay: () => void;
  onTuto: () => void;
  onShop: () => void;
};

const formatTime = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
};

export const MainMenuCanvasSkia: React.FC<Props> = ({ visible, onPlay, onTuto, onShop }) => {
  const logic = useChestLogic(visible);
  const [showOptions, setShowOptions] = useState(false);
  const backgroundImage = useImage(require('../assets/images/menu_driftring.png'));

  useAnimatedReaction(
    () => visible,
    (currentVisible) => {
      logic.state.screenOpacity.value = withTiming(currentVisible ? 1 : 0, {
        duration: currentVisible ? 600 : 300,
        easing: currentVisible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      });
    },
    [visible]
  );

  const containerStyle = useAnimatedStyle(() => ({
    opacity: logic.state.screenOpacity.value,
  }));

  if (!logic.loadedUI) {
    return (
      <View style={styles.container}>
        <RNText style={styles.loading}>Loading...</RNText>
      </View>
    );
  }

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      {/* BACKGROUND SKIA */}
      <Canvas style={styles.canvas}>
        <RoundedRect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} r={0} color="#000" />
        {backgroundImage && (
          <Image
            image={backgroundImage}
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fit="cover"
            opacity={logic.state.screenOpacity}
          />
        )}
        <RoundedRect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} r={0} color="rgba(2, 6, 23, 0.5)" />
      </Canvas>

      {/* REACT UI */}
      <Animated.View style={[styles.uiLayer, containerStyle]}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={onTuto}>
            <RNText style={styles.headerButtonText}>TUTO</RNText>
          </Pressable>
          <Pressable style={styles.headerButton} onPress={onShop}>
            <RNText style={styles.headerButtonText}>SHOP</RNText>
          </Pressable>
          <Pressable style={styles.settingsButton} onPress={() => setShowOptions(true)}>
            <RNText style={styles.settingsButtonText}>⚙</RNText>
          </Pressable>
        </View>

        <RNText style={styles.title}>DRIFT-RING</RNText>

        <View style={styles.chestsContainer}>
          {/* BRONZE */}
          <View style={styles.chestColumn}>
            <RNText style={styles.chestLabel}>BRONZE</RNText>
            <View style={styles.chestSpace} />

            <Pressable
              style={[
                styles.chestButton,
                logic.bronzeStatus === 'ready' && styles.chestButtonReady,
                logic.bronzeStatus === 'countdown' && styles.chestButtonCountdown,
              ]}
              onPress={() => {
                if (logic.bronzeStatus === 'locked') logic.handleBronzeUnlock();
                else if (logic.bronzeStatus === 'ready') logic.handleBronzeOpen();
              }}
            >
              <RNText
                style={[
                  styles.chestButtonText,
                  logic.bronzeStatus === 'ready' && styles.chestButtonTextReady,
                  logic.bronzeStatus === 'countdown' && styles.chestButtonTextCountdown,
                ]}
              >
                {logic.bronzeStatus === 'locked' ? 'UNLOCK' : logic.bronzeStatus === 'ready' ? 'OPEN' : formatTime(logic.bronzeTime)}
              </RNText>
            </Pressable>

            {logic.bronzeStatus === 'locked' && <RNText style={styles.conditionText}>Score {logic.bronzeUnlock}</RNText>}
            {logic.bronzeStatus === 'countdown' && (
              <Pressable style={styles.adButton} onPress={logic.handleBronzeWatchAd}>
                <RNText style={styles.adButtonText}>📺 -3h</RNText>
              </Pressable>
            )}
          </View>

          {/* SILVER */}
          <View style={styles.chestColumn}>
            <RNText style={styles.chestLabel}>SILVER</RNText>
            <View style={styles.chestSpace} />

            <Pressable
              style={[
                styles.chestButton,
                logic.silverStatus === 'ready' && styles.chestButtonReady,
                logic.silverStatus === 'countdown' && styles.chestButtonCountdown,
              ]}
              onPress={() => {
                if (logic.silverStatus === 'locked') logic.handleSilverUnlock();
                else if (logic.silverStatus === 'ready') logic.handleSilverOpen();
              }}
            >
              <RNText
                style={[
                  styles.chestButtonText,
                  logic.silverStatus === 'ready' && styles.chestButtonTextReady,
                  logic.silverStatus === 'countdown' && styles.chestButtonTextCountdown,
                ]}
              >
                {logic.silverStatus === 'locked' ? 'UNLOCK' : logic.silverStatus === 'ready' ? 'OPEN' : formatTime(logic.silverTime)}
              </RNText>
            </Pressable>

            {logic.silverStatus === 'locked' && <RNText style={styles.conditionText}>Score {logic.silverUnlock}</RNText>}
            {logic.silverStatus === 'countdown' && (
              <Pressable style={styles.adButton} onPress={logic.handleSilverWatchAd}>
                <RNText style={styles.adButtonText}>📺 -3h</RNText>
              </Pressable>
            )}
          </View>

          {/* NEON */}
          <View style={styles.chestColumn}>
            <RNText style={styles.chestLabel}>NEON</RNText>
            <View style={styles.chestSpace} />

            <Pressable
              style={[
                styles.chestButton,
                styles.chestButtonNeon,
                logic.neonStatus === 'ready' && styles.chestButtonReady,
                logic.neonStatus === 'countdown' && styles.chestButtonCountdown,
              ]}
              onPress={() => {
                if (logic.neonStatus === 'locked') logic.handleNeonUnlock();
                else if (logic.neonStatus === 'ready') logic.handleNeonOpen();
              }}
            >
              <RNText
                style={[
                  styles.chestButtonText,
                  styles.chestButtonTextNeon,
                  logic.neonStatus === 'ready' && styles.chestButtonTextReady,
                  logic.neonStatus === 'countdown' && styles.chestButtonTextCountdown,
                ]}
              >
                {logic.neonStatus === 'locked' ? 'UNLOCK' : logic.neonStatus === 'ready' ? 'OPEN' : formatTime(logic.neonTime)}
              </RNText>
            </Pressable>

            {logic.neonStatus === 'locked' && (
              <RNText style={styles.conditionTextNeon}>💰 {logic.neonPrice} (Coins: {logic.totalCoinsUI})</RNText>
            )}
            {logic.neonStatus === 'countdown' && (
              <Pressable style={styles.adButton} onPress={logic.handleNeonWatchAd}>
                <RNText style={styles.adButtonText}>📺 -3h</RNText>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable style={styles.playButton} onPress={onPlay}>
          <RNText style={styles.playButtonText}>PLAY</RNText>
        </Pressable>

        <View style={styles.metaInfo}>
          <RNText style={styles.metaText}>Best : {logic.bestScore}</RNText>
          <RNText style={styles.metaText}>Coins : {logic.totalCoinsUI}</RNText>
          <RNText style={styles.metaText}>Today: 2/3 missions</RNText>
        </View>

        <RNText style={styles.footer}>Pour une expérience optimale, utilise un casque.</RNText>
      </Animated.View>

      {/* CHEST VISUALS */}
      <View style={styles.chestAnimations} pointerEvents="none">
        <View style={[styles.chestBox, { left: CANVAS_WIDTH * 0.165 - 75, top: CANVAS_HEIGHT * 0.26 }]}>
          <ChestBoxSkia type="bronze" onPress={() => {}} shouldAnimate={logic.state.bronzeAnimating.value} width={150} height={170} />
        </View>
        <View style={[styles.chestBox, { left: CANVAS_WIDTH * 0.5 - 75, top: CANVAS_HEIGHT * 0.26 }]}>
          <ChestBoxSkia type="silver" onPress={() => {}} shouldAnimate={logic.state.silverAnimating.value} width={150} height={170} />
        </View>
        <View style={[styles.chestBox, { left: CANVAS_WIDTH * 0.835 - 75, top: CANVAS_HEIGHT * 0.26 }]}>
          <ChestBoxSkia type="neon" onPress={() => {}} shouldAnimate={logic.state.neonAnimating.value} width={150} height={170} />
        </View>
      </View>

      <ChestOpeningAnimation isActive={logic.showBronzeFlash} onComplete={logic.handleBronzeComplete} />
      <ChestOpeningAnimation isActive={logic.showSilverFlash} onComplete={logic.handleSilverComplete} />
      <ChestOpeningAnimation isActive={logic.showNeonFlash} onComplete={logic.handleNeonComplete} />

      <RewardPanelSkia isVisible={logic.showBronzePanel} rewards={logic.bronzeRewards} onClose={logic.handleBronzeRewardClose} />
      <RewardPanelSkia isVisible={logic.showSilverPanel} rewards={logic.silverRewards} onClose={logic.handleSilverRewardClose} />
      <RewardPanelSkia isVisible={logic.showNeonPanel} rewards={logic.neonRewards} onClose={logic.handleNeonRewardClose} />

      {showOptions && <OptionsMenu onClose={() => setShowOptions(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, position: 'absolute' },
  loading: { color: '#FFF', fontSize: 20, textAlign: 'center', marginTop: 200 },
  uiLayer: { position: 'absolute', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },

  header: {
    position: 'absolute',
    top: CANVAS_HEIGHT * 0.04,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: CANVAS_WIDTH * 0.04,
    gap: 8,
  },
  headerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerButtonText: { color: '#e5e7eb', fontSize: 12, fontWeight: '700' },
  settingsButton: {
    position: 'absolute',
    right: CANVAS_WIDTH * 0.04,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 999,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: { fontSize: 18 },

  title: {
    position: 'absolute',
    top: CANVAS_HEIGHT * 0.12,
    left: CANVAS_WIDTH * 0.2,
    fontSize: 36,
    fontWeight: '900',
    color: '#f9fafb',
    letterSpacing: 2,
  },

  chestsContainer: {
    position: 'absolute',
    top: CANVAS_HEIGHT * 0.23,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: CANVAS_WIDTH * 0.05,
  },
  chestColumn: { alignItems: 'center', gap: 4 },
  chestLabel: { fontSize: 12, fontWeight: '700', color: '#e5e7eb' },
  chestSpace: { height: 170 },

  chestButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
    minWidth: 120,
  },
  chestButtonReady: { backgroundColor: 'rgba(192, 38, 211, 0.3)', borderColor: '#C026D3' },
  chestButtonCountdown: { backgroundColor: 'rgba(96, 165, 250, 0.2)', borderColor: '#60a5fa' },
  chestButtonNeon: { backgroundColor: 'rgba(192, 38, 211, 0.3)', borderColor: '#C026D3' },

  chestButtonText: { color: '#22c55e', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  chestButtonTextReady: { color: '#E879F9' },
  chestButtonTextCountdown: { color: '#60a5fa' },
  chestButtonTextNeon: { color: '#E879F9' },

  conditionText: { fontSize: 10, fontWeight: '700', color: '#d1d5db', marginTop: 2 },
  conditionTextNeon: { fontSize: 10, fontWeight: '700', color: '#fbbf24', marginTop: 2 },

  adButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  adButtonText: { color: '#fbbf24', fontSize: 10, fontWeight: '700' },

  playButton: {
    position: 'absolute',
    top: CANVAS_HEIGHT * 0.7,
    left: CANVAS_WIDTH * 0.25,
    width: CANVAS_WIDTH * 0.5,
    height: CANVAS_HEIGHT * 0.08,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 3,
    borderColor: '#ff6bd5',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: { fontSize: 24, fontWeight: '900', color: '#ffe6ff' },

  metaInfo: { position: 'absolute', top: CANVAS_HEIGHT * 0.78, left: 0, right: 0, alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '700', color: '#e5e7eb' },
  footer: {
    position: 'absolute',
    bottom: CANVAS_HEIGHT * 0.06,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
  },

  chestAnimations: { position: 'absolute', top: 0, left: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  chestBox: { position: 'absolute' },
});