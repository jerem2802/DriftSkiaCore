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

type Screen = 'menu' | 'headphones' | 'game';

const FADE_OUT_DURATION = 800; // ✅ Défini une seule fois

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [transitioning, setTransitioning] = useState(false);

  const handleTransition = (targetScreen: Screen) => {
    setTransitioning(true);
    setTimeout(() => {
      setScreen(targetScreen);
      setTransitioning(false);
    }, FADE_OUT_DURATION);
  };

  return (
    <View style={styles.container}>
      <ScreenTransition 
        visible={screen === 'menu' && !transitioning}
        fadeOutDuration={FADE_OUT_DURATION}
      >
        <MainMenuScreen
          onPlay={() => handleTransition('headphones')}
          onTuto={() => console.log('TUTO')}
          onOptions={() => console.log('OPTIONS')}
        />
      </ScreenTransition>

      <ScreenTransition 
        visible={screen === 'headphones' && !transitioning}
        fadeOutDuration={FADE_OUT_DURATION}
      >
        <HeadphonesScreen onConfirm={() => handleTransition('game')} />
      </ScreenTransition>

      {screen === 'game' && <DriftGame />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});