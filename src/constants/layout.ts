// src/constants/layout.ts
// Valeurs de layout (BottomPanel + HUD) - source de vérité unique

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './gameplay';

// ===== BOTTOM PANEL =====
// Valeurs RÉELLES du BottomPanel.tsx (styles)
export const BOTTOM_PANEL = {
  BOTTOM: 48,
  BTN_SIZE: 72,
  BTN_RADIUS: 36, // BTN_SIZE / 2
  BTN_GAP: 24,
} as const;

// Helpers worklet-safe pour calculs de target (AutoPlay + Shield)
export const getBottomPanelTargetY = () => {
  'worklet';
  return CANVAS_HEIGHT - BOTTOM_PANEL.BOTTOM - BOTTOM_PANEL.BTN_RADIUS;
};

export const getAutoPlayTargetX = (shieldVisible: boolean) => {
  'worklet';
  if (shieldVisible) {
    // 2 boutons centrés -> AutoPlay à gauche
    const rowWidth = BOTTOM_PANEL.BTN_SIZE + BOTTOM_PANEL.BTN_GAP + BOTTOM_PANEL.BTN_SIZE;
    const left = (CANVAS_WIDTH - rowWidth) / 2;
    return left + BOTTOM_PANEL.BTN_RADIUS;
  }
  // AutoPlay seul -> centré
  return CANVAS_WIDTH / 2;
};

export const getShieldTargetX = (hasAutoPlayVisible: boolean) => {
  'worklet';
  if (hasAutoPlayVisible) {
    // 2 boutons centrés -> Shield à droite
    const rowWidth = BOTTOM_PANEL.BTN_SIZE + BOTTOM_PANEL.BTN_GAP + BOTTOM_PANEL.BTN_SIZE;
    const left = (CANVAS_WIDTH - rowWidth) / 2;
    return left + BOTTOM_PANEL.BTN_SIZE + BOTTOM_PANEL.BTN_GAP + BOTTOM_PANEL.BTN_RADIUS;
  }
  // Shield seul -> centré
  const left = (CANVAS_WIDTH - BOTTOM_PANEL.BTN_SIZE) / 2;
  return left + BOTTOM_PANEL.BTN_RADIUS;
};

// ===== TOP HUD =====
export const HUD_TOP_Y = 44;

// Coin HUD (top-left)
export const getCoinHudPosition = () => {
  'worklet';
  return {
    x: 40,
    y: HUD_TOP_Y,
  };
};

// Life HUD (top-right, doit matcher DriftGame livesPositions)
export const getLifeHudPosition = () => {
  'worklet';
  return {
    x: CANVAS_WIDTH - 60,
    y: HUD_TOP_Y,
  };
};