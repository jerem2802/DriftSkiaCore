// src/components/menu/PlayButtonSkia.tsx
import React from 'react';
import { Group, Path, Skia, Text } from '@shopify/react-native-skia';
import type { MenuLayout } from './menuLayout';
import { GlassCardSkia } from './GlassCardSkia';
import { matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

type PlayButtonSkiaProps = {
  layout: MenuLayout;
};

export const PlayButtonSkia: React.FC<PlayButtonSkiaProps> = ({ layout }) => {
  const btn = layout.playRect;

  // Triangle ARRONDI (pas pointu)
  const tri = Skia.Path.Make();
  const tX = btn.x + btn.w * 0.12;
  const tY = btn.y + btn.h / 2;
  const tS = btn.h * 0.63;  // Réduit (était 0.75)

  // Triangle avec coins arrondis
  tri.moveTo(tX + 5, tY - tS / 2 + 5);
  tri.lineTo(tX + tS - 5, tY);
  tri.lineTo(tX + 5, tY + tS / 2 - 5);
  tri.close();

  // Font BOLD avec letter-spacing
  const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });
  const playFont = matchFont({
    fontFamily,
    fontSize: 36,
    fontWeight: '900',
  });

  // Centrer vraiment le texte
  const textWidth = 80; // Largeur approximative "PLAY" en 36px bold
  const textX = btn.x + (btn.w - textWidth) / 2;

  return (
    <Group>
      {/* Fond glass */}
      <GlassCardSkia
        rect={btn}
        a="rgba(34,211,238,0.20)"
        b="rgba(59,130,246,0.10)"
        heavy
        glow="rgba(34,211,238,0.85)"
      />

      {/* Triangle arrondi */}
      <Path path={tri} color="#ffffff" />

      {/* Texte PLAY CENTRÉ */}
      <Text
        x={textX}
        y={btn.y + btn.h * 0.63}
        text="P L A Y"
        font={playFont}
        color="#ffffff"
      />
    </Group>
  );
};