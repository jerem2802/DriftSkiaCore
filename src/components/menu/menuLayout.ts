// src/components/menu/menuLayout.ts
export type Rect = { x: number; y: number; w: number; h: number; r: number };

export type MenuFonts = {
  ui: number;
  small: number;
  labelSmall: number;
  play: number;
  hero: number;
  countdown: number;
  chestButton: number;
};

export type MenuLayout = {
  W: number;
  H: number;
  marginX: number;
  footerBottom: number;
  font: MenuFonts;

  // top bar - SIMPLIFIÉ
  avatarRect: Rect;
  playerNameRect: Rect;
  coinsRect: Rect;
  settingsRect: Rect;

  // hero
  heroRingRect: Rect;
  heroLogoRect: Rect;

  // remove ads
  removeAdsRect: Rect;

  // main CTA
  playRect: Rect;

  // chests row (cards containers)
  chestRowBronzeRect: Rect;
  chestRowSilverRect: Rect;
  chestRowNeonRect: Rect;

  // chests internals (badge top, chest center, button bottom)
  chestBronzeBadgeRect: Rect;
  chestBronzeVisualRect: Rect;
  chestBronzeButtonRect: Rect;

  chestSilverBadgeRect: Rect;
  chestSilverVisualRect: Rect;
  chestSilverButtonRect: Rect;

  chestNeonBadgeRect: Rect;
  chestNeonVisualRect: Rect;
  chestNeonButtonRect: Rect;

  // watch ad button (centered below chests)
  watchAdRect: Rect;

  // bottom nav
  navRect: Rect;
};

const rr = (x: number, y: number, w: number, h: number, r: number): Rect => ({ x, y, w, h, r });

// Helper to compute chest internals (badge, visual, button) from card rect
const chestInternals = (card: Rect) => {
  // Badge en haut (comme ref)
  const badgeH = card.h * 0.14;
  const badgeY = card.y + card.h * 0.04;
  const badgeX = card.x + card.w * 0.08;
  const badgeW = card.w * 0.84;

  // Button en bas (comme ref)
  const btnH = card.h * 0.18;
  const btnY = card.y + card.h - btnH - card.h * 0.04;
  const btnX = card.x + card.w * 0.08;
  const btnW = card.w * 0.84;

  // Visual au centre (entre badge et button)
  const visualY = badgeY + badgeH + card.h * 0.02;
  const visualH = btnY - visualY - card.h * 0.02;
  const visualW = Math.min(card.w * 0.75, visualH * 0.9);
  const visualX = card.x + (card.w - visualW) / 2;

  return {
    badge: rr(badgeX, badgeY, badgeW, badgeH, badgeH * 0.4),
    visual: rr(visualX, visualY, visualW, visualH, 0),
    button: rr(btnX, btnY, btnW, btnH, btnH * 0.35),
  };
};

