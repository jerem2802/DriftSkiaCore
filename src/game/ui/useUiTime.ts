// src/game/ui/useUiTime.ts
import { useSharedValue, useFrameCallback } from 'react-native-reanimated';

/**
 * Engine-like UI clock:
 * - 1 SharedValue time
 * - 1 useFrameCallback
 * - To be shared across UI Skia screens (menus, shop, profile, collections)
 */
export function useUiTime() {
  const t = useSharedValue(0);

  useFrameCallback((fi) => {
    'worklet';
    const dt = (fi.timeSincePreviousFrame ?? 16.67) / 1000;
    t.value += dt;
  });

  return t;
}
