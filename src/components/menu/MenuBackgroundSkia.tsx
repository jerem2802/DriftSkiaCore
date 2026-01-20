// src/components/menu/MenuBackgroundSkia.tsx
import React from 'react';
import { Image, RoundedRect, useImage } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

type Props = {
  W: number;
  H: number;
  opacity: SharedValue<number>;
};

export const MenuBackgroundSkia: React.FC<Props> = ({ W, H, opacity }) => {
  const bg = useImage(require('../../assets/images/menu_driftring.png'));

  return (
    <>
      <RoundedRect x={0} y={0} width={W} height={H} r={0} color="#000" />
      {bg && <Image image={bg} x={0} y={0} width={W} height={H} fit="cover" opacity={opacity} />}
      <RoundedRect x={0} y={0} width={W} height={H} r={0} color="rgba(2, 6, 23, 0.58)" />
    </>
  );
};
