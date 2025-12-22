// src/game/balls/ballTrailConfigs.ts
export type TrailType =
  | 'none'
  | 'droplets'
  | 'sparks'
  | 'lightning'
  | 'bubbles'
  | 'flames'
  | 'frost'
  | 'petals'
  | 'stars'
  | 'particles'
  | 'smoke'
  | 'blood';

export type FadeMode = 'linear' | 'smooth' | 'sudden' | 'gradual';

export type ParticleLayerConfig = {
  type: TrailType;
  color: string;
  spawnRate: number;
  gravity: number;
  friction: number;
  scaleMin: number;
  scaleMax: number;
  lifeMin: number;
  lifeMax: number;
  width: number;
  height: number;
  opacity: number;
  velocityInherit: number;
  randomSpread: number;
  dragX: number;
  dragY: number;
  rotationSpeed: number;
  scaleOverLife: boolean;
  fadeMode: FadeMode;
  zigzag: number;
  velocitySpread?: number; // Added this property
};

export type TrailConfig = {
  blendMode: any;
  primary: ParticleLayerConfig;
  secondary?: ParticleLayerConfig
  tertiary?: ParticleLayerConfig
  quaternary?: ParticleLayerConfig
};

const createLayer = (overrides: Partial<ParticleLayerConfig>): ParticleLayerConfig => ({
  type: 'particles',
  color: 'rgba(255, 255, 255, 0.95)',
  spawnRate: 35,
  gravity: 60,
  friction: 0.98,
  scaleMin: 1.0,
  scaleMax: 1.4,
  lifeMin: 0.6,
  lifeMax: 0.9,
  width: 10,
  height: 10,
  opacity: 0.95,
  velocityInherit: 0.3,
  randomSpread: 25,
  dragX: 1.0,
  dragY: 1.0,
  rotationSpeed: 0,
  scaleOverLife: false,
  fadeMode: 'linear',
  zigzag: 0,
  ...overrides,
});

export const BALL_TRAIL_CONFIGS: Record<string, TrailConfig> = {
  ball_classic: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(34, 211, 238, 0.95)',
      width: 12,
      height: 12,
    }),
  },
// 💧 EAU - Avec profondeur et texture liquide
ball_water: {
  blendMode: 'plus',

  // 1) CŒUR DES GOUTTES : centre sombre/transparent
  primary: createLayer({
    type: 'droplets',
    color: 'rgba(100, 200, 240, 0.25)',  // ✅ Centre translucide (comme vraie eau)
    gravity: 280,
    width: 10,
    height: 13,
    spawnRate: 22,
    lifeMin: 0.22,
    lifeMax: 0.38,
    fadeMode: 'sudden',
    velocityInherit: 0.65,
  }),

  // 2) CONTOUR LUMINEUX : bord brillant des gouttes
  secondary: createLayer({
    type: 'droplets',
    color: 'rgba(180, 245, 255, 0.65)',  // ✅ Contour BRIGHT (réfraction)
    gravity: 280,                         // ✅ Même gravité = suit le cœur
    width: 11,                            // ✅ 1px plus large = effet bordure
    height: 14,
    spawnRate: 22,                        // ✅ Même spawn = overlay parfait
    lifeMin: 0.22,
    lifeMax: 0.38,
    fadeMode: 'sudden',
    velocityInherit: 0.65,                // ✅ Parfaitement synchro
    opacity: 0.4,                         // ✅ Semi-transparent
  }),

  // 3) REFLETS BLANCS : highlights sur les gouttes
  tertiary: createLayer({
    type: 'droplets',
    color: 'rgba(255, 255, 255, 0.75)',  // ✅ Reflets intenses
    gravity: 250,
    width: 3,
    height: 4,
    spawnRate: 70,
    lifeMin: 0.14,
    lifeMax: 0.26,
    fadeMode: 'sudden',
    velocityInherit: 0.9,
  }),

  // 4) SPRAY FIN : microgouttes dispersées
  quaternary: createLayer({
    type: 'droplets',
    color: 'rgba(140, 220, 255, 0.3)',
    gravity: 260,
    width: 4,
    height: 5,
    spawnRate: 40,
    lifeMin: 0.18,
    lifeMax: 0.30,
    fadeMode: 'gradual',
    velocityInherit: 0.75,
    velocitySpread: 0.25,
  }),
},


  // 🍯 MIEL - Grosses bulles + petites
  ball_amber: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'bubbles',
      color: 'rgba(255, 180, 60, 0.92)',
      gravity: 35,
      width: 16,
      height: 16,
      spawnRate: 30,
      lifeMin: 1.0,
      lifeMax: 1.6,
      scaleOverLife: true,
      dragY: 0.88,
    }),
    secondary: createLayer({
      type: 'bubbles',
      color: 'rgba(255, 200, 100, 0.75)',
      gravity: 40,
      width: 8,
      height: 8,
      spawnRate: 18,
      lifeMin: 0.7,
      lifeMax: 1.2,
      opacity: 0.7,
    }),
  },

