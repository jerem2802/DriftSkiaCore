// src/game/skia/ShieldOrbIcon.tsx
import React, { useMemo } from 'react';
import { Circle, Group, Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

type Value<T> = { value: T }; // ✅ accepte SharedValue<T> et DerivedValue<T>

type Props = {
  cx: Value<number>;
  cy: Value<number>;
  opacity: Value<number>; // ✅ ton shieldOrbVisible (0|1) passe ici sans erreur
  size?: number;
};

export const ShieldOrbIcon: React.FC<Props> = ({ cx, cy, opacity, size = 20 }) => {
  // Shield path (base 24x24)
  const shieldPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(12, 2);
    p.lineTo(20, 6);
    p.lineTo(20, 13);
    p.cubicTo(20, 17.5, 16.8, 20.7, 12, 22);
    p.cubicTo(7.2, 20.7, 4, 17.5, 4, 13);
    p.lineTo(4, 6);
    p.close();
    return p;
  }, []);

  // "pièce" qui tourne : flip (scaleX) + léger wobble
  const t = useSharedValue(0);

  useFrameCallback((fi) => {
    'worklet';
    // si invisible -> on évite de tourner pour rien
    if (opacity.value <= 0.001) return;

    const dtMs = fi.timeSincePreviousFrame ?? 16.67;
    t.value += dtMs / 1000;
  });

  const transform = useDerivedValue(() => {
    'worklet';
    const a = t.value * 3.2;
    const flip = Math.abs(Math.cos(a));         // 0..1
    const sx = 0.18 + 0.82 * flip;              // évite disparition totale
    const wobble = Math.sin(a * 0.5) * 0.08;    // petit tilt

    return [
      { translateX: cx.value },
      { translateY: cy.value },
      { rotateZ: wobble },
      { scaleX: sx },
      { scaleY: 1 },
      { translateX: -size * 0.5 },
      { translateY: -size * 0.5 },
    ];
  });

  const s = size / 24;

  return (
    <Group transform={transform} opacity={opacity}>
      {/* petite “pièce” lumineuse */}
      <Circle cx={size * 0.5} cy={size * 0.5} r={size * 0.52} color="rgba(34,211,238,0.10)" />
      <Circle cx={size * 0.5} cy={size * 0.5} r={size * 0.48} color="rgba(34,211,238,0.06)" />

      {/* shield */}
      <Group transform={[{ scale: s }]}>
        <Path path={shieldPath} color="rgba(34,211,238,0.92)" />
        <Path path={shieldPath} color="rgba(255,255,255,0.25)" style="stroke" strokeWidth={1.25} />
      </Group>
    </Group>
  );
};
