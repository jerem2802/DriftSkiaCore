// src/components/preload/PreloadSplashScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Image, Group } from '@shopify/react-native-skia';
import { usePreloadedAssets } from '../../contexts/PreloadContext';

type Props = {
  title?: string;
};

export const PreloadSplashScreen: React.FC<Props> = ({ title = 'DRIFT-RING' }) => {
  const assets = usePreloadedAssets();

  return (
    <View style={styles.splash}>
      <Text style={styles.splashText}>{title}</Text>

      {/* Warm-up GPU (quasi invisible) */}
      {assets.loaded && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Canvas style={StyleSheet.absoluteFillObject}>
            <Group opacity={0.01}>
              {assets.glassCard && <Image image={assets.glassCard} x={10} y={10} width={160} height={220} />}
              {assets.menuRing && <Image image={assets.menuRing} x={200} y={10} width={120} height={120} />}
              {assets.menuDriftring && <Image image={assets.menuDriftring} x={10} y={260} width={220} height={120} />}
              {assets.typoMenu && <Image image={assets.typoMenu} x={10} y={400} width={220} height={80} />}
              {assets.shopIcon && <Image image={assets.shopIcon} x={260} y={260} width={64} height={64} />}
              {assets.collectionIcon && <Image image={assets.collectionIcon} x={260} y={340} width={64} height={64} />}
              {assets.settingsIcon && <Image image={assets.settingsIcon} x={260} y={420} width={64} height={64} />}
              {assets.cupIcon && <Image image={assets.cupIcon} x={260} y={500} width={64} height={64} />}
              {assets.headphonesIcon && <Image image={assets.headphonesIcon} x={200} y={500} width={64} height={64} />}
            </Group>
          </Canvas>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#f9fafb',
    letterSpacing: 4,
    opacity: 0.3,
  },
});
