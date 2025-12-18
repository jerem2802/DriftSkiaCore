// src/components/HeadphonesScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

type HeadphonesScreenProps = {
  onConfirm: () => void;
};

const backgroundSource = require('../assets/images/menu_driftring.png');
const headphonesSource = require('../assets/images/headphones_icon.png');

const HeadphonesScreen: React.FC<HeadphonesScreenProps> = ({ onConfirm }) => {
  const wave1Progress = useSharedValue(0);
  const wave2Progress = useSharedValue(0);

  useEffect(() => {
    wave1Progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.linear }),
      -1,
      false
    );

    wave2Progress.value = withRepeat(
      withSequence(
        withDelay(350, withTiming(1, { duration: 1400, easing: Easing.linear }))
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wave1Style = useAnimatedStyle(() => {
    const scale = 1 + wave1Progress.value * 0.4;
    const opacity = wave1Progress.value < 0.5 
      ? wave1Progress.value * 1.6
      : (1 - wave1Progress.value) * 1.6;

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const wave2Style = useAnimatedStyle(() => {
    const scale = 1 + wave2Progress.value * 0.6;
    const opacity = wave2Progress.value < 0.5
      ? wave2Progress.value * 1.2
      : (1 - wave2Progress.value) * 1.2;

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <ImageBackground
      source={backgroundSource}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.centerBlock}>
          <View style={styles.headphonesWrapper}>
            {/* Ondes GAUCHE */}
            <Animated.View style={[styles.wave, styles.waveLeft, wave1Style]} />
            <Animated.View style={[styles.wave, styles.waveLeft, wave2Style]} />

            {/* Ondes DROITE */}
            <Animated.View style={[styles.wave, styles.waveRight, wave1Style]} />
            <Animated.View style={[styles.wave, styles.waveRight, wave2Style]} />

            {/* Casque */}
            <Image
              source={headphonesSource}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>Pour une expérience optimale</Text>
            <Text style={styles.subtitle}>
              utilise un casque ou des écouteurs.
            </Text>
          </View>
        </View>

        <View style={styles.bottomBlock}>
          <Pressable style={styles.button} onPress={onConfirm}>
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HeadphonesScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },

  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headphonesWrapper: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  iconImage: {
    width: 220,
    height: 220,
    tintColor: '#f9fafb',
    zIndex: 10,
  },

  wave: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#22d3ee',
    zIndex: 1,
  },
  waveLeft: {
    left: -20,
  },
  waveRight: {
    right: -20,
  },

  textBlock: {
    marginTop: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#e5e7eb',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  bottomBlock: {
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#ff6bd5',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#ffe6ff',
  },
});