// src/game/fx/ShieldFxLayer.tsx
import React, { useMemo } from 'react';
import {
  Atlas,
  Circle,
  Group,
  Paint,
  PaintStyle,
  Shader,
  Skia,
  rect,
  usePictureAsTexture,
  useRSXformBuffer,
} from '@shopify/react-native-skia';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';
import { useShieldFxSystem } from './useShieldFxSystem';
import type { ShieldBoltPool } from './shieldFxBuffer';

type Props = {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
  shieldArmed: SharedValue<boolean>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  capacity?: number;
};

const SKSL = `
uniform float2 u_center;
uniform float  u_time;
uniform float  u_alpha;

float hash21(float2 p){
  float n = sin(dot(p, float2(127.1,311.7)));
  return fract(n*43758.5453123);
}
float noise(float2 p){
  float2 i = floor(p);
  float2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + float2(1.0,0.0));
  float c = hash21(i + float2(0.0,1.0));
  float d = hash21(i + float2(1.0,1.0));
  float2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(float2 p){
  float v = 0.0;
  v += 0.65 * noise(p);
  p *= 2.05;
  v += 0.35 * noise(p + 17.3);
  return v;
}

half4 main(float2 p){
  float2 v = p - u_center;
  float d = length(v);

  float ringOuter = 1.0 - smoothstep(18.0, 34.0, d);
  float ringInner = smoothstep(10.0, 16.0, d);
  float ring = ringOuter * ringInner;

  float ang = atan(v.y, v.x);

  float rays = abs(sin(ang * 20.0 + u_time * 30.0));
  rays = smoothstep(0.55, 0.92, rays);

  float2 q = float2(ang * 3.0, d * 0.22) + float2(u_time * 2.2, -u_time * 3.4);
  float n = fbm(q * 3.5);
  float gate = smoothstep(0.62, 0.90, n);

  float fil = ring * rays * gate;
  float inner = (1.0 - smoothstep(0.0, 11.0, d)) * 0.10;

  float a = u_alpha * (1.00 * fil + inner);

  float hot = smoothstep(0.78, 1.0, rays * gate);
  half3 col = mix(half3(0.18, 0.48, 0.98), half3(0.85, 0.95, 1.0), half(hot * 0.65));

  return half4(col * a, a);
}
`;

export const ShieldFxLayer: React.FC<Props> = (props) => {
  const sys = useShieldFxSystem(props);

  // ---- Aura shader ----
  const effect = useMemo(() => {
    // compat : évite crash si RuntimeEffect absent
    const re = (Skia as any).RuntimeEffect;
    return re?.Make?.(SKSL) ?? null;
  }, []);

  const uniforms = useDerivedValue(() => {
    'worklet';
    return {
      u_center: [props.ballX.value, props.ballY.value],
      u_time: sys.t.value,
      u_alpha: 0.95 * sys.a.value,
    };
  });

  const auraOpacity = useDerivedValue(() => sys.a.value);

  // ---- Bolts atlas ----
  const OFFSCREEN = -100000;
  const W = 44;
  const H = 22;

  const picture = useMemo(() => {
    const rec = Skia.PictureRecorder();
    const c = rec.beginRecording();

    const glow = Skia.Paint();
    glow.setAntiAlias(true);
    glow.setStrokeWidth(3);
    glow.setStyle(PaintStyle.Stroke);
    glow.setColor(Skia.Color('rgba(59,130,246,0.16)'));

    const core = Skia.Paint();
    core.setAntiAlias(true);
    core.setStrokeWidth(1.5);
    core.setStyle(PaintStyle.Stroke);
    core.setColor(Skia.Color('rgba(96,165,250,0.95)'));

    const p = Skia.Path.Make();
    const padX = 5;
    const midY = H * 0.5;

    p.moveTo(padX, midY);

    const steps = 4;
    for (let i = 1; i <= steps; i++) {
      const tt = i / steps;
      const x = padX + tt * (W - padX * 2);
      const amp = 3.5 + i * 0.35;
      const y = midY + (i % 2 === 0 ? -1 : 1) * amp;
      p.lineTo(x, y);
    }

    c.drawPath(p, glow);
    c.drawPath(p, core);

    return rec.finishRecordingAsPicture();
  }, []);

  const texture = usePictureAsTexture(picture, { width: W, height: H });

  const sprites = useMemo(
    () => new Array(sys.capacity).fill(0).map(() => rect(0, 0, W, H)),
    [sys.capacity]
  );

  const transforms = useRSXformBuffer(sys.capacity, (val, i) => {
    'worklet';
    sys.tick.value; // dependency

    const pool: ShieldBoltPool = sys.boltPool.value;
    const life = pool.life[i];
    if (life <= 0) {
      val.set(0, 0, OFFSCREEN, OFFSCREEN);
      return;
    }

    const t = pool.age[i] / life;
    const fade = 1 - t;

    const scale = pool.scale[i] * (0.75 + 0.35 * fade);
    const a = pool.rot[i];

    const scos = scale * Math.cos(a);
    const ssin = scale * Math.sin(a);

    const px = W * 0.5;
    const py = H * 0.5;
    const tx = pool.x[i] - scos * px + ssin * py;
    const ty = pool.y[i] - ssin * px - scos * py;

    val.set(scos, ssin, tx, ty);
  });

  if (!texture) return null;

  return (
    <>
      {/* Aura (shader) */}
      {effect ? (
        <Group blendMode="plus">
          <Circle cx={props.ballX} cy={props.ballY} r={34}>
            <Paint opacity={auraOpacity}>
              {/* typings varient selon versions */}
              {/* @ts-ignore */}
              <Shader source={effect} uniforms={uniforms} />
            </Paint>
          </Circle>
        </Group>
      ) : null}

      {/* Bolts (atlas) */}
      <Atlas
        image={texture}
        sprites={sprites}
        transforms={transforms}
        blendMode="plus"
      />
    </>
  );
};
