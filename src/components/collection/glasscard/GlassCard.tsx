// src/components/collection/glasscard/GlassCard.tsx
import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { useDerivedValue } from 'react-native-reanimated';
import { Group, SkImage } from '@shopify/react-native-skia';
import { LAYOUT } from '../collectionLayout';
import { GlassCardMetal } from './GlassCardMetal';
import { GlassCardText } from './GlassCardText';
import { BallPreviewNode } from '../../shop/BallPreviewNode';

type Ball = {
  id: string;
  name: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
};

type Props = {
  ball: Ball;
  x: number;
  y: number;
  scrollX: SharedValue<number>;
  isDragging: SharedValue<boolean>;
  dragVelocity: SharedValue<number>;
  time: SharedValue<number>;
  metalImage: SkImage | null;
};

export const GlassCard: React.FC<Props> = ({
  ball,
  x,
  y,
  scrollX,
  time,
  metalImage,
}) => {
  const cx = x + LAYOUT.CARD_W / 2;
  const cy = y + LAYOUT.CARD_H / 2.2;

  const rarityLabel = ball.rarity ? ball.rarity.toUpperCase() : 'COMMON';

  const cardTransform = useDerivedValue(() => {
    'worklet';
    const cardScreenX = x + scrollX.value + LAYOUT.CARD_W / 2;
    const screenCenterX = LAYOUT.W / 2;
    const d = (cardScreenX - screenCenterX) / LAYOUT.W;

    const scale = 1 - Math.abs(d) * 0.15;
    const rotateZ = d * 0.2;

    return [
      { translateX: cx },
      { translateY: cy },
      { rotate: rotateZ },
      { scale },
      { translateX: -cx },
      { translateY: -cy },
    ];
  });

  const cardOpacity = useDerivedValue(() => {
    'worklet';
    const cardScreenX = x + scrollX.value + LAYOUT.CARD_W / 2;
    const screenCenterX = LAYOUT.W / 2;
    const dist = Math.abs((cardScreenX - screenCenterX) / LAYOUT.W);
    return Math.max(0.55, 1 - dist * 0.5);
  });

  // ✅ Levitation légère (transform animé au bon type: DerivedValue<Transform[]>)
  const ballTransform = useDerivedValue(() => {
    'worklet';
    const lift = Math.sin(time.value * 1.6) * 2 - 5; // amplitude 2px, offset -5
    return [{ translateY: lift }];
  });

  return (
    <Group transform={cardTransform} opacity={cardOpacity}>
      <GlassCardMetal
        x={x}
        y={y}
        width={LAYOUT.CARD_W}
        height={LAYOUT.CARD_H}
        image={metalImage}
      />

      <Group transform={ballTransform}>
        <BallPreviewNode
          ballId={ball.id}
          cx={cx}
          cy={cy}
          size={LAYOUT.BALL_SIZE}
          time={time}
        />
      </Group>

      <GlassCardText
        x={x}
        y={y}
        width={LAYOUT.CARD_W}
        height={LAYOUT.CARD_H}
        rarityLabel={rarityLabel}
        ballName={ball.name}
        rarityColor="#FFD700"
      />
    </Group>
  );
};
