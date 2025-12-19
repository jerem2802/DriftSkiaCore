// src/game/balls/WaterBallLayer.tsx
import React, { useMemo } from 'react';
import {
  Circle,
  Shader,
  Skia,
  Atlas,
  rect,
  usePictureAsTexture,
  useRSXformBuffer,
} from '@shopify/react-native-skia';
import { SharedValue, useDerivedValue, useSharedValue, useFrameCallback } from 'react-native-reanimated';
import { WATER_BALL_SHADER } from './waterBallShader';
import { useWaterTrailSystem } from './useWaterTrailSystem';
import type { WaterTrailPool } from './waterTrailBuffer';

type Props = {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  radius?: number;
  capacity?: number;
};

const OFFSCREEN = -100000;
const DROPLET_W = 8;
const DROPLET_H = 12;

export const WaterBallLayer: React.FC<Props> = ({
  alive,
  isPaused,
  ballX,
  ballY,
  radius = 10,
  capacity = 32,
}) => {
  const trailSys = useWaterTrailSystem({ alive, isPaused, ballX, ballY, capacity });

  const effect = useMemo(() => {
    const re = (Skia as any).RuntimeEffect;
    const result = re?.Make?.(WATER_BALL_SHADER) ?? null;
    console.log('🌊 Water shader compiled:', result !== null);
    return result;
  }, []);

  const time = useSharedValue(0);
  const prevBallX = useSharedValue(ballX.value);
  const prevBallY = useSharedValue(ballY.value);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  useFrameCallback((fi) => {
    'worklet';
    const dt = (fi.timeSincePreviousFrame ?? 16.67) / 1000;
    time.value += dt;
    const dx = ballX.value - prevBallX.value;
    const dy = ballY.value - prevBallY.value;
    velocityX.value = dx / dt;
    velocityY.value = dy / dt;
    prevBallX.value = ballX.value;
    prevBallY.value = ballY.value;
  });

  const uniforms = useDerivedValue(() => {
    'worklet';
    return {
      u_time: time.value,
      u_center: [ballX.value, ballY.value],
      u_radius: radius,
      u_velocity: [velocityX.value, velocityY.value],
    };
  });

  const dropletPicture = useMemo(() => {
    const rec = Skia.PictureRecorder();
    const c = rec.beginRecording();
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setColor(Skia.Color('rgba(100, 220, 255, 0.9)'));
    const path = Skia.Path.Make();
    path.addOval(rect(0, 0, DROPLET_W, DROPLET_H));
    c.drawPath(path, paint);
    return rec.finishRecordingAsPicture();
  }, []);

  const dropletTexture = usePictureAsTexture(dropletPicture, {
    width: DROPLET_W,
    height: DROPLET_H,
  });

  const sprites = useMemo(
    () => new Array(capacity).fill(0).map(() => rect(0, 0, DROPLET_W, DROPLET_H)),
    [capacity]
  );

  const transforms = useRSXformBuffer(capacity, (val, i) => {
    'worklet';
    trailSys.tick.value;
    const pool: WaterTrailPool = trailSys.trailPool.value;
    const life = pool.life[i];
    if (life <= 0) {
      val.set(0, 0, OFFSCREEN, OFFSCREEN);
      return;
    }
    const t = pool.age[i] / life;
    const fade = 1 - t;
    const scale = pool.scale[i] * fade;
    const angle = Math.atan2(pool.vy[i], pool.vx[i]) + Math.PI / 2;
    const scos = scale * Math.cos(angle);
    const ssin = scale * Math.sin(angle);
    const px = DROPLET_W * 0.5;
    const py = DROPLET_H * 0.5;
    const tx = pool.x[i] - scos * px + ssin * py;
    const ty = pool.y[i] - ssin * px - scos * py;
    val.set(scos, ssin, tx, ty);
  });

  if (!effect || !dropletTexture) return null;

  return (
    <>
      <Atlas
        image={dropletTexture}
        sprites={sprites}
        transforms={transforms}
        blendMode="plus"
        opacity={0.85}
      />
      <Circle cx={ballX} cy={ballY} r={radius * 0.9}>
        <Shader source={effect} uniforms={uniforms} />
      </Circle>
    </>
  );
};