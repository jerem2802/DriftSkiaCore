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

const centerX = layer.width * 0.5;
const centerY = layer.height * 0.5;
const w = layer.width;
const h = layer.height;

switch (layer.type) {
case 'lightning':
case 'sparks':
path.moveTo(centerX, 0);
path.lineTo(w, h);
path.lineTo(0, h);
path.close();
break;

case 'stars':
const r = Math.min(w, h) * 0.5;
for (let i = 0; i < 5; i++) {
const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
const x = centerX + Math.cos(angle) * r;
const y = centerY + Math.sin(angle) * r;
if (i === 0) path.moveTo(x, y);
else path.lineTo(x, y);
}
path.close();
break;

case 'petals':
path.addOval(rect(0, centerY * 0.5, w, centerY));
break;

case 'hexagon':
const hexR = Math.min(w, h) * 0.5;
for (let i = 0; i < 6; i++) {
const angle = (i * Math.PI) / 3;
const x = centerX + Math.cos(angle) * hexR;
const y = centerY + Math.sin(angle) * hexR;
if (i === 0) path.moveTo(x, y);
else path.lineTo(x, y);
}
path.close();
break;

case 'diamond':
path.moveTo(centerX, 0);
path.lineTo(w, centerY);
path.lineTo(centerX, h);
path.lineTo(0, centerY);
path.close();
break;

case 'cross':
const crossW = w * 0.25;
const crossH = h * 0.25;
path.moveTo(centerX - crossW, 0);
path.lineTo(centerX + crossW, 0);
path.lineTo(centerX + crossW, centerY - crossH);
path.lineTo(w, centerY - crossH);
path.lineTo(w, centerY + crossH);
path.lineTo(centerX + crossW, centerY + crossH);
path.lineTo(centerX + crossW, h);
path.lineTo(centerX - crossW, h);
path.lineTo(centerX - crossW, centerY + crossH);
path.lineTo(0, centerY + crossH);
path.lineTo(0, centerY - crossH);
path.lineTo(centerX - crossW, centerY - crossH);
path.close();
break;

case 'ring':
const outerR = Math.min(w, h) * 0.5;
const innerR = outerR * 0.6;
const steps = 32;
for (let i = 0; i <= steps; i++) {
const angle = (i / steps) * Math.PI * 2;
const x = centerX + Math.cos(angle) * outerR;
const y = centerY + Math.sin(angle) * outerR;
if (i === 0) path.moveTo(x, y);
else path.lineTo(x, y);
}
for (let i = steps; i >= 0; i--) {
const angle = (i / steps) * Math.PI * 2;
const x = centerX + Math.cos(angle) * innerR;
const y = centerY + Math.sin(angle) * innerR;
path.lineTo(x, y);
}
path.close();
break;

case 'triangle':
path.moveTo(centerX, 0);
path.lineTo(w, h);
path.lineTo(0, h);
path.close();
break;

case 'heart':
const heartW = w * 0.5;
const heartH = h * 0.3;
path.moveTo(centerX, h);
path.cubicTo(centerX - heartW * 0.5, h - heartH, centerX - heartW, h - heartH * 1.5, centerX - heartW, h - heartH * 2);
path.cubicTo(centerX - heartW, h - heartH * 2.8, centerX - heartW * 0.3, h - heartH * 3, centerX, h - heartH * 2.5);
path.cubicTo(centerX + heartW * 0.3, h - heartH * 3, centerX + heartW, h - heartH * 2.8, centerX + heartW, h - heartH * 2);
path.cubicTo(centerX + heartW, h - heartH * 1.5, centerX + heartW * 0.5, h - heartH, centerX, h);
path.close();
break;

case 'square':
const squareSize = Math.min(w, h) * 0.8;
const squareOffset = (Math.min(w, h) - squareSize) * 0.5;
path.addRect(rect(squareOffset, squareOffset, squareSize, squareSize));
break;

case 'plus':
const plusW = w * 0.3;
const plusH = h * 0.3;
path.moveTo(centerX - plusW, centerY - plusH);
path.lineTo(centerX + plusW, centerY - plusH);
path.lineTo(centerX + plusW, centerY - plusH * 0.3);
path.lineTo(centerX + plusW * 0.3, centerY - plusH * 0.3);
path.lineTo(centerX + plusW * 0.3, centerY + plusH * 0.3);
path.lineTo(centerX + plusW, centerY + plusH * 0.3);
path.lineTo(centerX + plusW, centerY + plusH);
path.lineTo(centerX - plusW, centerY + plusH);
path.lineTo(centerX - plusW, centerY + plusH * 0.3);
path.lineTo(centerX - plusW * 0.3, centerY + plusH * 0.3);
path.lineTo(centerX - plusW * 0.3, centerY - plusH * 0.3);
path.lineTo(centerX - plusW, centerY - plusH * 0.3);
path.close();
break;

case 'crescent':
const crescentR = Math.min(w, h) * 0.5;
const crescentOffset = crescentR * 0.3;
const steps2 = 32;
for (let i = 0; i <= steps2; i++) {
const angle = (i / steps2) * Math.PI * 2;
const x = centerX + Math.cos(angle) * crescentR;
const y = centerY + Math.sin(angle) * crescentR;
if (i === 0) path.moveTo(x, y);
else path.lineTo(x, y);
}
for (let i = steps2; i >= 0; i--) {
const angle = (i / steps2) * Math.PI * 2;
const x = centerX + crescentOffset + Math.cos(angle) * crescentR * 0.8;
const y = centerY + Math.sin(angle) * crescentR * 0.8;
path.lineTo(x, y);
}
path.close();
break;

case 'gear':
const gearR = Math.min(w, h) * 0.5;
const gearTeeth = 8;
const gearInnerR = gearR * 0.7;
const gearToothH = gearR * 0.2;
for (let i = 0; i < gearTeeth * 2; i++) {
const angle = (i * Math.PI) / gearTeeth;
const r = i % 2 === 0 ? gearR + gearToothH : gearInnerR;
const x = centerX + Math.cos(angle) * r;
const y = centerY + Math.sin(angle) * r;
if (i === 0) path.moveTo(x, y);
else path.lineTo(x, y);
}
path.close();
break;

case 'spiral':
const spiralR = Math.min(w, h) * 0.5;
const spiralTurns = 3;
const spiralPoints = 50;
for (let i = 0; i <= spiralPoints; i++) {
const t = i / spiralPoints;
const angle = t * spiralTurns * 2 * Math.PI;
const r = spiralR * t;
const x = centerX + Math.cos(angle) * r;
const y = centerY + Math.sin(angle) * r;
if (i === 0) path.moveTo(x, y);
else path.lineTo(x, y);
}
break;

case 'leaf':
path.moveTo(centerX, 0);
path.quadTo(w * 0.8, centerY * 0.3, w * 0.7, centerY);
path.quadTo(w * 0.6, h * 0.8, centerX, h);
path.quadTo(w * 0.4, h * 0.8, w * 0.3, centerY);
path.quadTo(w * 0.2, centerY * 0.3, centerX, 0);
path.close();
break;

case 'arrow':
const arrowW = w * 0.3;
path.moveTo(centerX, 0);
path.lineTo(w, centerY);
path.lineTo(centerX + arrowW, centerY);
path.lineTo(centerX + arrowW, h);
path.lineTo(centerX - arrowW, h);
path.lineTo(centerX - arrowW, centerY);
path.lineTo(0, centerY);
path.close();
break;

default:
path.addOval(rect(0, 0, w, h));
break;
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
{config.secondary && secondaryTexture && (
<Atlas
image={secondaryTexture}
sprites={secondarySprites}
transforms={secondaryTransforms}
blendMode={config.blendMode as any}
opacity={config.secondary.opacity}
/>
)}
<Atlas
image={primaryTexture}
sprites={primarySprites}
transforms={primaryTransforms}
blendMode={config.blendMode as any}
opacity={config.primary.opacity}
/>
<Circle cx={ballX} cy={ballY} r={renderRadius}>
<Shader source={effect} uniforms={uniforms} />
</Circle>
</>
);
};