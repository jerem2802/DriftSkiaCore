// src/components/collection/glasscard/GlassCardMetal.tsx
import React from 'react';
import { Group, Image, useImage } from '@shopify/react-native-skia';

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const GlassCardMetal: React.FC<Props> = ({ x, y, width, height }) => {
  const img = useImage(require('../../../assets/images/glasscard.png'));
  if (!img) return null;

  return (
    <Group>
      <Image image={img} x={x} y={y} width={width} height={height} opacity={0.9} />
    </Group>
  );
};
