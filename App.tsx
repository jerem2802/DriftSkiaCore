// App.tsx
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

import DriftGame from './src/game/DriftGame';
import { MainMenuCanvasSkia } from './src/components/MainMenuCanvasSkia';
import HeadphonesScreen from './src/components/HeadphonesScreen';
import { ScreenTransition } from './src/components/ScreenTransition';
import { ShopScreen } from './src/components/shop/ShopScreen';
import { CollectionScreen } from './src/components/collection/CollectionScreen';

import { loadProfile, resetProfileForDev, type PlayerProfile } from './src/meta/playerProfile';

import { PreloadProvider } from './src/contexts/PreloadContext';
import { usePreloadAssets } from './src/game/hooks/usePreloadAssets';
import { PreloadSplashScreen } from './src/components/preload/PreloadSplashScreen';

type Screen = 'menu' | 'headphones' | 'game' | 'shop' | 'collection';

const FADE_OUT_DURATION = 800;
const DEV_RESET_PROFILE_ON_LAUNCH = false;

function AppContent() {
  const [appReady, setAppReady] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [screen, setScreen] = useState<Screen>('menu');
  const [shopReturnTo, setShopReturnTo] = useState<Screen>('menu');
  const [selectedBallId, setSelectedBallId] = useState<string>('core');

  const assetsReady = usePreloadAssets();

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

  const openCollection = useCallback(() => {
    handleTransition('collection');
  }, [handleTransition]);

  const backFromCollection = useCallback(() => {
    handleTransition('menu');
  }, [handleTransition]);

  if (!appReady || !profile || !assetsReady) {
    return <PreloadSplashScreen title="DRIFT-RING" />;
  }

  const shouldRenderGame =
    screen === 'game' ||
    screen === 'headphones' ||
    (screen === 'shop' && shopReturnTo === 'game');

  const gamePointerEvents = screen === 'game' ? 'auto' : 'none';
  const showGameVisual = screen === 'game' || (screen === 'shop' && shopReturnTo === 'game');

  const menuVisible = screen === 'menu';

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

      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: menuVisible ? 1 : 0,
            pointerEvents: menuVisible ? 'auto' : 'none',
          },
        ]}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <MainMenuCanvasSkia
            visible={menuVisible}
            profile={profile}
            onProfileUpdate={refreshProfile}
            onPlay={() => handleTransition('headphones')}
            onTuto={() => console.log('TUTO')}
            onShop={openShopFromMenu}
            onProfile={openCollection}
          />
        </View>
      </View>

      <ScreenTransition visible={screen === 'collection'} fadeOutDuration={FADE_OUT_DURATION}>
        <CollectionScreen profile={profile} onBack={backFromCollection} />
      </ScreenTransition>

      <ScreenTransition visible={screen === 'shop'} fadeOutDuration={FADE_OUT_DURATION}>
        <ShopScreen profile={profile} onProfileUpdate={refreshProfile} onBack={backFromShop} />
      </ScreenTransition>

      {screen === 'headphones' && (
        <ScreenTransition visible={true} fadeOutDuration={FADE_OUT_DURATION}>
          <HeadphonesScreen onConfirm={() => handleTransition('game')} />
        </ScreenTransition>
      )}
    </View>
  );
}

export default function App() {
  return (
    <PreloadProvider>
      <AppContent />
    </PreloadProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
