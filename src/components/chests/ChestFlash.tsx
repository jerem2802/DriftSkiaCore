// src/components/chest/ChestFlash.tsx
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = {
isActive: boolean;
};

const { width, height } = Dimensions.get('window');

export const ChestFlash: React.FC<Props> = ({ isActive }) => {
const opacity = useSharedValue(0);

useEffect(() => {
if (isActive) {
opacity.value = withTiming(1, { duration: 100 }, () => {
opacity.value = withTiming(0, { duration: 200 });
});
} else {
opacity.value = 0;
}
}, [isActive, opacity]);

const animatedStyle = useAnimatedStyle(() => ({
opacity: opacity.value,
}));

return <Animated.View style={[styles.flash, animatedStyle]} pointerEvents="none" />;
};

const styles = StyleSheet.create({
flash: {
position: 'absolute',
width,
height,
backgroundColor: '#FFF',
zIndex: 9999,
},
});