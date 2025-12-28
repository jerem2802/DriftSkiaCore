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

import { loadProfile, resetProfileForDev } from './src/meta/playerProfile';

type Screen = 'menu' | 'headphones' | 'game' | 'shop';

const FADE_OUT_DURATION = 800;

const DEV_RESET_PROFILE_ON_LAUNCH = false;

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [shopReturnTo, setShopReturnTo] = useState<Screen>('menu');
  const [selectedBallId, setSelectedBallId] = useState<string>('core');

  useEffect(() => {
    const loadPlayerProfile = async () => {
      if (DEV_RESET_PROFILE_ON_LAUNCH) {
        await resetProfileForDev();
        console.log('🔥 DEV MODE: Profil reset !');
      }
      
      const profile = await loadProfile();
      setSelectedBallId(profile.selectedBallId || 'core');
    };

    loadPlayerProfile().catch(() => {});
  }, []);

  // ✅ FONCTION REFRESH BILLE
  const refreshSelectedBall = useCallback(async () => {
    const profile = await loadProfile();
    setSelectedBallId(profile.selectedBallId || 'core');
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
              onPlay={() => handleTransition('headphones')}
              onTuto={() => console.log('TUTO')}
              onShop={openShopFromMenu}
              onBallChanged={refreshSelectedBall}
            />
          </View>
        </View>
      )}

      <ScreenTransition visible={screen === 'shop'} fadeOutDuration={FADE_OUT_DURATION}>
        <ShopScreen onBack={backFromShop} onSelectedBallId={setSelectedBallId} />
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
});