export const createMenuLayout = (W: number, H: number): MenuLayout => {
  const marginX = W * 0.05;

  // fonts tuned for 1080x1920 stage
  const font: MenuFonts = {
    ui: Math.round(W * 0.030),
    small: Math.round(W * 0.026),
    labelSmall: Math.round(W * 0.028),
    play: Math.round(W * 0.080),
    hero: Math.round(W * 0.110),
    countdown: Math.round(W * 0.032),
    chestButton: Math.round(W * 0.036),
  };

  // TOP BAR - Header ultra compact
  const topY = H * 0.035;
  const topH = H * 0.035;

  // Avatar (à gauche)
  const avatarSize = topH * 1.15;
  const avatarRect = rr(marginX, topY - (avatarSize - topH) / 2, avatarSize, avatarSize, avatarSize / 2);

  // Pill PLAYER décalée (asymétrie)
  const playerPillX = marginX + avatarSize * 0.45;
  const playerPillW = W * 0.28;
  const playerPillY = topY - topH * 0.10;
  const playerNameRect = rr(playerPillX, playerPillY, playerPillW, topH, topH * 0.30);

  // Pill COINS
  const coinsPillX = playerPillX + playerPillW + W * 0.02;
  const coinsPillW = W * 0.26;
  const coinsRect = rr(coinsPillX, playerPillY, coinsPillW, topH, topH * 0.30);

  // Settings à DROITE (AGRANDI)
  const settingsSize = topH * 1.3;
  const settingsX = W - marginX - settingsSize;
  const settingsRect = rr(settingsX, playerPillY - (settingsSize - topH) / 2, settingsSize, settingsSize, settingsSize / 2);

  // HERO (ring + logo PNG) - Ratio ajusté pour PNG horizontal
  const heroY = H * 0.07;
  const heroH = H * 0.40;
  const heroRingRect = rr(W * 0.10, heroY, W * 0.80, heroH, Math.round(W * 0.06));

  // Logo avec ratio 3.3:1 (très horizontal comme le PNG)
  const logoW = W * 0.95;
  const logoH = logoW / 3.3;
  const logoX = (W - logoW) / 1;
  const logoY = heroY + (heroH - logoH) / 2.2;
  const heroLogoRect = rr(logoX, logoY, logoW, logoH, 0);

  // REMOVE ADS (juste sous le hero)
  const removeAdsW = W * 0.55;
  const removeAdsH = H * 0.080;
  const removeAdsX = (W - removeAdsW) / 0.72;
  const removeAdsY = heroY + heroH + H * -0.12;
  const removeAdsRect = rr(removeAdsX, removeAdsY, removeAdsW, removeAdsH, removeAdsH * 0.32);

  // PLAY (ajusté pour le hero plus grand)
  const playRect = rr(W * 0.18, H * 0.44, W * 0.64, H * 0.105, Math.round(W * 0.05));

  // CHESTS row (descendus pour le hero agrandi)
  const chestY = H * 0.60;
  const chestH = H * 0.19;
  const chestW = W * 0.31;
  const chestGap = W * 0.02;
  const chestX0 = W * 0.02;

  const chestRowBronzeRect = rr(chestX0, chestY, chestW, chestH, Math.round(W * 0.03));
  const chestRowSilverRect = rr(chestX0 + chestW + chestGap, chestY, chestW, chestH, Math.round(W * 0.03));
  const chestRowNeonRect = rr(chestX0 + (chestW + chestGap) * 2, chestY, chestW, chestH, Math.round(W * 0.03));

  const bronzeInternals = chestInternals(chestRowBronzeRect);
  const silverInternals = chestInternals(chestRowSilverRect);
  const neonInternals = chestInternals(chestRowNeonRect);

  // Watch Ad button (centré sous les 3 cards)
  const watchAdRect = rr(W * 0.24, chestY + chestH + H * 0.018, W * 0.52, H * 0.060, Math.round(W * 0.03));

  // BOTTOM NAV
  const navH = H * 0.25;
  const navRect = rr(0, H - navH, W, navH, 0);

  const footerBottom = H * 0.015;

  return {
    W,
    H,
    marginX,
    footerBottom,
    font,

    avatarRect,
    playerNameRect,
    coinsRect,
    settingsRect,

    heroRingRect,
    heroLogoRect,

    removeAdsRect,

    playRect,

    chestRowBronzeRect,
    chestRowSilverRect,
    chestRowNeonRect,

    chestBronzeBadgeRect: bronzeInternals.badge,
    chestBronzeVisualRect: bronzeInternals.visual,
    chestBronzeButtonRect: bronzeInternals.button,

    chestSilverBadgeRect: silverInternals.badge,
    chestSilverVisualRect: silverInternals.visual,
    chestSilverButtonRect: silverInternals.button,

    chestNeonBadgeRect: neonInternals.badge,
    chestNeonVisualRect: neonInternals.visual,
    chestNeonButtonRect: neonInternals.button,

    watchAdRect,

    navRect,
  };
};