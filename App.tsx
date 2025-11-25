// App.tsx
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
} from '@shopify/react-native-skia';
import {
  Easing,
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const CENTER_X = width / 2;
const CENTER_Y = height / 2;
const RING_RADIUS = width * 0.35;
const BALL_RADIUS = 10;

export default function App(): JSX.Element {
  // Angle animé
  const angle = useSharedValue(0);

  // Positions dérivées (Reanimated)
  const ballX = useDerivedValue(() => {
    return CENTER_X + RING_RADIUS * Math.cos(angle.value);
  });

  const ballY = useDerivedValue(() => {
    return CENTER_Y + RING_RADIUS * Math.sin(angle.value);
  });

  // Lancer l'animation
  useEffect(() => {
    angle.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 2500,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [angle]);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Circle cx={CENTER_X} cy={CENTER_Y} r={RING_RADIUS + 20} color="#020617" />
        <Circle cx={CENTER_X} cy={CENTER_Y} r={RING_RADIUS} color="#06b6d4" />
        <Circle cx={ballX} cy={ballY} r={BALL_RADIUS} color="#ffffff" />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width,
    height,
  },
});