// 🔥 FEU - Cendres ÉNORMES et VISIBLES
ball_cyan: {
  blendMode: 'plus',
  primary: createLayer({
    type: 'flames',
    color: 'rgba(255, 80, 20, 0.95)',
    gravity: -90,
    width: 10,
    height: 16,
    spawnRate: 35,
    lifeMin: 0.3,
    lifeMax: 0.6,
    scaleOverLife: true,
    rotationSpeed: 4.0,
    friction: 0.88,
    dragX: 0.80,
    dragY: 0.75,
    randomSpread: 45,
    fadeMode: 'smooth',
    velocityInherit: 0.3,
  }),
  secondary: createLayer({
    type: 'particles',
    color: 'rgba(255, 220, 150, 1.0)',
    gravity: -5,
    width: 8,
    height: 8,
    spawnRate: 90,
    lifeMin: 1.5,
    lifeMax: 2.5,
    scaleOverLife: false,
    rotationSpeed: 12.0,
    friction: 0.97,
    dragX: 0.40,
    dragY: 0.45,
    randomSpread: 180,
    fadeMode: 'linear',
    velocityInherit: 0.0,
    opacity: 1.0,
  }),
},
  // 🌿 MENTHE
  ball_mint: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'frost',
      color: 'rgba(80, 255, 200, 0.92)',
      gravity: 45,
      width: 12,
      height: 16,
      rotationSpeed: 2.0,
      dragY: 0.94,
    }),
  },

  // 🌸 ROSE - Gros pétales + petits
  ball_rose: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'petals',
      color: 'rgba(255, 130, 150, 0.95)',
      gravity: 25,
      width: 18,
      height: 14,
      spawnRate: 35,
      rotationSpeed: 5.5,
      lifeMin: 1.2,
      lifeMax: 2.0,
      dragX: 0.91,
      dragY: 0.88,
      randomSpread: 40,
    }),
    secondary: createLayer({
      type: 'petals',
      color: 'rgba(255, 160, 180, 0.75)',
      gravity: 30,
      width: 9,
      height: 7,
      spawnRate: 20,
      rotationSpeed: 4.0,
      lifeMin: 0.8,
      lifeMax: 1.3,
      opacity: 0.7,
    }),
  },

  // ⚙️ ACIER - Grosses étincelles + petites
  ball_steel: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'sparks',
      color: 'rgba(230, 240, 250, 0.98)',
      gravity: 280,
      width: 7,
      height: 14,
      spawnRate: 50,
      lifeMin: 0.25,
      lifeMax: 0.45,
    }),
    secondary: createLayer({
      type: 'sparks',
      color: 'rgba(200, 210, 220, 0.85)',
      gravity: 260,
      width: 3,
      height: 7,
      spawnRate: 30,
      lifeMin: 0.15,
      lifeMax: 0.3,
      opacity: 0.8,
    }),
  },

  // 🌅 SUNSET
  ball_sunset: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(255, 130, 70, 0.95)',
      gravity: 20,
      width: 13,
      height: 13,
      dragY: 0.93,
    }),
  },

  // 🧊 GLACE
  ball_ice: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'frost',
      color: 'rgba(200, 235, 255, 0.9)',
      gravity: 100,
      width: 9,
      height: 14,
      rotationSpeed: 1.5,
      lifeMin: 0.9,
      lifeMax: 1.5,
    }),
  },

  // ⚡ VIOLET - Éclairs épais + fins
  ball_violet: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'lightning',
      color: 'rgba(180, 150, 255, 0.98)',
      gravity: 0,
      width: 9,
      height: 5,
      spawnRate: 55,
      lifeMin: 0.12,
      lifeMax: 0.2,
      zigzag: 60,
      fadeMode: 'sudden',
      randomSpread: 50,
    }),
    secondary: createLayer({
      type: 'lightning',
      color: 'rgba(200, 180, 255, 0.8)',
      gravity: 0,
      width: 4,
      height: 2,
      spawnRate: 40,
      lifeMin: 0.08,
      lifeMax: 0.15,
      zigzag: 45,
      fadeMode: 'sudden',
      opacity: 0.75,
    }),
  },

  // 🟢 LIME
  ball_lime: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(180, 255, 60, 0.95)',
      gravity: 10,
      width: 12,
      height: 12,
      dragY: 0.91,
    }),
  },

  // 🌺 ORCHIDÉE - Gros pétales magiques
  ball_orchid: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'petals',
      color: 'rgba(240, 130, 255, 0.92)',
      gravity: 20,
      width: 15,
      height: 15,
      spawnRate: 30,
      rotationSpeed: 4.5,
      lifeMin: 1.3,
      lifeMax: 2.1,
      dragX: 0.9,
      dragY: 0.87,
      randomSpread: 45,
    }),
  },

  // 💙 GLOW BLUE
  ball_glowblue: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(80, 200, 255, 0.98)',
      gravity: 15,
      width: 11,
      height: 11,
      spawnRate: 55,
    }),
  },

  // 🩸 SANG - Grosses gouttes + éclaboussures
  ball_blood: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'blood',
      color: 'rgba(230, 40, 40, 0.98)',
      gravity: 160,
      width: 11,
      height: 20,
      spawnRate: 40,
      lifeMin: 0.7,
      lifeMax: 1.1,
      velocityInherit: 0.6,
    }),
    secondary: createLayer({
      type: 'blood',
      color: 'rgba(200, 50, 50, 0.85)',
      gravity: 140,
      width: 5,
      height: 10,
      spawnRate: 25,
      lifeMin: 0.4,
      lifeMax: 0.7,
      opacity: 0.8,
    }),
  },

  // 💎 PERLE
  ball_pearl: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(245, 245, 255, 0.85)',
      gravity: 30,
      width: 10,
      height: 10,
    }),
  },

  // 💗 NEON PINK
  ball_neonpink: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(255, 120, 220, 0.98)',
      gravity: 20,
      width: 11,
      height: 11,
      spawnRate: 60,
    }),
  },

  // 🌌 DEEP PURPLE - Étoiles
  ball_deeppurple: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'stars',
      color: 'rgba(160, 70, 250, 0.95)',
      gravity: 8,
      width: 10,
      height: 10,
      rotationSpeed: 6.5,
      lifeMin: 1.0,
      lifeMax: 1.7,
    }),
  },

  // 🧲 MAGNÉTIQUE
  ball_magnet: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'sparks',
      color: 'rgba(220, 140, 70, 0.95)',
      gravity: 130,
      width: 8,
      height: 12,
      spawnRate: 45,
    }),
  },

  // 🌈 SPECTRE
  ball_spectrum: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(255, 255, 255, 0.9)',
      gravity: 35,
      width: 11,
      height: 11,
      spawnRate: 50,
    }),
  },

  // 👑 TITAN
  ball_titan: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'sparks',
      color: 'rgba(255, 220, 110, 0.98)',
      gravity: 140,
      width: 7,
      height: 11,
      spawnRate: 42,
    }),
  },

  // 🌑 VOID
  ball_void: {
    blendMode: 'plus',
    primary: createLayer({
      type: 'stars',
      color: 'rgba(140, 140, 200, 0.8)',
      gravity: 3,
      width: 8,
      height: 8,
      rotationSpeed: 3.0,
      lifeMin: 1.3,
      lifeMax: 2.3,
    }),
  },

  // ☀️ PHOTON
  ball_photon: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(255, 255, 255, 0.99)',
      gravity: 5,
      width: 9,
      height: 9,
      spawnRate: 65,
    }),
  },

  // 🌀 RIFT
  ball_rift: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(170, 110, 255, 0.95)',
      gravity: 25,
      width: 12,
      height: 12,
      rotationSpeed: 8.0,
      spawnRate: 55,
    }),
  },

  // 🌌 AURORE
  ball_legend_aurora: {
    blendMode: 'plus',
    primary: createLayer({
      color: 'rgba(210, 160, 255, 0.92)',
      gravity: 12,
      width: 11,
      height: 11,
      spawnRate: 52,
      dragY: 0.93,
    }),
  },

