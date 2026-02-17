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
  priceText?: string;
};

export const MenuRemoveAdsButton: React.FC<Props> = ({
  x,
  y,
  w,
  h,
  isPremium,
  priceText = '€4.99',
}) => {
  const noAdsIcon = useImage(require('../../assets/images/no_ads.png'));

  const priceFont = useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
        fontSize: 23,
        fontWeight: '900',
      }),
    []
  );

  if (!noAdsIcon) return null;

  return (
    <>
      <Image image={noAdsIcon} x={x} y={y} width={w} height={h} fit="contain" />
      {!isPremium && (
        <Text
          x={x + w * 0.39}
          y={y + h * 1.2}
          text={priceText}
          font={priceFont}
          color="#FF6B35"
        />
      )}
    </>
  );
};
