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
    fontSize: 18,
    fontWeight: '800',
  }),
} as const;