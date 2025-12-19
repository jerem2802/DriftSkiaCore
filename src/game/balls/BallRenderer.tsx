// src/game/balls/BallRenderer.tsx
import React from 'react';
import { SharedValue } from 'react-native-reanimated';
import { BallLayer } from './BallLayer';

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
  return (
    <BallLayer
      alive={alive}
      isPaused={isPaused}
      ballX={ballX}
      ballY={ballY}
      ballId={selectedBallId}
      radius={10}
      capacity={32}
    />
  );
};