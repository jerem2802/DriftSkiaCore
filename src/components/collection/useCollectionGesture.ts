// src/components/collection/useCollectionGesture.ts
import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withDecay, withSpring, runOnJS } from 'react-native-reanimated';
import { LAYOUT, getCardX } from './collectionLayout';

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(max, Math.max(min, value));
};

const snapToNearest = (value: number, maxScroll: number) => {
  'worklet';
  const snapPoint = LAYOUT.CARD_W + LAYOUT.CARD_GAP;
  const snappedIndex = Math.round(-value / snapPoint);
  const snappedValue = -snappedIndex * snapPoint;
  return clamp(snappedValue, -maxScroll, 0);
};

type Props = {
  ballCount: number;
  onCardChange?: (index: number) => void;
};

export const useCollectionGesture = ({ ballCount, onCardChange }: Props) => {
  const scrollX = useSharedValue(0);
  const startX = useSharedValue(0);

  const maxScroll = Math.max(0, getCardX(ballCount - 1));

  const gesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX([-10, 10])
      .failOffsetY([-10, 10])
      .onBegin(() => {
        startX.value = scrollX.value;
      })
      .onUpdate((e) => {
        const next = startX.value + e.translationX;
        scrollX.value = clamp(next, -maxScroll, 0);
      })
      .onEnd((e) => {
        const velocity = e.velocityX;

        scrollX.value = withDecay(
          {
            velocity,
            clamp: [-maxScroll, 0],
            deceleration: 0.998,
          },
          (finished) => {
            if (finished) {
              const snapped = snapToNearest(scrollX.value, maxScroll);
              scrollX.value = withSpring(snapped, {
                damping: 20,
                stiffness: 90,
              });

              if (onCardChange) {
                const index = Math.round(-snapped / (LAYOUT.CARD_W + LAYOUT.CARD_GAP));
                runOnJS(onCardChange)(index);
              }
            }
          }
        );
      });
  }, [maxScroll, scrollX, startX, onCardChange]);

  return { scrollX, gesture };
};