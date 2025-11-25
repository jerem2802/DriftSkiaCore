import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Canvas, Circle } from '@shopify/react-native-skia';

type DriftGameProps = {};

const DriftGame: React.FC<DriftGameProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.canvasWrapper}>
        <Canvas style={styles.canvas}>
          {/* Test Skia : rond cyan */}
          <Circle cx={180} cy={360} r={80} color="cyan" />
        </Canvas>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  canvasWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: 360,
    height: 720,
  },
});

export default DriftGame;
