import React from 'react';
import { Group, Image, RoundedRect, LinearGradient, vec, SkImage } from '@shopify/react-native-skia';

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  image: SkImage | null;
};

export const GlassCardMetal: React.FC<Props> = ({ x, y, width, height, image }) => {
  if (!image) {
    return (
      <Group>
        <RoundedRect x={x} y={y} width={width} height={height} r={22} opacity={0.35}>
          <LinearGradient
            start={vec(x, y)}
            end={vec(x + width, y + height)}
            colors={['#2a1a3a', '#1a2a44', '#2a1a3a']}
          />
        </RoundedRect>
      </Group>
    );
  }

  return (
    <Group>
      <Image image={image} x={x} y={y} width={width} height={height} opacity={0.9} />
    </Group>
  );
};
