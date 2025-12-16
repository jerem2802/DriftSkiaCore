// src/game/fx/AutoPlayFxLayer.tsx
import React, { useMemo } from 'react';
import {
  Atlas,
  PaintStyle,
  Skia,
  rect,
  usePictureAsTexture,
  useRSXformBuffer,
} from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';
import { useAutoPlayFxSystem } from './useAutoPlayFxSystem';
import type { AutoPlayTrailPool } from './autoPlayFxBuffer';

type Props = {
  alive: SharedValue<boolean>;
  isPaused: SharedValue<boolean>;
  autoPlayActive: SharedValue<boolean>;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  capacity?: number;
};

export const AutoPlayFxLayer: React.FC<Props> = (props) => {
  const sys = useAutoPlayFxSystem(props);

  const OFFSCREEN = -100000;

  // Sprite “laser tick” : capsule fine + glow (violet)
  // RSXform = scale uniforme, donc sprite de base est volontairement fin/long.
  const W = 34;
  const H = 8;

  const picture = useMemo(() => {
    const rec = Skia.PictureRecorder();
    const c = rec.beginRecording();

    const glow = Skia.Paint();
    glow.setAntiAlias(true);
    glow.setStyle(PaintStyle.Stroke);
    glow.setStrokeWidth(7.5);
    glow.setColor(Skia.Color('rgba(168,85,247,0.18)')); // violet glow doux

    const core = Skia.Paint();
    core.setAntiAlias(true);
    core.setStyle(PaintStyle.Stroke);
    core.setStrokeWidth(3.0);
    core.setColor(Skia.Color('rgba(196,181,253,0.92)')); // core clair

    // capsule horizontale : ligne + caps ronds implicites via strokeCap
    glow.setStrokeCap(1 as any); // round (compat versions)
    core.setStrokeCap(1 as any);

    const y = H * 0.5;
    c.drawLine(4, y, W - 4, y, glow);
    c.drawLine(4, y, W - 4, y, core);

    return rec.finishRecordingAsPicture();
  }, []);

  const texture = usePictureAsTexture(picture, { width: W, height: H });

  const sprites = useMemo(
    () => new Array(sys.capacity).fill(0).map(() => rect(0, 0, W, H)),
    [sys.capacity]
  );

  const transforms = useRSXformBuffer(sys.capacity, (val, i) => {
    'worklet';
    sys.tick.value;

    const pool: AutoPlayTrailPool = sys.trailPool.value;
    const life = pool.life[i];
    if (life <= 0) {
      val.set(0, 0, OFFSCREEN, OFFSCREEN);
      return;
    }

    const t = pool.age[i] / life;
    const fade = 1 - t;

    // on resserre en fin de vie, pour “laser tail”
    const scale = pool.scale[i] * (0.95 + 0.55 * fade);
    const a = pool.rot[i];

    const scos = scale * Math.cos(a);
    const ssin = scale * Math.sin(a);

 // Décale en arrière pour que ça ne dépasse pas devant la bille
const back = (W * 0.35) * scale + 10; // 10 ≈ rayon bille (ajuste si besoin)
const bx = pool.x[i] - Math.cos(a) * back;
const by = pool.y[i] - Math.sin(a) * back;

const px = W * 0.5;
const py = H * 0.5;
const tx = bx - scos * px + ssin * py;
const ty = by - ssin * px - scos * py;

val.set(scos, ssin, tx, ty);

  });

  if (!texture) return null;

  return (
    <Atlas
      image={texture}
      sprites={sprites}
      transforms={transforms}
      blendMode="plus"
    />
  );
};
