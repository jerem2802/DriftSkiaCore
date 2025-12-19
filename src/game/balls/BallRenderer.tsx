// src/game/balls/BallRenderer.tsx

import React from 'react';
import { Circle } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';
import { WaterBallLayer } from './WaterBallLayer';
import { SHOP_BALLS } from '../../components/shop/shopCatalog';

type Props = {
  selectedBallId: string;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
};

export const BallRenderer: React.FC<Props> = ({
  selectedBallId,
  ballX,
  ballY,
  alive,
  isPaused,
}) => {
  // Switch propre selon l'ID
  switch (selectedBallId) {
    case 'ball_water':
      return (
        <WaterBallLayer
          alive={alive}
          isPaused={isPaused}
          ballX={ballX}
          ballY={ballY}
          radius={12}
          capacity={32}
        />
      );

    // Ajouter les autres billes custom ici
    // case 'ball_fire':
    //   return <FireBallLayer ... />;

    default:
      // Fallback : bille classique (Circle simple avec couleur du shop)
      const ballData = SHOP_BALLS.find((b) => b.id === selectedBallId);
      const ballColor = ballData?.accent ?? '#22d3ee';
      
      return <Circle cx={ballX} cy={ballY} r={10} color={ballColor} />;
  }
};