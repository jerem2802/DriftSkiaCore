// src/components/MainMenuCanvasSkia.tsx
import React, { useEffect, useRef, useState } from 'react';

import { StyleSheet, View, Pressable, Text as RNText } from 'react-native';
import { Canvas, Image, useImage, RoundedRect } from '@shopify/react-native-skia';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

import { useMainMenuState } from '../game/hooks/useMainMenuState';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameplay';
import {
  loadProfile,
  saveProfile,
  unlockChest,
  openChest,
  watchAd,
  getRemainingTime,
} from '../meta/playerProfile';

import { ChestBoxSkia } from './chests/ChestBoxSkia';
import { ChestOpeningAnimation } from './chests/ChestOpeningAnimation';
import { RewardPanelSkia } from './chests/RewardPanelSkia';
import { OptionsMenu } from './OptionsMenu';
import { generateChestRewards, type Reward } from '../config/bonusConfig';

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
  const state = useMainMenuState();

  // Bridge React (SharedValue<boolean> ne re-render pas)
  const [loadedUI, setLoadedUI] = useState(false);
  const loadedRef = useRef(false);

  const [bronzeStatus, setBronzeStatus] = useState<'locked' | 'countdown' | 'ready'>('locked');
  const [silverStatus, setSilverStatus] = useState<'locked' | 'countdown' | 'ready'>('locked');
  const [neonStatus, setNeonStatus] = useState<'locked' | 'countdown' | 'ready'>('locked');

  const [bronzeTime, setBronzeTime] = useState(0);
  const [silverTime, setSilverTime] = useState(0);
  const [neonTime, setNeonTime] = useState(0);

  const [bronzeUnlock, setBronzeUnlock] = useState(0);
  const [silverUnlock, setSilverUnlock] = useState(0);
  const [neonPrice, setNeonPrice] = useState(0);

  const [bestScore, setBestScore] = useState(0);
  const [totalCoinsUI, setTotalCoinsUI] = useState(0);

  const [bronzeRewards, setBronzeRewards] = useState<Reward[]>([]);
  const [silverRewards, setSilverRewards] = useState<Reward[]>([]);
  const [neonRewards, setNeonRewards] = useState<Reward[]>([]);

  const [showBronzeFlash, setShowBronzeFlash] = useState(false);
  const [showSilverFlash, setShowSilverFlash] = useState(false);
  const [showNeonFlash, setShowNeonFlash] = useState(false);

  const [showBronzePanel, setShowBronzePanel] = useState(false);
  const [showSilverPanel, setShowSilverPanel] = useState(false);
  const [showNeonPanel, setShowNeonPanel] = useState(false);

  const [showOptions, setShowOptions] = useState(false);

  const backgroundImage = useImage(require('../assets/images/menu_driftring.png'));

  // ====== IMPORTANT: ref anti-flicker (pas de closure stale) ======
  const modalOpenRef = useRef(false);
  useEffect(() => {
    modalOpenRef.current = showBronzePanel || showSilverPanel || showNeonPanel;
  }, [showBronzePanel, showSilverPanel, showNeonPanel]);

  // Opacity écran
  useEffect(() => {
    state.screenOpacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 600 : 300,
      easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
    });
  }, [visible, state.screenOpacity]);

  // TICK: source de vérité = profile => countdown bouge vraiment
  useEffect(() => {
    let alive = true;
    let inFlight = false;

    const tick = async () => {
      // ✅ Freeze pendant modal open => stop flicker (et surtout pas stale)
      if (modalOpenRef.current) return;

      // ✅ Optionnel: si le menu n'est pas visible, on évite de spam
      if (!visible) return;

      if (inFlight) return;
      inFlight = true;

      try {
        const profile = await loadProfile();
        if (!alive) return;

        if (!loadedRef.current) {
          loadedRef.current = true;
          setLoadedUI(true);
        }

        const bronzeChest = profile.chests.bronze;
        const silverChest = profile.chests.silver;
        const neonChest = profile.chests.neon;

        const bStatus = bronzeChest.status as 'locked' | 'countdown' | 'ready';
        const sStatus = silverChest.status as 'locked' | 'countdown' | 'ready';
        const nStatus = neonChest.status as 'locked' | 'countdown' | 'ready';

        const bRemain = getRemainingTime(bronzeChest);
        const sRemain = getRemainingTime(silverChest);
        const nRemain = getRemainingTime(neonChest);

        const neonCost =
          neonChest.openPrice ??
          (neonChest as any).price ??
          state.neonOpenPrice.value ??
          0;

        setBronzeStatus(bStatus);
        setSilverStatus(sStatus);
        setNeonStatus(nStatus);

        setBronzeTime(bRemain);
        setSilverTime(sRemain);
        setNeonTime(nRemain);

        setBestScore(profile.bestScore || 0);
        setTotalCoinsUI(profile.totalCoins || 0);

        // unlock requirements (issus de state) — conservé
        setBronzeUnlock(state.bronzeUnlockValue.value);
        setSilverUnlock(state.silverUnlockValue.value);
        setNeonPrice(neonCost);

        // push aussi dans SharedValues (cohérence autres composants)
        state.profileLoaded.value = true;

        state.bronzeStatus.value = bStatus;
        state.silverStatus.value = sStatus;
        state.neonStatus.value = nStatus;

        state.bronzeTimeRemaining.value = bRemain;
        state.silverTimeRemaining.value = sRemain;
        state.neonTimeRemaining.value = nRemain;

        state.bestScore.value = profile.bestScore || 0;
        state.totalCoins.value = profile.totalCoins || 0;
        state.neonOpenPrice.value = neonCost;

        state.bronzeAdsWatched.value = bronzeChest.adsWatched || 0;
        state.silverAdsWatched.value = silverChest.adsWatched || 0;
        state.neonAdsWatched.value = neonChest.adsWatched || 0;
      } finally {
        inFlight = false;
      }
    };

    tick();
    const id = setInterval(tick, 500);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [state, visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: state.screenOpacity.value,
  }));

  // ===== BRONZE =====
  const handleBronzeUnlock = async () => {
    const profile = await loadProfile();
    const required = state.bronzeUnlockValue.value || 0;
    if ((profile.bestScore || 0) < required) return;

    const unlockedChest = unlockChest(profile.chests.bronze);
    await saveProfile({ ...profile, chests: { ...profile.chests, bronze: unlockedChest } });

    state.bronzeStatus.value = unlockedChest.status;
    state.bronzeTimeRemaining.value = getRemainingTime(unlockedChest);
  };

  const handleBronzeWatchAd = async () => {
    const profile = await loadProfile();
    if ((profile.chests.bronze.adsWatched || 0) >= 4) return;

    const updatedChest = watchAd(profile.chests.bronze);
    const remaining = getRemainingTime(updatedChest);

    if (remaining === 0) {
      const readyChest = { ...updatedChest, status: 'ready' as const };
      await saveProfile({ ...profile, chests: { ...profile.chests, bronze: readyChest } });
      state.bronzeStatus.value = 'ready';
      state.bronzeTimeRemaining.value = 0;
    } else {
      await saveProfile({ ...profile, chests: { ...profile.chests, bronze: updatedChest } });
      state.bronzeTimeRemaining.value = remaining;
      state.bronzeAdsWatched.value = updatedChest.adsWatched || 0;
    }
  };

  const handleBronzeOpen = () => {
    const rewardsGen = generateChestRewards('bronze');
    setBronzeRewards(rewardsGen);

    state.bronzeAnimating.value = true;
    setShowBronzeFlash(true);
    setTimeout(() => setShowBronzePanel(true), 1500); // ✅ 900 → 1500
  };

  const handleBronzeComplete = () => {
    state.bronzeAnimating.value = false;
    setShowBronzeFlash(false);
  };

  const handleBronzeRewardClose = async () => {
    setShowBronzePanel(false);
    setBronzeRewards([]);

    const profile = await loadProfile();
    const resetChest = openChest(profile.chests.bronze);
    await saveProfile({ ...profile, chests: { ...profile.chests, bronze: resetChest } });

    state.bronzeStatus.value = resetChest.status;
    state.bronzeTimeRemaining.value = getRemainingTime(resetChest);
  };

  // ===== SILVER =====
  const handleSilverUnlock = async () => {
    const profile = await loadProfile();
    const required = state.silverUnlockValue.value || 0;
    if ((profile.bestScore || 0) < required) return;

    const unlockedChest = unlockChest(profile.chests.silver);
    await saveProfile({ ...profile, chests: { ...profile.chests, silver: unlockedChest } });

    state.silverStatus.value = unlockedChest.status;
    state.silverTimeRemaining.value = getRemainingTime(unlockedChest);
  };

  const handleSilverWatchAd = async () => {
    const profile = await loadProfile();
    if ((profile.chests.silver.adsWatched || 0) >= 4) return;

    const updatedChest = watchAd(profile.chests.silver);
    const remaining = getRemainingTime(updatedChest);

    if (remaining === 0) {
      const readyChest = { ...updatedChest, status: 'ready' as const };
      await saveProfile({ ...profile, chests: { ...profile.chests, silver: readyChest } });
      state.silverStatus.value = 'ready';
      state.silverTimeRemaining.value = 0;
    } else {
      await saveProfile({ ...profile, chests: { ...profile.chests, silver: updatedChest } });
      state.silverTimeRemaining.value = remaining;
      state.silverAdsWatched.value = updatedChest.adsWatched || 0;
    }
  };

  const handleSilverOpen = () => {
    const rewardsGen = generateChestRewards('silver');
    setSilverRewards(rewardsGen);

    state.silverAnimating.value = true;
    setShowSilverFlash(true);
    setTimeout(() => setShowSilverPanel(true), 1500); // ✅ 900 → 1500
  };

  const handleSilverComplete = () => {
    state.silverAnimating.value = false;
    setShowSilverFlash(false);
  };

  const handleSilverRewardClose = async () => {
    setShowSilverPanel(false);
    setSilverRewards([]);

    const profile = await loadProfile();
    const resetChest = openChest(profile.chests.silver);
    await saveProfile({ ...profile, chests: { ...profile.chests, silver: resetChest } });

    state.silverStatus.value = resetChest.status;
    state.silverTimeRemaining.value = getRemainingTime(resetChest);
  };

  // ===== NEON =====
  const handleNeonUnlock = async () => {
    const profile = await loadProfile();

    const neonChest = profile.chests.neon;
    const cost =
      neonChest.openPrice ??
      (neonChest as any).price ??
      state.neonOpenPrice.value ??
      0;

    if ((profile.totalCoins || 0) < cost) return;

    const unlockedChest = unlockChest(neonChest);
    const newCoins = Math.max(0, (profile.totalCoins || 0) - cost);

    await saveProfile({
      ...profile,
      chests: { ...profile.chests, neon: unlockedChest },
      totalCoins: newCoins,
    });

    state.neonStatus.value = unlockedChest.status;
    state.neonTimeRemaining.value = getRemainingTime(unlockedChest);
    state.totalCoins.value = newCoins;
  };

  const handleNeonWatchAd = async () => {
    const profile = await loadProfile();
    if ((profile.chests.neon.adsWatched || 0) >= 4) return;

    const updatedChest = watchAd(profile.chests.neon);
    const remaining = getRemainingTime(updatedChest);

    if (remaining === 0) {
      const readyChest = { ...updatedChest, status: 'ready' as const };
      await saveProfile({ ...profile, chests: { ...profile.chests, neon: readyChest } });
      state.neonStatus.value = 'ready';
      state.neonTimeRemaining.value = 0;
    } else {
      await saveProfile({ ...profile, chests: { ...profile.chests, neon: updatedChest } });
      state.neonTimeRemaining.value = remaining;
      state.neonAdsWatched.value = updatedChest.adsWatched || 0;
    }
  };

  const handleNeonOpen = () => {
    const rewardsGen = generateChestRewards('neon');
    setNeonRewards(rewardsGen);

    state.neonAnimating.value = true;
    setShowNeonFlash(true);
    setTimeout(() => setShowNeonPanel(true), 1500); // ✅ 900 → 1500
  };

  const handleNeonComplete = () => {
    state.neonAnimating.value = false;
    setShowNeonFlash(false);
  };

  const handleNeonRewardClose = async () => {
    setShowNeonPanel(false);
    setNeonRewards([]);

    const profile = await loadProfile();
    const resetChest = openChest(profile.chests.neon);
    await saveProfile({ ...profile, chests: { ...profile.chests, neon: resetChest } });

    state.neonStatus.value = resetChest.status;
    state.neonTimeRemaining.value = getRemainingTime(resetChest);
  };

  if (!loadedUI) {
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
            opacity={state.screenOpacity}
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
                bronzeStatus === 'ready' && styles.chestButtonReady,
                bronzeStatus === 'countdown' && styles.chestButtonCountdown,
              ]}
              onPress={() => {
                if (bronzeStatus === 'locked') handleBronzeUnlock();
                else if (bronzeStatus === 'ready') handleBronzeOpen();
              }}
            >
              <RNText
                style={[
                  styles.chestButtonText,
                  bronzeStatus === 'ready' && styles.chestButtonTextReady,
                  bronzeStatus === 'countdown' && styles.chestButtonTextCountdown,
                ]}
              >
                {bronzeStatus === 'locked' ? 'UNLOCK' : bronzeStatus === 'ready' ? 'OPEN' : formatTime(bronzeTime)}
              </RNText>
            </Pressable>

            {bronzeStatus === 'locked' && <RNText style={styles.conditionText}>Score {bronzeUnlock}</RNText>}
            {bronzeStatus === 'countdown' && (
              <Pressable style={styles.adButton} onPress={handleBronzeWatchAd}>
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
                silverStatus === 'ready' && styles.chestButtonReady,
                silverStatus === 'countdown' && styles.chestButtonCountdown,
              ]}
              onPress={() => {
                if (silverStatus === 'locked') handleSilverUnlock();
                else if (silverStatus === 'ready') handleSilverOpen();
              }}
            >
              <RNText
                style={[
                  styles.chestButtonText,
                  silverStatus === 'ready' && styles.chestButtonTextReady,
                  silverStatus === 'countdown' && styles.chestButtonTextCountdown,
                ]}
              >
                {silverStatus === 'locked' ? 'UNLOCK' : silverStatus === 'ready' ? 'OPEN' : formatTime(silverTime)}
              </RNText>
            </Pressable>

            {silverStatus === 'locked' && <RNText style={styles.conditionText}>Score {silverUnlock}</RNText>}
            {silverStatus === 'countdown' && (
              <Pressable style={styles.adButton} onPress={handleSilverWatchAd}>
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
                neonStatus === 'ready' && styles.chestButtonReady,
                neonStatus === 'countdown' && styles.chestButtonCountdown,
              ]}
              onPress={() => {
                if (neonStatus === 'locked') handleNeonUnlock();
                else if (neonStatus === 'ready') handleNeonOpen();
              }}
            >
              <RNText
                style={[
                  styles.chestButtonText,
                  styles.chestButtonTextNeon,
                  neonStatus === 'ready' && styles.chestButtonTextReady,
                  neonStatus === 'countdown' && styles.chestButtonTextCountdown,
                ]}
              >
                {neonStatus === 'locked' ? 'UNLOCK' : neonStatus === 'ready' ? 'OPEN' : formatTime(neonTime)}
              </RNText>
            </Pressable>

            {neonStatus === 'locked' && (
              <RNText style={styles.conditionTextNeon}>💰 {neonPrice} (Coins: {totalCoinsUI})</RNText>
            )}
            {neonStatus === 'countdown' && (
              <Pressable style={styles.adButton} onPress={handleNeonWatchAd}>
                <RNText style={styles.adButtonText}>📺 -3h</RNText>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable style={styles.playButton} onPress={onPlay}>
          <RNText style={styles.playButtonText}>PLAY</RNText>
        </Pressable>

        <View style={styles.metaInfo}>
          <RNText style={styles.metaText}>Best : {bestScore}</RNText>
          <RNText style={styles.metaText}>Coins : {totalCoinsUI}</RNText>
          <RNText style={styles.metaText}>Today: 2/3 missions</RNText>
        </View>

        <RNText style={styles.footer}>Pour une expérience optimale, utilise un casque.</RNText>
      </Animated.View>

      {/* CHEST VISUALS */}
      <View style={styles.chestAnimations} pointerEvents="none">
        <View style={[styles.chestBox, { left: CANVAS_WIDTH * 0.165 - 75, top: CANVAS_HEIGHT * 0.26 }]}>
          <ChestBoxSkia type="bronze" onPress={() => {}} shouldAnimate={state.bronzeAnimating.value} width={150} height={170} />
        </View>
        <View style={[styles.chestBox, { left: CANVAS_WIDTH * 0.5 - 75, top: CANVAS_HEIGHT * 0.26 }]}>
          <ChestBoxSkia type="silver" onPress={() => {}} shouldAnimate={state.silverAnimating.value} width={150} height={170} />
        </View>
        <View style={[styles.chestBox, { left: CANVAS_WIDTH * 0.835 - 75, top: CANVAS_HEIGHT * 0.26 }]}>
          <ChestBoxSkia type="neon" onPress={() => {}} shouldAnimate={state.neonAnimating.value} width={150} height={170} />
        </View>
      </View>

      <ChestOpeningAnimation isActive={showBronzeFlash} onComplete={handleBronzeComplete} />
      <ChestOpeningAnimation isActive={showSilverFlash} onComplete={handleSilverComplete} />
      <ChestOpeningAnimation isActive={showNeonFlash} onComplete={handleNeonComplete} />

      <RewardPanelSkia isVisible={showBronzePanel} rewards={bronzeRewards} onClose={handleBronzeRewardClose} />
      <RewardPanelSkia isVisible={showSilverPanel} rewards={silverRewards} onClose={handleSilverRewardClose} />
      <RewardPanelSkia isVisible={showNeonPanel} rewards={neonRewards} onClose={handleNeonRewardClose} />

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