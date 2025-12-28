// src/components/chests/RewardPanelSkia.tsx
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Platform, View } from 'react-native';
import {
  Canvas,
  Group,
  RoundedRect,
  Text as SkiaText,
  Circle,
  Path,
  matchFont,
  Skia,
} from '@shopify/react-native-skia';

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/gameplay';
import type { Reward } from '../../config/bonusConfig';

type Props = {
  isVisible: boolean;
  rewards: Reward[];
  onClose: () => void;
};

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });

const FONT_TITLE = matchFont({ fontFamily, fontSize: 22, fontWeight: '900' });
const FONT_SUB = matchFont({ fontFamily, fontSize: 11, fontWeight: '700' });

const FONT_ROW_TITLE = matchFont({ fontFamily, fontSize: 15, fontWeight: '900' });
const FONT_ROW_DESC = matchFont({ fontFamily, fontSize: 11, fontWeight: '700' });

const FONT_BADGE = matchFont({ fontFamily, fontSize: 10, fontWeight: '900' });
const FONT_BTN = matchFont({ fontFamily, fontSize: 14, fontWeight: '900' });
const FONT_EMOJI = matchFont({ fontFamily, fontSize: 20, fontWeight: '900' });

const clampText = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

const rarityColor = (r: Reward['rarity']) => {
  switch (r) {
    case 'common':
      return 'rgba(148,163,184,0.45)';
    case 'rare':
      return 'rgba(34,211,238,0.55)';
    case 'epic':
      return 'rgba(139,92,246,0.55)';
    case 'legendary':
      return 'rgba(255,107,213,0.65)';
  }
};

const rarityLabel = (r: Reward['rarity']) => r.toUpperCase();

type IconProps = {
  type: Reward['type'];
  icon: string;
  cx: number;
  cy: number;
  size: number;
};

const RewardIcon: React.FC<IconProps> = ({ type, icon, cx, cy, size }) => {
  const r = size * 0.5;

  // Triangle autoplay
  const tri = useMemo(() => {
    const x0 = cx - r * 0.35;
    const y0 = cy - r * 0.45;
    const x1 = cx - r * 0.35;
    const y1 = cy + r * 0.45;
    const x2 = cx + r * 0.55;
    const y2 = cy;
    const svg = `M ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} Z`;
    return Skia.Path.MakeFromSVGString(svg);
  }, [cx, cy, r]);

  // ✅ BILLE = EMOJI
  if (type === 'ball') {
    return (
      <Group>
        <Circle cx={cx} cy={cy} r={r + 2} color="rgba(255,255,255,0.15)" />
        <SkiaText x={cx - r * 0.7} y={cy + r * 0.4} text={icon} font={FONT_EMOJI} color="#FFFFFF" />
      </Group>
    );
  }

  if (type === 'coins') {
    return (
      <Group>
        <Circle cx={cx} cy={cy} r={r} color="rgba(251,191,36,0.92)" />
        <Circle cx={cx} cy={cy} r={r * 0.68} color="rgba(0,0,0,0.16)" />
        <Circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.22} color="rgba(255,255,255,0.35)" />
      </Group>
    );
  }

  if (type === 'upgrade_shield') {
    const w = size * 0.92;
    const h = size * 0.92;
    return (
      <Group>
        <RoundedRect
          x={cx - w / 2}
          y={cy - h / 2}
          width={w}
          height={h}
          r={size * 0.28}
          color="rgba(34,211,238,0.22)"
        />
        <RoundedRect
          x={cx - w / 2}
          y={cy - h / 2}
          width={w}
          height={h}
          r={size * 0.28}
          color="rgba(255,255,255,0.08)"
        />
        <Circle cx={cx} cy={cy} r={r * 0.35} color="rgba(34,211,238,0.35)" />
      </Group>
    );
  }

  if (type === 'upgrade_autoplay') {
    if (tri) {
      return (
        <Group>
          <Circle cx={cx} cy={cy} r={r} color="rgba(255,107,213,0.18)" />
          <Path path={tri} color="rgba(255,255,255,0.95)" />
        </Group>
      );
    }
  }

  if (type === 'upgrade_multiplier') {
    return (
      <Group>
        <Circle cx={cx} cy={cy} r={r} color="rgba(139,92,246,0.22)" />
        <SkiaText x={cx - r * 0.4} y={cy + r * 0.3} text="⭐" font={FONT_EMOJI} color="#FFFFFF" />
      </Group>
    );
  }

  // ✅ FALLBACK EMOJI
  return (
    <SkiaText
      x={cx - r * 0.7}
      y={cy + r * 0.4}
      text={icon}
      font={FONT_EMOJI}
      color="#FFFFFF"
    />
  );
};

