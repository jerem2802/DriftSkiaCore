// src/game/effects/PlasmaEffects.tsx
import React from 'react';
import { type SharedValue } from 'react-native-reanimated';

type Props = {
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  orbs: Array<{
    x: any;
    y: any;
    visible: any;
  }>;
};

export const PlasmaEffects: React.FC<Props> = () => {
  return null;
};