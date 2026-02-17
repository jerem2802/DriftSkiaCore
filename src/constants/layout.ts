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

// ===== TOP HUD BAR =====
// ⬇️  CHANGER CE SEUL CHIFFRE pour remonter/descendre toute la barre d'un coup
export const HUD_Y_OFFSET = -7; // valeurs négatives = remonte, positives = descend

// Barre neon : x=8, y=8+offset, width=CANVAS_WIDTH-16, height=90, r=16
export const HUD_BAR_Y = 8 + HUD_Y_OFFSET;
export const HUD_BAR_H = 90;
export const HUD_BAR_R = 16;
export const HUD_BAR_CY = HUD_BAR_Y + HUD_BAR_H / 2; // centre vertical

// Ligne haute (cœurs + coin icon) — offset +22 par rapport au bord de la barre
export const HUD_ROW1_Y = HUD_BAR_Y + 42;
// Ligne basse (shields) — offset +52
export const HUD_ROW2_Y = HUD_BAR_Y + 68;
// Score baseline (font 48px)
export const HUD_SCORE_Y = HUD_BAR_Y + 47;
// Multiplicateur baseline (font 34px)
export const HUD_MULT_Y = HUD_BAR_Y + 80;

// Bouton pause (canvas coords) — tap détecté dans DriftGame.onTap
export const HUD_PAUSE_CX = 50;
export const HUD_PAUSE_CY = HUD_BAR_CY; // suit le centre vertical de la barre
export const HUD_PAUSE_R_TAP = 32;

// Coin icon center X
export const HUD_COIN_X = 112;
// Coin icon center Y (= centre vertical de la barre)
export const HUD_COIN_Y = HUD_BAR_CY;
// Vies : cœur le plus à droite + espacement (reculé de 6px pour moins coller le bord)
export const HUD_LIVES_START_X = CANVAS_WIDTH - 35;
export const HUD_LIVES_SPACING = 32;

// Limite basse de la HUD bar → les rings ne spawneront pas au-dessus
export const GAME_TOP = HUD_BAR_Y + HUD_BAR_H + 10;

// Rétro-compat
export const HUD_TOP_Y = HUD_ROW1_Y;

// Coin HUD position (worklet-safe)
export const getCoinHudPosition = () => {
  'worklet';
  return { x: HUD_COIN_X, y: HUD_COIN_Y };
};

// Life HUD position (worklet-safe, conservé)
export const getLifeHudPosition = () => {
  'worklet';
  return { x: CANVAS_WIDTH - 60, y: HUD_ROW1_Y };
};