export const RewardPanelSkia: React.FC<Props> = ({ isVisible, rewards, onClose }) => {
  if (!isVisible) return null;

  const rewardsToShow = rewards.slice(0, 4);

  const panelW = Math.min(460, CANVAS_WIDTH - 34);
  const panelH = 340;
  const panelX = (CANVAS_WIDTH - panelW) / 2;
  const panelY = (CANVAS_HEIGHT - panelH) / 2;

  const headerH = 72;

  const rowX = panelX + 18;
  const rowW = panelW - 36;
  const rowStartY = panelY + headerH + 10;
  const rowH = 62;

  const iconBox = 38;

  const badgeW = 92;
  const badgeH = 18;
  const badgeX = panelX + panelW - 18 - badgeW;

  // Bouton "CONTINUER"
  const btnW = Math.min(280, panelW - 60);
  const btnH = 46;
  const btnX = panelX + (panelW - btnW) / 2;
  const btnY = panelY + panelH - btnH - 16;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* ✅ TAP DEHORS = FERME */}
      <Pressable 
        style={StyleSheet.absoluteFill} 
        onPress={onClose}
      />

      {/* Zone cliquable bouton */}
      <Pressable
        style={[styles.btnHit, { left: btnX, top: btnY, width: btnW, height: btnH }]}
        onPress={onClose}
      />

      <Canvas style={styles.canvas} pointerEvents="none">
        {/* Backdrop */}
        <RoundedRect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} r={0} color="rgba(0,0,0,0.72)" />

        {/* Panel */}
        <RoundedRect x={panelX} y={panelY} width={panelW} height={panelH} r={18} color="rgba(10,10,20,0.92)" />
        <RoundedRect x={panelX} y={panelY} width={panelW} height={panelH} r={18} color="rgba(255,107,213,0.06)" />

        {/* Header */}
        <SkiaText x={panelX + 20} y={panelY + 40} text="REWARDS" font={FONT_TITLE} color="#FFE6FF" />
        <SkiaText x={panelX + 20} y={panelY + 60} text="Your chest rewards" font={FONT_SUB} color="rgba(229,231,235,0.65)" />

        {rewardsToShow.map((r, idx) => {
          const baseY = rowStartY + idx * rowH;

          const title = clampText(r.name ?? 'Reward', 26);
          const desc = clampText(r.description ?? '', 56);

          const badgeBg = rarityColor(r.rarity);
          const badgeTxt = rarityLabel(r.rarity);

          const iconCx = rowX + 10 + iconBox / 2;
          const iconCy = baseY + 10 + iconBox / 2;

          return (
            <Group key={`${r.id}-${idx}`}>
              {/* row bg */}
              <RoundedRect x={rowX} y={baseY} width={rowW} height={54} r={14} color="rgba(255,255,255,0.05)" />
              <RoundedRect x={rowX} y={baseY} width={rowW} height={54} r={14} color="rgba(34,211,238,0.04)" />

              {/* icon box */}
              <RoundedRect x={rowX + 10} y={baseY + 8} width={iconBox} height={iconBox} r={12} color="rgba(0,0,0,0.38)" />
              <RoundedRect x={rowX + 10} y={baseY + 8} width={iconBox} height={iconBox} r={12} color="rgba(255,107,213,0.08)" />
              
              {/* ✅ UTILISE L'EMOJI DU REWARD */}
              <RewardIcon 
                type={r.type} 
                icon={r.icon}
                cx={iconCx} 
                cy={iconCy} 
                size={iconBox * 0.72} 
              />

              {/* text */}
              <SkiaText x={rowX + 10 + iconBox + 12} y={baseY + 22} text={title} font={FONT_ROW_TITLE} color="#E5F4FF" />
              <SkiaText x={rowX + 10 + iconBox + 12} y={baseY + 43} text={desc} font={FONT_ROW_DESC} color="rgba(229,231,235,0.75)" />

              {/* rarity badge */}
              <RoundedRect x={badgeX} y={baseY + 8} width={badgeW} height={badgeH} r={9} color={badgeBg} />
              <SkiaText x={badgeX + 10} y={baseY + 21} text={badgeTxt} font={FONT_BADGE} color="#FFFFFF" />
            </Group>
          );
        })}

        {/* Bouton visuel */}
        <RoundedRect x={btnX} y={btnY} width={btnW} height={btnH} r={999} color="rgba(0,0,0,0.55)" />
        <RoundedRect x={btnX} y={btnY} width={btnW} height={btnH} r={999} color="rgba(255,107,213,0.18)" />
        <RoundedRect x={btnX} y={btnY} width={btnW} height={btnH} r={999} color="rgba(255,107,213,0.12)" />

        <SkiaText
          x={btnX + btnW / 2 - 50}
          y={btnY + 30}
          text="CONTINUER"
          font={FONT_BTN}
          color="#FFE6FF"
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  btnHit: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});