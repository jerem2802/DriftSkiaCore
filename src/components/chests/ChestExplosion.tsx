// src/components/chest/ChestExplosion.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
useSharedValue,
useAnimatedStyle,
withTiming,
Easing,
} from 'react-native-reanimated';

type ParticleProps = {
angle: number;
color: string;
size: number;
};

const Particle: React.FC<ParticleProps> = ({ angle, color, size }) => {
const translateX = useSharedValue(0);
const translateY = useSharedValue(0);
const opacity = useSharedValue(1);

useEffect(() => {
const distance = 80 + Math.random() * 40;
translateX.value = withTiming(Math.cos(angle) * distance, { duration: 800, easing: Easing.out(Easing.ease) });
translateY.value = withTiming(Math.sin(angle) * distance - 30, { duration: 800, easing: Easing.out(Easing.ease) });
opacity.value = withTiming(0, { duration: 800 });
}, [angle, translateX, translateY, opacity]);

const animatedStyle = useAnimatedStyle(() => ({
transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
opacity: opacity.value,
}));

return (
<Animated.View
style={[
styles.particle,
animatedStyle,
{ width: size, height: size, backgroundColor: color, borderRadius: size / 2 },
]}
/>
);
};

type Props = {
isActive: boolean;
type: 'bronze' | 'silver' | 'neon';
};

const COLORS = {
bronze: ['#FFD700', '#FFA500', '#FFF'],
silver: ['#60A5FA', '#A0C4FF', '#FFF'],
neon: ['#E879F9', '#FF6BD5', '#FFF'],
};

export const ChestExplosion: React.FC<Props> = ({ isActive, type }) => {
const [particles, setParticles] = useState<Array<{ angle: number; color: string; size: number }>>([]);

useEffect(() => {
if (isActive) {
const newParticles = Array.from({ length: 40 }, (_, i) => ({
angle: (i / 40) * Math.PI * 2,
color: COLORS[type][Math.floor(Math.random() * 3)],
size: 6 + Math.random() * 8,
}));
setParticles(newParticles);
} else {
setParticles([]);
}
}, [isActive, type]);

if (!isActive) return null;

return (
<View style={styles.container} pointerEvents="none">
{particles.map((p, i) => (
<Particle key={i} angle={p.angle} color={p.color} size={p.size} />
))}
</View>
);
};

const styles = StyleSheet.create({
container: {
position: 'absolute',
width: 300,
height: 300,
justifyContent: 'center',
alignItems: 'center',
},
particle: {
position: 'absolute',
},
});