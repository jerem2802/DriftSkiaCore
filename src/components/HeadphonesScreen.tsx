import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Animated,
  Image,
  Easing,
} from 'react-native';

type HeadphonesScreenProps = {
  onConfirm: () => void;
};

const backgroundSource = require('../assets/images/menu_driftring.png');
const headphonesSource = require('../assets/images/headphones_icon.png');

const HeadphonesScreen: React.FC<HeadphonesScreenProps> = ({ onConfirm }) => {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.timing(wave1, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.delay(350),
        Animated.timing(wave2, {
          toValue: 1,
          duration: 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

    wave1.setValue(0);
    wave2.setValue(0);
    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [wave1, wave2]);

  const wave1Scale = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });
  const wave1Opacity = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.0, 0.8, 0],
  });

  const wave2Scale = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  });
  const wave2Opacity = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.0, 0.6, 0],
  });

  return (
    <ImageBackground
      source={backgroundSource}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Bloc central : casque + ondes + texte */}
        <View style={styles.centerBlock}>
          <View style={styles.headphonesWrapper}>
            {/* Ondes GAUCHE */}
            <Animated.View
              style={[
                styles.wave,
                styles.waveLeft,
                {
                  transform: [{ scale: wave1Scale }],
                  opacity: wave1Opacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.wave,
                styles.waveLeft,
                {
                  transform: [{ scale: wave2Scale }],
                  opacity: wave2Opacity,
                },
              ]}
            />

            {/* Ondes DROITE */}
            <Animated.View
              style={[
                styles.wave,
                styles.waveRight,
                {
                  transform: [{ scale: wave1Scale }],
                  opacity: wave1Opacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.wave,
                styles.waveRight,
                {
                  transform: [{ scale: wave2Scale }],
                  opacity: wave2Opacity,
                },
              ]}
            />

            {/* Casque */}
            <Image
              source={headphonesSource}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>

          {/* Texte sous le casque */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>Pour une expérience optimale</Text>
            <Text style={styles.subtitle}>
              utilise un casque ou des écouteurs.
            </Text>
          </View>
        </View>

        {/* Bouton OK en bas */}
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
    width: 260,   // casque + ondes
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconImage: {
    width: 220,   // taille du casque
    height: 220,
    tintColor: '#f9fafb', // casque blanc (changeable en néon)
  },

  wave: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#22d3ee',
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
