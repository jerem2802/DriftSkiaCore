// src/components/shop/BallPreviewSkia.tsx
import React, { useMemo } from 'react';
import { Canvas, Circle, Shader, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, useFrameCallback } from 'react-native-reanimated';
import { getBallShader } from '../../game/balls/ballShaders';

type Props = {
  ballId: string;
  size: number;
};

export const BallPreviewSkia: React.FC<Props> = ({ ballId, size }) => {
  const time = useSharedValue(0);

  useFrameCallback((fi) => {
    'worklet';
    const dt = (fi.timeSincePreviousFrame ?? 16.67) / 1000;
    time.value += dt;
  });

  const effect = useMemo(() => {
    const shaderCode = getBallShader(ballId);
    const re = (Skia as any).RuntimeEffect;
    return re?.Make?.(shaderCode) ?? null;
  }, [ballId]);

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

  if (!effect) {
    return (
      <Canvas style={{ width: size, height: size }}>
        <Circle cx={center} cy={center} r={radius} color="#22d3ee" />
      </Canvas>
    );
  }

  const renderRadius = ballId === 'ball_water' ? radius * 1.2 : radius;

  return (
    <Canvas style={{ width: size, height: size }}>
      <Circle cx={center} cy={center} r={renderRadius}>
        <Shader source={effect} uniforms={uniforms} />
      </Circle>
    </Canvas>
  );
};