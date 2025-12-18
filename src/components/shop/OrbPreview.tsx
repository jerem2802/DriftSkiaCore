import React from 'react';
import { View, StyleSheet } from 'react-native';

export const OrbPreview: React.FC<{ accent: string; size?: number }> = React.memo(
  ({ accent, size = 48 }) => {
    return (
      <View style={[styles.wrap, { width: size, height: size, borderRadius: size }]}>
        <View style={[styles.glow, { backgroundColor: accent, borderRadius: size }]} />
        <View style={[styles.core, { borderColor: accent, borderRadius: size }]} />
        <View style={[styles.inner, { borderRadius: size }]} />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.20,
    transform: [{ scale: 1.45 }],
  },
  core: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  inner: {
    position: 'absolute',
    width: '56%',
    height: '56%',
    top: '18%',
    left: '18%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ rotate: '18deg' }],
  },
});
