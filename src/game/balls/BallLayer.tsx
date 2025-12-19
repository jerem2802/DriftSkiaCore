// src/game/balls/BallLayer.tsx
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
import { SharedValue, useDerivedValue } from 'react-native-reanimated';
import { getBallShader } from './ballShaders';
import { getBallTrailConfig } from './ballTrailConfigs';
import { useBallSystem } from './useBallSystem';
import type { ParticlePool } from './useBallSystem';
import type { ParticleLayerConfig } from './ballTrailConfigs';

type Props = {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  ballId: string;
  radius?: number;
  capacity?: number;
};

const OFFSCREEN = -100000;

const createParticlePicture = (layer: ParticleLayerConfig) => {
  const rec = Skia.PictureRecorder();
  const c = rec.beginRecording();
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(layer.color));
  const path = Skia.Path.Make();
  
  if (layer.type === 'lightning' || layer.type === 'sparks') {
    path.moveTo(layer.width * 0.5, 0);
    path.lineTo(layer.width, layer.height);
    path.lineTo(0, layer.height);
    path.close();
  } else if (layer.type === 'stars') {
    const centerX = layer.width * 0.5;
    const centerY = layer.height * 0.5;
    const r = Math.min(layer.width, layer.height) * 0.5;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    path.close();
  } else if (layer.type === 'petals') {
    const centerY = layer.height * 0.5;
    path.addOval(rect(0, centerY * 0.5, layer.width, centerY));
  } else {
    path.addOval(rect(0, 0, layer.width, layer.height));
  }
  
  c.drawPath(path, paint);
  return rec.finishRecordingAsPicture();
};

export const BallLayer: React.FC<Props> = ({
  alive,
  isPaused,
  ballX,
  ballY,
  ballId,
  radius = 10,
  capacity = 48,
}) => {
  const ballSys = useBallSystem({ alive, isPaused, ballX, ballY, ballId, capacity });
  const config = useMemo(() => getBallTrailConfig(ballId), [ballId]);
  const effect = useMemo(() => {
    const shaderCode = getBallShader(ballId);
    const re = (Skia as any).RuntimeEffect;
    return re?.Make?.(shaderCode) ?? null;
  }, [ballId]);

  const uniforms = useDerivedValue(() => {
    'worklet';
    return {
      u_time: ballSys.time.value,
      u_center: [ballX.value, ballY.value],
      u_radius: radius,
      u_velocity: [ballSys.velocityX.value, ballSys.velocityY.value],
    };
  });

  // PRIMARY LAYER
  const primaryPicture = useMemo(() => createParticlePicture(config.primary), [config]);

  const primaryTexture = usePictureAsTexture(primaryPicture, {
    width: config.primary.width,
    height: config.primary.height,
  });

  const primarySprites = useMemo(
    () => new Array(capacity).fill(0).map(() => rect(0, 0, config.primary.width, config.primary.height)),
    [capacity, config]
  );

  const primaryTransforms = useRSXformBuffer(capacity, (val, i) => {
    'worklet';
    ballSys.tick.value;
    const pool: ParticlePool = ballSys.particlePool.value;
    const life = pool.life[i];
    if (life <= 0 || pool.isSecondary[i]) {
      val.set(0, 0, OFFSCREEN, OFFSCREEN);
      return;
    }
    const t = pool.age[i] / life;
    const layer = config.primary;
    let fade = 1 - t;
    if (layer.fadeMode === 'smooth') {
      fade = 1 - t * t;
    } else if (layer.fadeMode === 'sudden') {
      fade = t < 0.8 ? 1.0 : (1.0 - (t - 0.8) / 0.2);
    }
    const scale = pool.scale[i] * fade;
    const rotation = pool.rotation[i];
    const scos = scale * Math.cos(rotation);
    const ssin = scale * Math.sin(rotation);
    const px = layer.width * 0.5;
    const py = layer.height * 0.5;
    const tx = pool.x[i] - scos * px + ssin * py;
    const ty = pool.y[i] - ssin * px - scos * py;
    val.set(scos, ssin, tx, ty);
  });

  // SECONDARY LAYER
  const secondaryPicture = useMemo(() => 
    config.secondary ? createParticlePicture(config.secondary) : null,
    [config]
  );

  const secondaryTexture = usePictureAsTexture(
    secondaryPicture ?? primaryPicture,
    {
      width: config.secondary?.width ?? config.primary.width,
      height: config.secondary?.height ?? config.primary.height,
    }
  );

  const secondarySprites = useMemo(
    () => new Array(capacity).fill(0).map(() => 
      rect(0, 0, config.secondary?.width ?? config.primary.width, config.secondary?.height ?? config.primary.height)
    ),
    [capacity, config]
  );

  const secondaryTransforms = useRSXformBuffer(capacity, (val, i) => {
    'worklet';
    ballSys.tick.value;
    const pool: ParticlePool = ballSys.particlePool.value;
    const life = pool.life[i];
    if (life <= 0 || !pool.isSecondary[i] || !config.secondary) {
      val.set(0, 0, OFFSCREEN, OFFSCREEN);
      return;
    }
    const t = pool.age[i] / life;
    const layer = config.secondary;
    let fade = 1 - t;
    if (layer.fadeMode === 'smooth') {
      fade = 1 - t * t;
    } else if (layer.fadeMode === 'sudden') {
      fade = t < 0.8 ? 1.0 : (1.0 - (t - 0.8) / 0.2);
    }
    const scale = pool.scale[i] * fade;
    const rotation = pool.rotation[i];
    const scos = scale * Math.cos(rotation);
    const ssin = scale * Math.sin(rotation);
    const px = layer.width * 0.5;
    const py = layer.height * 0.5;
    const tx = pool.x[i] - scos * px + ssin * py;
    const ty = pool.y[i] - ssin * px - scos * py;
    val.set(scos, ssin, tx, ty);
  });

  if (!effect || !primaryTexture) return null;

  const renderRadius = ballId === 'ball_water' ? radius * 1.2 : radius;

  return (
    <>
      {/* SECONDARY LAYER (rendered first = behind) */}
      {config.secondary && secondaryTexture && (
        <Atlas
          image={secondaryTexture}
          sprites={secondarySprites}
          transforms={secondaryTransforms}
          blendMode={config.blendMode as any}
          opacity={config.secondary.opacity}
        />
      )}
      {/* PRIMARY LAYER (rendered second = on top) */}
      <Atlas
        image={primaryTexture}
        sprites={primarySprites}
        transforms={primaryTransforms}
        blendMode={config.blendMode as any}
        opacity={config.primary.opacity}
      />
      {/* BALL SHADER */}
      <Circle cx={ballX} cy={ballY} r={renderRadius}>
        <Shader source={effect} uniforms={uniforms} />
      </Circle>
    </>
  );
};