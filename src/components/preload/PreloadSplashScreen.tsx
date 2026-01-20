// src/components/preload/PreloadSplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas, Group, Image as SkImage, useImage } from '@shopify/react-native-skia';

// Optionnel mais utile : lance aussi le chargement des coffres pendant le splash
import { ChestBoxSkia } from '../chests/ChestBoxSkia';

type Props = {
  title?: string;
  onReady?: () => void;
};

export const PreloadSplashScreen: React.FC<Props> = ({ title = 'DRIFT-RING', onReady }) => {
  // ✅ Même sources que le menu -> cache Skia partagé -> plus de “retard d’apparition”
  const menuBg = useImage(require('../../assets/images/menu_driftring.png'));
  const menuRing = useImage(require('../../assets/images/menu_ring.png'));
  const typoMenu = useImage(require('../../assets/images/typo_menu.png'));

  const shopIcon = useImage(require('../../assets/images/shop.png'));
  const cupIcon = useImage(require('../../assets/images/cup.png'));
  const collectionIcon = useImage(require('../../assets/images/collection.png'));

  const settingsIcon = useImage(require('../../assets/images/settings_menu.png'));

  const fired = useRef(false);

  const allReady =
    !!menuBg &&
    !!menuRing &&
    !!typoMenu &&
    !!shopIcon &&
    !!cupIcon &&
    !!collectionIcon &&
    !!settingsIcon;

  useEffect(() => {
    if (!onReady || fired.current) return;
    if (!allReady) return;

    fired.current = true;
    // 2 frames -> laisse Skia uploader textures / éviter flash à l’arrivée
    requestAnimationFrame(() => requestAnimationFrame(() => onReady()));
  }, [allReady, onReady]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>

      {/* Warmup invisible */}
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Group opacity={0.001}>
          {menuBg && <SkImage image={menuBg} x={0} y={0} width={2} height={2} />}
          {menuRing && <SkImage image={menuRing} x={2} y={0} width={2} height={2} />}
          {typoMenu && <SkImage image={typoMenu} x={4} y={0} width={2} height={2} />}

          {shopIcon && <SkImage image={shopIcon} x={6} y={0} width={2} height={2} />}
          {cupIcon && <SkImage image={cupIcon} x={8} y={0} width={2} height={2} />}
          {collectionIcon && <SkImage image={collectionIcon} x={10} y={0} width={2} height={2} />}

          {settingsIcon && <SkImage image={settingsIcon} x={12} y={0} width={2} height={2} />}
        </Group>
      </Canvas>

      {/* Bonus: déclenche le chargement des assets des coffres pendant le splash (même s’ils sont en View layer) */}
      <View style={styles.hidden} pointerEvents="none">
        <ChestBoxSkia type="bronze" onPress={() => {}} shouldAnimate={false} width={2} height={2} />
        <ChestBoxSkia type="silver" onPress={() => {}} shouldAnimate={false} width={2} height={2} />
        <ChestBoxSkia type="neon" onPress={() => {}} shouldAnimate={false} width={2} height={2} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#f9fafb',
    letterSpacing: 4,
    opacity: 0.3,
  },
  hidden: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 1,
    height: 1,
  },
});
