import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { SkImage, useImage } from '@shopify/react-native-skia';

type PreloadedAssets = {
  glassCard: SkImage | null;
  menuRing: SkImage | null;
  menuDriftring: SkImage | null;
  typoMenu: SkImage | null;
  shopIcon: SkImage | null;
  collectionIcon: SkImage | null;
  settingsIcon: SkImage | null;
  cupIcon: SkImage | null;
  headphonesIcon: SkImage | null;
  loaded: boolean;
};

const PreloadContext = createContext<PreloadedAssets | null>(null);

export const usePreloadedAssets = () => {
  const context = useContext(PreloadContext);
  if (!context) {
    throw new Error('usePreloadedAssets must be used within PreloadProvider');
  }
  return context;
};

// ✅ ne throw jamais (utile dans des composants leaf)
export const useOptionalPreloadedAssets = () => useContext(PreloadContext);

type Props = { children: ReactNode };

export const PreloadProvider: React.FC<Props> = ({ children }) => {
  const glassCard = useImage(require('../assets/images/glasscard.png'));
  const menuRing = useImage(require('../assets/images/menu_ring.png'));
  const menuDriftring = useImage(require('../assets/images/menu_driftring.png'));
  const typoMenu = useImage(require('../assets/images/typo_menu.png'));
  const shopIcon = useImage(require('../assets/images/shop.png'));
  const collectionIcon = useImage(require('../assets/images/collection.png'));
  const settingsIcon = useImage(require('../assets/images/settings_menu.png'));
  const cupIcon = useImage(require('../assets/images/cup.png'));
  const headphonesIcon = useImage(require('../assets/images/headphones_icon.png'));

  const loaded =
    !!glassCard &&
    !!menuRing &&
    !!menuDriftring &&
    !!typoMenu &&
    !!shopIcon &&
    !!collectionIcon &&
    !!settingsIcon &&
    !!cupIcon &&
    !!headphonesIcon;

  const value = useMemo<PreloadedAssets>(
    () => ({
      glassCard,
      menuRing,
      menuDriftring,
      typoMenu,
      shopIcon,
      collectionIcon,
      settingsIcon,
      cupIcon,
      headphonesIcon,
      loaded,
    }),
    [
      glassCard,
      menuRing,
      menuDriftring,
      typoMenu,
      shopIcon,
      collectionIcon,
      settingsIcon,
      cupIcon,
      headphonesIcon,
      loaded,
    ]
  );

  return <PreloadContext.Provider value={value}>{children}</PreloadContext.Provider>;
};
