// src/components/menu/MenuRemoveAdsButton.tsx
import React, { useMemo } from 'react';
import { Image, useImage, Text, matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

type Props = {
  x: number;
  y: number;
  w: number;
  h: number;
  isPremium: boolean;
};

export const MenuRemoveAdsButton: React.FC<Props> = ({ x, y, w, h, isPremium }) => {
  const noAdsIcon = useImage(require('../../assets/images/no_ads.png'));

  const priceFont = useMemo(() => matchFont({
    fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
    fontSize: 20,
    fontWeight: '900',
  }), []);

  if (!noAdsIcon) return null;

  return (
    <>
      {/* Icône PNG */}
      <Image
        image={noAdsIcon}
        x={x}
        y={y}
        width={w}
        height={h}
        fit="contain"
      />

      {/* PRIX EN DESSOUS */}
      {!isPremium && (
        <Text
          x={x}
          y={y + h + 25}
          text="€2.99"
          font={priceFont}
          color="#FF6B35"
        />
      )}
    </>
  );
};