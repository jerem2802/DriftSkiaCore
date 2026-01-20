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

  const gesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      // ✅ IMPORTANT: stoppe le spring en cours (sinon "fight" = rollback/flash)
      cancelAnimation(scrollX);

      isDragging.value = true;
      startScrollX.value = scrollX.value;
      dragVelocity.value = 0;
    })
    .onUpdate((e) => {
      'worklet';
      const newX = startScrollX.value + e.translationX;
      const minX = -(ballCount - 1) * CARD_TOTAL_WIDTH;
      const maxX = 0;

      // Rubberband aux extrémités
      if (newX > maxX) {
        scrollX.value = maxX + (newX - maxX) * 0.3;
      } else if (newX < minX) {
        scrollX.value = minX + (newX - minX) * 0.3;
      } else {
        scrollX.value = newX;
      }

      dragVelocity.value = e.velocityX;
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;

      const currentIndex = -scrollX.value / CARD_TOTAL_WIDTH;
      const velocity = dragVelocity.value;

      // Momentum léger
      const momentumOffset = velocity / 2000;
      let targetIndex = Math.round(currentIndex - momentumOffset);
      targetIndex = Math.max(0, Math.min(ballCount - 1, targetIndex));

      const targetX = -targetIndex * CARD_TOTAL_WIDTH;

      scrollX.value = withSpring(targetX, {
        damping: 24,
        stiffness: 140,
        mass: 0.9,
        velocity: velocity / 1000,
        // ✅ réduit les rebonds "retour arrière"
        overshootClamping: true,
      });
    });

  return { scrollX, isDragging, dragVelocity, gesture };
};
