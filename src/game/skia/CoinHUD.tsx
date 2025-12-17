// src/game/skia/CoinHUD.tsx
// HUD coins top-left + micro-pulse à l'absorption (Skia pur)

import React from 'react';
import { Circle, Text, matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

type Props = {
  x: number;
  y: number;
  coins: SharedValue<number>;
  pulse: SharedValue<number>;
};

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });
const font = matchFont({ fontFamily, fontSize: 18, fontWeight: '800' as const });

export const CoinHUD: React.FC<Props> = ({ x, y, coins, pulse }) => {
  const textDV = useDerivedValue(() => `${Math.floor(coins.value)}`);

  const rOuter = useDerivedValue(() => 10 * (1 + 0.22 * pulse.value));
  const rInner = useDerivedValue(() => rOuter.value * 0.55);

  return (
    <>
      <Circle
        cx={x}
        cy={y}
        r={rOuter}
        style="stroke"
        strokeWidth={5}
        color="#fbbf24"
        opacity={0.35}
      />
      <Circle
        cx={x}
        cy={y}
        r={rOuter}
        style="stroke"
        strokeWidth={2}
        color="#fbbf24"
        opacity={0.95}
      />
      <Circle cx={x} cy={y} r={rInner} color="#ffffff" opacity={0.18} />

      <Text x={x + 18} y={y + 6} text={textDV} color="white" font={font} />
    </>
  );
};
