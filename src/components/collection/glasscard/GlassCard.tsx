// src/components/collection/glasscard/GlassCard.tsx
import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { useDerivedValue } from 'react-native-reanimated';
import { Group } from '@shopify/react-native-skia';
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
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
  time: SharedValue<number>;
};

export const GlassCard: React.FC<Props> = ({ ball, x, y, tiltX, tiltY, time }) => {
  const cx = x + LAYOUT.CARD_W / 2;
  const cy = y + LAYOUT.CARD_H / 2.2;

  const rarityLabel = ball.rarity ? ball.rarity.toUpperCase() : 'COMMON';

  const cardTransform = useDerivedValue(() => {
    'worklet';
    const sx = tiltX.value;
    const sy = tiltY.value;

    return [
      { translateX: cx },
      { translateY: cy },
      { skewX: sx * 0.25 },
      { skewY: -sy * 0.2 },
      { rotate: sx * 0.10 },
      { scaleY: 1 - Math.min(Math.abs(sy) * 0.08, 0.06) },
      { translateX: -cx },
      { translateY: -cy },
    ];
  }, [cx, cy, tiltX, tiltY]);

  return (
    <Group transform={cardTransform}>
      {/* ✅ PNG CARD */}
      <GlassCardMetal x={x} y={y} width={LAYOUT.CARD_W} height={LAYOUT.CARD_H} />

      {/* ✅ BALL */}
      <BallPreviewNode ballId={ball.id} cx={cx} cy={cy} size={LAYOUT.BALL_SIZE} time={time} />

      {/* ✅ TEXT */}
      <GlassCardText
        x={x}
        y={y}
        width={LAYOUT.CARD_W}
        height={LAYOUT.CARD_H}
        rarityLabel={rarityLabel}
        ballName={ball.name}
        rarityColor="#ffffff"
      />
    </Group>
  );
};