// 🔥 EXTREME - RÉDUIT
ball_extreme: {
  blendMode: 'plus',
  primary: createLayer({
    type: 'flames',
    color: 'rgba(255, 110, 40, 0.98)',
    gravity: -120,
    width: 10,        // ← ÉTAIT 14
    height: 14,       // ← ÉTAIT 20
    spawnRate: 35,    // ← ÉTAIT 65 (divisé par 2 !)
    lifeMin: 0.4,     // ← ÉTAIT 0.6
    lifeMax: 0.7,     // ← ÉTAIT 1.0
    scaleOverLife: true,
    rotationSpeed: 3.5,
    dragY: 0.86,
    randomSpread: 35,
  }),
  secondary: createLayer({
    type: 'flames',
    color: 'rgba(255, 80, 20, 0.85)',
    gravity: -100,
    width: 5,         // ← ÉTAIT 7
    height: 7,        // ← ÉTAIT 10
    spawnRate: 25,    // ← ÉTAIT 45 (divisé par 2 !)
    lifeMin: 0.3,     // ← ÉTAIT 0.4
    lifeMax: 0.5,     // ← ÉTAIT 0.7
    scaleOverLife: true,
    rotationSpeed: 2.5,
    opacity: 0.85,
  }),
},
};

export const getBallTrailConfig = (ballId: string): TrailConfig => {
  'worklet';
  return BALL_TRAIL_CONFIGS[ballId] ?? {
    blendMode: 'plus',
    primary: createLayer({}),
  };
};