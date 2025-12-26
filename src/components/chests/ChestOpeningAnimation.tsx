// src/components/chests/ChestOpeningAnimation.tsx
import React, { useEffect } from 'react';
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

useEffect(() => {
if (isActive) {
setTimeout(() => {
flashOpacity.value = withSequence(
withTiming(1, { duration: 100 }),
withTiming(0, { duration: 200 })
);
}, 650);

setTimeout(() => {
onComplete();
}, 1500);
} else {
flashOpacity.value = 0;
}
}, [isActive, flashOpacity, onComplete]);

if (!isActive) return null;

return (
<Canvas style={styles.canvas} pointerEvents="none">
<Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} opacity={flashOpacity} color="#FFFFFF" />
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