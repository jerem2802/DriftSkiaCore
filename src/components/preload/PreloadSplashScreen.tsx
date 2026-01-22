import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Group, Image as SkImage, useImage } from '@shopify/react-native-skia';

import { ChestBoxSkia } from '../chests/ChestBoxSkia';

type Props = {
  title?: string;
  onReady?: () => void;
};

export const PreloadSplashScreen: React.FC<Props> = ({ onReady }) => {
  const menuBg = useImage(require('../../assets/images/menu_driftring.png'));
  const menuHeader = useImage(require('../../assets/images/menu_driftring_header.png'));
  const menuRing = useImage(require('../../assets/images/menu_ring.png'));
  const typoMenu = useImage(require('../../assets/images/typo_menu.png'));

  const shopIcon = useImage(require('../../assets/images/shop.png'));
  const cupIcon = useImage(require('../../assets/images/cup.png'));
  const collectionIcon = useImage(require('../../assets/images/collection.png'));
  const settingsIcon = useImage(require('../../assets/images/settings_menu.png'));

  // ✅ NEW warmup
  const bgCollection = useImage(require('../../assets/images/background_collection.png'));

  const fired = useRef(false);

  const allReady =
    !!menuBg &&
    !!menuHeader &&
    !!menuRing &&
    !!typoMenu &&
    !!shopIcon &&
    !!cupIcon &&
    !!collectionIcon &&
    !!settingsIcon &&
    !!bgCollection; // ✅ AJOUT

  useEffect(() => {
    if (!onReady || fired.current) return;
    if (!allReady) return;

    fired.current = true;
    requestAnimationFrame(() => requestAnimationFrame(() => onReady()));
  }, [allReady, onReady]);

  return (
    <View style={styles.root}>
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Group opacity={0.001}>
          {menuBg && <SkImage image={menuBg} x={0} y={0} width={2} height={2} />}
          {menuHeader && <SkImage image={menuHeader} x={2} y={0} width={2} height={2} />}
          {menuRing && <SkImage image={menuRing} x={4} y={0} width={2} height={2} />}
          {typoMenu && <SkImage image={typoMenu} x={6} y={0} width={2} height={2} />}

          {shopIcon && <SkImage image={shopIcon} x={8} y={0} width={2} height={2} />}
          {cupIcon && <SkImage image={cupIcon} x={10} y={0} width={2} height={2} />}
          {collectionIcon && <SkImage image={collectionIcon} x={12} y={0} width={2} height={2} />}
          {settingsIcon && <SkImage image={settingsIcon} x={14} y={0} width={2} height={2} />}

          {/* ✅ collection background warmup */}
          {bgCollection && <SkImage image={bgCollection} x={16} y={0} width={2} height={2} />}
        </Group>
      </Canvas>

      <View style={styles.hidden} pointerEvents="none">
        <ChestBoxSkia type="bronze" onPress={() => {}} shouldAnimate={false} width={2} height={2} />
        <ChestBoxSkia type="silver" onPress={() => {}} shouldAnimate={false} width={2} height={2} />
        <ChestBoxSkia type="neon" onPress={() => {}} shouldAnimate={false} width={2} height={2} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  hidden: { position: 'absolute', left: -9999, top: -9999, width: 1, height: 1 },
});
