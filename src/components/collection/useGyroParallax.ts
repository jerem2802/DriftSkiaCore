// src/components/collection/useGyroParallax.ts
import { useSharedValue, useAnimatedSensor, SensorType, useDerivedValue } from 'react-native-reanimated';
import { LAYOUT } from './collectionLayout';

const clamp = (v: number, min: number, max: number) => {
  'worklet';
  return Math.max(min, Math.min(max, v));
};

const deadzone = (v: number, d: number) => {
  'worklet';
  return Math.abs(v) < d ? 0 : v;
};

export const useGyroParallax = () => {
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);

  // ✅ accel = gravité -> orientation stable
  const sensor = useAnimatedSensor(SensorType.ACCELEROMETER, { interval: 16 });

  useDerivedValue(() => {
    'worklet';

    const ax = sensor.sensor.value.x ?? 0; // [-~9.8..9.8]
    const ay = sensor.sensor.value.y ?? 0;

    // Normalise grossièrement vers [-1..1]
    const nx = clamp(ax / 9.81, -1, 1);
    const ny = clamp(ay / 9.81, -1, 1);

    // Mapping (selon ton orientation écran ça peut être inversé)
    // Sensation: tiltX = gauche/droite, tiltY = haut/bas
    const targetX0 = -nx * LAYOUT.PARALLAX_INTENSITY;
    const targetY0 = ny * LAYOUT.PARALLAX_INTENSITY;

    const DZ = 0.015;  // anti micro bruit
    const MAX = 0.35;  // limite finale
    const targetX = clamp(deadzone(targetX0, DZ), -MAX, MAX);
    const targetY = clamp(deadzone(targetY0, DZ), -MAX, MAX);

    // Low-pass (smooth sans tremblement)
    const ALPHA = 0.18; // ↑ plus réactif, ↓ plus smooth
    tiltX.value = tiltX.value + (targetX - tiltX.value) * ALPHA;
    tiltY.value = tiltY.value + (targetY - tiltY.value) * ALPHA;
  }, []);

  return { tiltX, tiltY };
};
