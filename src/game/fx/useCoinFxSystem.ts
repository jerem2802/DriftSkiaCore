// src/game/fx/useCoinFxSystem.ts
import {
  Easing,
  SharedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createCoinFxPool } from './coinFxBuffer';
import { getCoinHudPosition } from '../../constants/layout';

type Params = {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
  flyDurationMs?: number;
};

export const useCoinFxSystem = ({
  alive,
  isPaused,
  flyDurationMs = 950,
}: Params) => {
  // pool prêt pour futures anims (burst/trails/magnet/etc.)
  const pool = useSharedValue(createCoinFxPool());

  // orb "flying-to-HUD"
  const flyVisible = useSharedValue(0); // 0|1
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);

  // Trigger pickup (écrit depuis useCoinOrbSystem, 100% worklet-safe)
  const pickupSeq = useSharedValue(0);
  const pickupX = useSharedValue(0);
  const pickupY = useSharedValue(0);

  const prevSeq = useSharedValue(0);

  useFrameCallback(() => {
    'worklet';

    if (!alive.value) {
      flyVisible.value = 0;
      prevSeq.value = pickupSeq.value;
      return;
    }
    if (isPaused.value) return;

    const seq = pickupSeq.value;
    if (seq === prevSeq.value) return;
    prevSeq.value = seq;

    // Start fly
    flyVisible.value = 1;
    flyX.value = pickupX.value;
    flyY.value = pickupY.value;

    const target = getCoinHudPosition();

    flyX.value = withTiming(
      target.x,
      { duration: flyDurationMs, easing: Easing.linear },
      (finished) => {
        if (finished) flyVisible.value = 0;
      }
    );

    flyY.value = withTiming(target.y, {
      duration: flyDurationMs,
      easing: Easing.linear,
    });

    // (Plus tard) ici : spawn burst / trails via pool
    void pool.value;
  });

  return {
    // outputs render
    flyVisible,
    flyX,
    flyY,

    // inputs trigger (écrits par le coin orb system)
    pickupSeq,
    pickupX,
    pickupY,
  };
};