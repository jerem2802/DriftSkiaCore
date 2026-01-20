// src/game/hooks/usePreloadAssets.ts
import { useEffect, useState } from 'react';
import { usePreloadedAssets } from '../../contexts/PreloadContext';

export const usePreloadAssets = () => {
  const assets = usePreloadedAssets();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!assets.loaded) return;

    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setIsReady(true);
      });
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [assets.loaded]);

  return isReady;
};
