import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { SkImage, useImage } from '@shopify/react-native-skia';

export type PreloadedAssets = {
  __hasProvider: boolean;

  glassCard: SkImage | null;

  menuDriftring: SkImage | null;
  menuRing: SkImage | null;
  typoMenu: SkImage | null;

  shopIcon: SkImage | null;
  cupIcon: SkImage | null;
  collectionIcon: SkImage | null;
  settingsIcon: SkImage | null;
  headphonesIcon: SkImage | null;

  // ✅ CHESTS (pour que le menu arrive complet)
  chestBronze: SkImage | null;
  chestSilver: SkImage | null;
  chestNeon: SkImage | null;
};

const DEFAULT_ASSETS: PreloadedAssets = {
  __hasProvider: false,

  glassCard: null,

  menuDriftring: null,
  menuRing: null,
  typoMenu: null,

  shopIcon: null,
  cupIcon: null,
  collectionIcon: null,
  settingsIcon: null,
  headphonesIcon: null,

  chestBronze: null,
  chestSilver: null,
  chestNeon: null,
};

const PreloadContext = createContext<PreloadedAssets>(DEFAULT_ASSETS);

let warned = false;

export const usePreloadedAssets = () => {
  const ctx = useContext(PreloadContext);

  if (__DEV__ && !ctx.__hasProvider && !warned) {
    warned = true;
    console.warn('[Preload] Provider not detected (or duplicate module). Using fallback images.');
  }

  return ctx;
};

type Props = { children: ReactNode };

export const PreloadProvider: React.FC<Props> = ({ children }) => {
  // ✅ Collection
  const glassCard = useImage(require('../assets/images/glasscard.png'));

  // ✅ Menu
  const menuDriftring = useImage(require('../assets/images/menu_driftring.png'));
  const menuRing = useImage(require('../assets/images/menu_ring.png'));
  const typoMenu = useImage(require('../assets/images/typo_menu.png'));

  const shopIcon = useImage(require('../assets/images/shop.png'));
  const cupIcon = useImage(require('../assets/images/cup.png'));
  const collectionIcon = useImage(require('../assets/images/collection.png'));
  const settingsIcon = useImage(require('../assets/images/settings_menu.png'));
  const headphonesIcon = useImage(require('../assets/images/headphones_icon.png'));

  // ✅ Chests (⚠️ adapte les noms si besoin)
  const chestBronze = useImage(require('../assets/images/chest_bronze.png'));
  const chestSilver = useImage(require('../assets/images/chest_silver.png'));
  const chestNeon = useImage(require('../assets/images/chest_neon.png'));

  const value = useMemo<PreloadedAssets>(
    () => ({
      __hasProvider: true,

      glassCard,

      menuDriftring,
      menuRing,
      typoMenu,

      shopIcon,
      cupIcon,
      collectionIcon,
      settingsIcon,
      headphonesIcon,

      chestBronze,
      chestSilver,
      chestNeon,
    }),
    [
      glassCard,
      menuDriftring,
      menuRing,
      typoMenu,
      shopIcon,
      cupIcon,
      collectionIcon,
      settingsIcon,
      headphonesIcon,
      chestBronze,
      chestSilver,
      chestNeon,
    ]
  );

  return <PreloadContext.Provider value={value}>{children}</PreloadContext.Provider>;
};
