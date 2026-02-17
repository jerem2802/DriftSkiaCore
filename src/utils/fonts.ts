// src/utils/fonts.ts
// Fonts centralisées pour Skia (évite de recalculer matchFont partout)

import { matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });

export const FONTS = {
  scoreHUD: matchFont({
    fontFamily,
    fontSize: 48,
    fontWeight: '900',
  }),

  multHUD: matchFont({
    fontFamily,
    fontSize: 34,
    fontWeight: '900',
  }),

  popup: matchFont({
    fontFamily,
    fontSize: 26,
    fontWeight: 'bold',
  }),

  coinHUD: matchFont({
    fontFamily,
    fontSize: 22,
    fontWeight: '800',
  }),
  ui: matchFont({
    fontFamily,
    fontSize: 16,
    fontWeight: '700',
  }),
  
  // Header fonts (RÉDUIT pour header compact)
  headerName: matchFont({
    fontFamily,
    fontSize: 14,  // Réduit (était 16)
    fontWeight: '700',
  }),
  headerCoins: matchFont({
    fontFamily,
    fontSize: 16,  // Réduit (était 18)
    fontWeight: '900',
  }),

  // Play button (ÉNORME)
  play: matchFont({
    fontFamily,
    fontSize: 40,  // TRÈS GROS (était 28)
    fontWeight: '900',
  }),
} as const;