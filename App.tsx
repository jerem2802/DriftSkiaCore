import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';

import DriftGame from './src/game/DriftGame';
import { MainMenuCanvasSkia } from './src/components/MainMenuCanvasSkia';
import HeadphonesScreen from './src/components/HeadphonesScreen';
import { ScreenTransition } from './src/components/ScreenTransition';
import { ShopScreen } from './src/components/shop/ShopScreen';
import { ProfileCanvasSkia } from './src/components/profile/ProfileCanvasSkia';

import { loadProfile, resetProfileForDev, type PlayerProfile } from './src/meta/playerProfile';

type Screen = 'menu' | 'headphones' | 'game' | 'shop' | 'profile'; // ✅ AJOUT 'profile'

const FADE_OUT_DURATION = 800;
const DEV_RESET_PROFILE_ON_LAUNCH = false;

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [screen, setScreen] = useState<Screen>('menu');
  const [shopReturnTo, setShopReturnTo] = useState<Screen>('menu');
  const [selectedBallId, setSelectedBallId] = useState<string>('core');

  useEffect(() => {
    const init = async () => {
      try {
        if (DEV_RESET_PROFILE_ON_LAUNCH) {
          await resetProfileForDev();
          console.log('🔥 DEV MODE: Profil reset !');
        }

        const p = await loadProfile();
        setProfile(p);
        setSelectedBallId(p.selectedBallId || 'core');
        setAppReady(true);
      } catch (error) {
        console.error('Init error:', error);
        setAppReady(true);
      }
    };

    init();
  }, []);

  const refreshProfile = useCallback(async () => {
    const p = await loadProfile();
    setProfile(p);
    setSelectedBallId(p.selectedBallId || 'core');
  }, []);

  const handleTransition = useCallback((targetScreen: Screen) => {
    setScreen(targetScreen);
  }, []);

  const openShopFromMenu = useCallback(() => {
    setShopReturnTo('menu');
    handleTransition('shop');
  }, [handleTransition]);

  const openShopFromGame = useCallback(() => {
    setShopReturnTo('game');
    handleTransition('shop');
  }, [handleTransition]);

  const backFromShop = useCallback(() => {
    handleTransition(shopReturnTo);
  }, [handleTransition, shopReturnTo]);

  // ✅ HANDLERS PROFILE
  const openProfile = useCallback(() => {
    handleTransition('profile');
  }, [handleTransition]);

  const backFromProfile = useCallback(() => {
    handleTransition('menu');
  }, [handleTransition]);

  if (!appReady || !profile) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashText}>DRIFT-RING</Text>
      </View>
    );
  }

  const shouldRenderGame =
    screen === 'game' ||
    screen === 'headphones' ||
    (screen === 'shop' && shopReturnTo === 'game');

  const gamePointerEvents = screen === 'game' ? 'auto' : 'none';
  const showGameVisual = screen === 'game' || (screen === 'shop' && shopReturnTo === 'game');

  return (
    <View style={styles.container}>
      {shouldRenderGame && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: showGameVisual ? 1 : 0 },
          ]}
          pointerEvents={gamePointerEvents}
        >
          <DriftGame
            onShop={openShopFromGame}
            selectedBallId={selectedBallId}
            allowStart={screen === 'game'}
          />
        </View>
      )}

      {screen === 'menu' && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <MainMenuCanvasSkia
              visible={true}
              profile={profile}
              onProfileUpdate={refreshProfile}
              onPlay={() => handleTransition('headphones')}
              onTuto={() => console.log('TUTO')}
              onShop={openShopFromMenu}
              onProfile={openProfile} // ✅ AJOUT
            />
          </View>
        </View>
      )}

      {/* ✅ PROFILE AVEC SCREENTRANSITION */}
      <ScreenTransition visible={screen === 'profile'} fadeOutDuration={FADE_OUT_DURATION}>
        <ProfileCanvasSkia
          profile={profile}
          onProfileUpdate={refreshProfile}
          onBack={backFromProfile}
        />
      </ScreenTransition>

      <ScreenTransition visible={screen === 'shop'} fadeOutDuration={FADE_OUT_DURATION}>
        <ShopScreen
          profile={profile}
          onProfileUpdate={refreshProfile}
          onBack={backFromShop}
        />
      </ScreenTransition>

      {screen === 'headphones' && (
        <ScreenTransition visible={true} fadeOutDuration={FADE_OUT_DURATION}>
          <HeadphonesScreen onConfirm={() => handleTransition('game')} />
        </ScreenTransition>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  splash: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#f9fafb',
    letterSpacing: 4,
    opacity: 0.3,
  },
});