// src/components/chests/ChestBox.tsx
import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
useSharedValue,
useAnimatedStyle,
withTiming,
withSequence,
withSpring,
} from 'react-native-reanimated';

type ChestType = 'bronze' | 'silver' | 'neon';

type Props = {
type: ChestType;
onPress: () => void;
shouldAnimate?: boolean;
};

const CHEST_IMAGES = {
bronze: require('../../assets/images/chest_bronze.png'),
silver: require('../../assets/images/chest_silver.png'),
neon: require('../../assets/images/chest_neon.png'),
};

const ChestBox: React.FC<Props> = ({ type, onPress, shouldAnimate }) => {
const rotation = useSharedValue(0);
const scale = useSharedValue(1);
const opacity = useSharedValue(1);

useEffect(() => {
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

setTimeout(() => {
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
}, [shouldAnimate, opacity, rotation, scale]);

const animatedStyle = useAnimatedStyle(() => ({
transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
opacity: opacity.value,
}));

return (
<Pressable onPress={onPress} style={styles.container}>
<Animated.View style={animatedStyle}>
<Image source={CHEST_IMAGES[type]} style={styles.image} resizeMode="contain" />
</Animated.View>
</Pressable>
);
};

const styles = StyleSheet.create({
container: {
width: 150,
height: 170,
justifyContent: 'center',
alignItems: 'center',
},
image: {
width: 150,
height: 170,
},
});

export { ChestBox };