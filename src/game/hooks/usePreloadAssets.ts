import { useMemo } from 'react';
import { usePreloadedAssets } from '../../contexts/PreloadContext';

export const usePreloadAssets = () => {
  const a = usePreloadedAssets();

  return useMemo(() => {
    return !!(
      a.glassCard &&
      a.backgroundCollection && // ✅ AJOUT
      a.menuDriftring &&
      a.menuRing &&
      a.typoMenu &&
      a.shopIcon &&
      a.cupIcon &&
      a.collectionIcon &&
      a.settingsIcon &&
      a.headphonesIcon &&
      a.chestBronze &&
      a.chestSilver &&
      a.chestNeon
    );
  }, [a]);
};
