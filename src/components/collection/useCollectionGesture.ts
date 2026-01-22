import { useSharedValue, withSpring, cancelAnimation } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { LAYOUT } from './collectionLayout';

const CARD_TOTAL_WIDTH = LAYOUT.CARD_W + LAYOUT.CARD_GAP;

type Props = {
  ballCount: number;
};

export const useCollectionGesture = ({ ballCount }: Props) => {
  const scrollX = useSharedValue(0);
  const startScrollX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragVelocity = useSharedValue(0);

  const focusedIndex = useSharedValue(0);

  const clampIndex = (idx: number) => {
    'worklet';
    if (ballCount <= 0) return 0;
    return Math.max(0, Math.min(ballCount - 1, idx));
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      cancelAnimation(scrollX);

      isDragging.value = true;
      startScrollX.value = scrollX.value;
      dragVelocity.value = 0;

      focusedIndex.value = clampIndex(Math.round(-scrollX.value / CARD_TOTAL_WIDTH));
    })
    .onUpdate((e) => {
      'worklet';
      const newX = startScrollX.value + e.translationX;
      const minX = -(ballCount - 1) * CARD_TOTAL_WIDTH;
      const maxX = 0;

      if (newX > maxX) {
        scrollX.value = maxX + (newX - maxX) * 0.3;
      } else if (newX < minX) {
        scrollX.value = minX + (newX - minX) * 0.3;
      } else {
        scrollX.value = newX;
      }

      dragVelocity.value = e.velocityX;

      focusedIndex.value = clampIndex(Math.round(-scrollX.value / CARD_TOTAL_WIDTH));
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;

      const currentIndex = -scrollX.value / CARD_TOTAL_WIDTH;
      const velocity = dragVelocity.value;

      const momentumOffset = velocity / 2000;
      let targetIndex = Math.round(currentIndex - momentumOffset);
      targetIndex = clampIndex(targetIndex);

      const targetX = -targetIndex * CARD_TOTAL_WIDTH;

      focusedIndex.value = targetIndex;

      scrollX.value = withSpring(targetX, {
        damping: 24,
        stiffness: 140,
        mass: 0.9,
        velocity: velocity / 1000,
        overshootClamping: true,
      });
    });

  return { scrollX, isDragging, dragVelocity, focusedIndex, gesture };
};
