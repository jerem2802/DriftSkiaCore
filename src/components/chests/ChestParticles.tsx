// src/components/chest/ChestParticles.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
useSharedValue, 
useAnimatedStyle, 
withRepeat, 
withTiming, 
Easing, 
cancelAnimation 
} from 'react-native-reanimated';

type ParticleProps = { 
index: number; 
width: number; 
height: number; 
color: string; 
isActive: boolean;
};

const Particle: React.FC<ParticleProps> = ({ index, width, height, color, isActive }) => {
const progress = useSharedValue(0);
const angle = (index / 12) * Math.PI * 2;
const distance = 80;
const startX = width * 0.5;
const startY = height * 0.3;

useEffect(() => {
if (isActive) {
progress.value = 0;
progress.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false);
} else {
cancelAnimation(progress);
progress.value = 0;
}
}, [isActive, progress]);

const animatedStyle = useAnimatedStyle(() => {
const p = progress.value;
const x = startX + Math.cos(angle) * distance * p;
const y = startY + Math.sin(angle) * distance * p - 30 * p;
const opacity = Math.max(0, 1 - p);
const scale = 1 + 0.5 * (1 - p);
return { left: x, top: y, opacity, transform: [{ scale }] };
});

return <Animated.View style={[styles.particle, animatedStyle, { backgroundColor: color }]} />;
};

type Props = { width: number; height: number; isActive: boolean; color: string };

export const ChestParticles: React.FC<Props> = ({ width, height, isActive, color }) => {
if (!isActive) return null;
return (
<View style={[styles.container, { width, height }]} pointerEvents="none">
{Array.from({ length: 12 }, (_, i) => (
<Particle key={i} index={i} width={width} height={height} color={color} isActive={isActive} />
))}
</View>
);
};

const styles = StyleSheet.create({
container: { position: 'absolute', top: 0, left: 0 },
particle: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
});