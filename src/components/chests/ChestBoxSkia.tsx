// src/components/chests/ChestBoxSkia.tsx
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Canvas, Image, useImage, Group } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, withSequence, withSpring, useDerivedValue } from 'react-native-reanimated';

type ChestType = 'bronze' | 'silver' | 'neon';

type Props = {
  type: ChestType;
  onPress: () => void;
  shouldAnimate?: boolean;
  width?: number;
  height?: number;
};

const CHEST_IMAGES = {
  bronze: require('../../assets/images/chest_bronze.png'),
  silver: require('../../assets/images/chest_silver.png'),
  neon: require('../../assets/images/chest_neon.png'),
};

export const ChestBoxSkia: React.FC<Props> = ({ type, onPress, shouldAnimate, width = 150, height = 170 }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const t = useRef<any>(null);

  const chestImage = useImage(CHEST_IMAGES[type]);

  useEffect(() => {
    if (t.current) {
      clearTimeout(t.current);
      t.current = null;
    }

    if (shouldAnimate) {
      rotation.value = withSequence(
        withTiming(-3, { duration: 75 }),
        withTiming(3, { duration: 75 }),
        withTiming(-5, { duration: 75 }),
        withTiming(5, { duration: 75 }),
        withTiming(-8, { duration: 75 }),
        withTiming(8, { duration: 75 }),
        withTiming(-10, { duration: 75 }),
        withTiming(10, { duration: 75 }),
        withTiming(0, { duration: 75 })
      );

      t.current = setTimeout(() => {
        scale.value = withSpring(2.5, { damping: 10 });
        opacity.value = withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(0, { duration: 300 })
        );
      }, 650);
    } else {
      rotation.value = withSpring(0);
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
    }

    return () => {
      if (t.current) clearTimeout(t.current);
      t.current = null;
    };
  }, [shouldAnimate, opacity, rotation, scale]);

  const transform = useDerivedValue(() => {
    'worklet';
    return [{ rotate: (rotation.value * Math.PI) / 180 }, { scale: scale.value }];
  });

  if (!chestImage) return null;

  return (
    <Pressable onPress={onPress} style={[styles.container, { width, height }]}>
      <Canvas style={{ width, height }}>
        <Group transform={transform} origin={{ x: width * 0.5, y: height * 0.5 }}>
          <Image image={chestImage} x={0} y={0} width={width} height={height} fit="contain" opacity={opacity} />
        </Group>
      </Canvas>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
});
