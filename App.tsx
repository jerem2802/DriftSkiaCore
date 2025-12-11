// App.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DriftGame from './src/game/DriftGame';
import MainMenuScreen from './src/components/MainMenuScreen';
import HeadphonesScreen from './src/components/HeadphonesScreen';

type Screen = 'menu' | 'headphones' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  return (
    <View style={styles.container}>
      {screen === 'menu' && (
        <MainMenuScreen
          onPlay={() => setScreen('headphones')}
          onTuto={() => {
            console.log('TUTO pressed');
          }}
          onOptions={() => {
            console.log('OPTIONS pressed');
          }}
        />
      )}

      {screen === 'headphones' && (
        <HeadphonesScreen onConfirm={() => setScreen('game')} />
      )}

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
