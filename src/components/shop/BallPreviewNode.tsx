// src/components/shop/BallPreviewNode.tsx
import React, { useMemo } from 'react';
import { Circle, Shader, Skia } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';
import { useDerivedValue } from 'react-native-reanimated';
import { getBallShader } from '../../game/balls/ballShaders';

// ✅ GLOBAL cache (shared across all instances)
const EFFECT_CACHE = new Map<string, any | null>();

function getRuntimeEffect(ballId: string) {
  if (EFFECT_CACHE.has(ballId)) return EFFECT_CACHE.get(ballId) ?? null;

  try {
    const shaderCode = getBallShader(ballId);
    const re = (Skia as any).RuntimeEffect;
    const effect = re?.Make?.(shaderCode) ?? null;
    EFFECT_CACHE.set(ballId, effect);
    return effect;
  } catch (e) {
    EFFECT_CACHE.set(ballId, null);
    return null;
  }
}

type Props = {
  ballId: string;
  cx: number;
  cy: number;
  size: number;
  time: SharedValue<number>;
  velocity?: readonly [number, number];
};

export const BallPreviewNode: React.FC<Props> = ({
  ballId,
  cx,
  cy,
  size,
  time,
  velocity = [0, 0],
}) => {
  // ✅ no per-instance compile; uses global cache
  const effect = useMemo(() => getRuntimeEffect(ballId), [ballId]);

  const radius = size / 2.4;

  const uniforms = useDerivedValue(() => {
    'worklet';
    return {
      u_time: time.value ?? 0,
      u_center: [cx, cy],
      u_radius: radius,
      u_velocity: [velocity[0], velocity[1]],
    };
  }, [cx, cy, radius, velocity[0], velocity[1]]);

  const renderRadius = ballId === 'ball_water' ? radius * 1.2 : radius;

  if (!effect) {
    return <Circle cx={cx} cy={cy} r={renderRadius} color="#22d3ee" />;
  }

  return (
    <Circle cx={cx} cy={cy} r={renderRadius}>
      <Shader source={effect} uniforms={uniforms} />
    </Circle>
  );
};
