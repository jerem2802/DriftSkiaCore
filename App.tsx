import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

import DriftGame from './src/game/DriftGame';
import MainMenuScreen from './src/components/MainMenuScreen';
import HeadphonesScreen from './src/components/HeadphonesScreen';
import { ScreenTransition } from './src/components/ScreenTransition';
import { ShopScreen } from './src/components/shop/ShopScreen';

import { loadProfile } from './src/meta/playerProfile';

type Screen = 'menu' | 'headphones' | 'game' | 'shop';

const FADE_OUT_DURATION = 800;

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  // d'où vient le shop ? (menu ou game)
  const [shopReturnTo, setShopReturnTo] = useState<Screen>('menu');

  // bille équipée (MVP: visuel uniquement)
  const [selectedBallId, setSelectedBallId] = useState<string>('core');

  useEffect(() => {
    loadProfile()
      .then((p) => setSelectedBallId(p.selectedBallId || 'core'))
      .catch(() => {});
  }, []);

  // Transition instantanée
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

  // ✅ pré-mount game aussi pendant headphones (anti flash au OK)
  const shouldRenderGame =
    screen === 'game' ||
    screen === 'headphones' ||
    (screen === 'shop' && shopReturnTo === 'game');

  // ✅ le game ne reçoit des touches QUE sur screen === 'game'
  const gamePointerEvents = screen === 'game' ? 'auto' : 'none';

  // ✅ le game ne doit être VISIBLE que quand on est en game
  // (ou derrière le shop si shop ouvert depuis game)
  const showGameVisual = screen === 'game' || (screen === 'shop' && shopReturnTo === 'game');

  return (
    <View style={styles.container}>
      {/* GAME monté (pré-warm) mais invisible tant qu'on n'est pas en game */}
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

      <ScreenTransition visible={screen === 'menu'} fadeOutDuration={FADE_OUT_DURATION}>
        <MainMenuScreen
          onPlay={() => handleTransition('headphones')}
          onTuto={() => console.log('TUTO')}
          onOptions={() => console.log('OPTIONS')}
          onShop={openShopFromMenu}
        />
      </ScreenTransition>

      <ScreenTransition visible={screen === 'shop'} fadeOutDuration={FADE_OUT_DURATION}>
        <ShopScreen onBack={backFromShop} onSelectedBallId={setSelectedBallId} />
      </ScreenTransition>

      <ScreenTransition visible={screen === 'headphones'} fadeOutDuration={FADE_OUT_DURATION}>
        <HeadphonesScreen onConfirm={() => handleTransition('game')} />
      </ScreenTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
