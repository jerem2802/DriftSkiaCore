// src/components/shop/WaterBallPreview.tsx
import React, { useMemo } from 'react';
import { Canvas, Circle, Paint, Shader, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, useFrameCallback } from 'react-native-reanimated';
import { WATER_BALL_SHADER } from '../../game/balls/waterBallShader';

type Props = {
  size: number;
};

export const WaterBallPreview: React.FC<Props> = ({ size }) => {
  const time = useSharedValue(0);

  useFrameCallback((fi) => {
    'worklet';
    const dt = (fi.timeSincePreviousFrame ?? 16.67) / 1000;
    time.value += dt;
  });

  const effect = useMemo(() => {
    const re = (Skia as any).RuntimeEffect;
    return re?.Make?.(WATER_BALL_SHADER) ?? null;
  }, []);

  const radius = size / 2.4;
  const center = size / 2;

  const uniforms = useDerivedValue(() => {
    'worklet';
    return {
      u_time: time.value,
      u_center: [center, center],
      u_radius: radius,
      u_velocity: [0, 0],
    };
  });

  if (!effect) return null;

  return (
    <Canvas style={{ width: size, height: size }}>
      <Circle cx={center} cy={center} r={radius * 1.2}>
        <Paint>
          <Shader source={effect} uniforms={uniforms} />
        </Paint>
      </Circle>
    </Canvas>
  );
};