import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import DriftGame from './src/game/DriftGame';
import MainMenuScreen from './src/components/MainMenuScreen';
import HeadphonesScreen from './src/components/HeadphonesScreen';
import { ScreenTransition } from './src/components/ScreenTransition';
import { ShopScreen } from './src/components/shop/ShopScreen';

type Screen = 'menu' | 'headphones' | 'game' | 'shop';

const FADE_OUT_DURATION = 800;

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [transitioning, setTransitioning] = useState(false);

  // ✅ d’où vient le shop, pour un back logique
  const [shopReturnTo, setShopReturnTo] = useState<Screen>('menu');

  const go = (target: Screen) => {
    setTransitioning(true);
    setTimeout(() => {
      setScreen(target);
      setTransitioning(false);
    }, FADE_OUT_DURATION);
  };

  const openShopFromMenu = () => {
    setShopReturnTo('menu');
    go('shop');
  };

  const openShopFromGame = () => {
    setShopReturnTo('game');
    go('shop');
  };

  const closeShop = () => go(shopReturnTo);

  // ✅ IMPORTANT :
  // - Shop = keepMounted (pré-monté => plus de clac)
  // - Si tu veux revenir sur le GameOver après le shop : DriftGame doit rester monté aussi.
  const keepGameMounted = screen === 'game' || (screen === 'shop' && shopReturnTo === 'game');

  return (
    <View style={styles.container}>
      <ScreenTransition
        visible={screen === 'menu' && !transitioning}
        fadeOutDuration={FADE_OUT_DURATION}
      >
        <MainMenuScreen
          onPlay={() => go('headphones')}
          onTuto={() => console.log('TUTO')}
          onOptions={() => console.log('OPTIONS')}
          onShop={openShopFromMenu}
        />
      </ScreenTransition>

      <ScreenTransition
        visible={screen === 'headphones' && !transitioning}
        fadeOutDuration={FADE_OUT_DURATION}
      >
        <HeadphonesScreen onConfirm={() => go('game')} />
      </ScreenTransition>

      <ScreenTransition
        visible={screen === 'game' && !transitioning}
        fadeOutDuration={FADE_OUT_DURATION}
        keepMounted={keepGameMounted}
      >
        <DriftGame onShop={openShopFromGame} />
      </ScreenTransition>

      <ScreenTransition
        visible={screen === 'shop' && !transitioning}
        fadeOutDuration={FADE_OUT_DURATION}
        keepMounted
      >
        <ShopScreen onBack={closeShop} />
      </ScreenTransition>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
});
