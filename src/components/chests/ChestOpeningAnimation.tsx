// src/components/chests/ChestOpeningAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
import { Dimensions, StyleSheet } from 'react-native';

type Props = {
  isActive: boolean;
  onComplete: () => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ChestOpeningAnimation: React.FC<Props> = ({ isActive, onComplete }) => {
  const flashOpacity = useSharedValue(0);

  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // cleanup previous
    if (t1.current) clearTimeout(t1.current);
    if (t2.current) clearTimeout(t2.current);
    t1.current = null;
    t2.current = null;

    if (isActive) {
      flashOpacity.value = 0;

      t1.current = setTimeout(() => {
        flashOpacity.value = withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: 200 })
        );
      }, 650);

      t2.current = setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      flashOpacity.value = 0;
    }

    return () => {
      if (t1.current) clearTimeout(t1.current);
      if (t2.current) clearTimeout(t2.current);
      t1.current = null;
      t2.current = null;
    };
  }, [isActive, flashOpacity, onComplete]);

  if (!isActive) return null;

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      <Rect
        x={0}
        y={0}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        opacity={flashOpacity}
        color="#FFFFFF"
      />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 9999,
  },
});
