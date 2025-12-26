export type Tier = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type ShopBall = {
  id: string;
  name: string;
  price: number;
  desc: string;
  tier: Tier;
  accent: string;
};

export const tierFrame = (t: Tier) => {
  switch (t) {
    case 'COMMON':
      return 'rgba(148,163,184,0.42)';
    case 'RARE':
      return 'rgba(34,211,238,0.55)';
    case 'EPIC':
      return 'rgba(139,92,246,0.55)';
    case 'LEGENDARY':
      return 'rgba(255,107,213,0.65)';
  }
};

export const SHOP_BALLS: ShopBall[] = [
  {
    id: 'ball_classic',
    name: 'Classic Neon',
    price: 0,
    desc: 'Bille de base. Neutre.',
    tier: 'COMMON',
    accent: '#22d3ee',
  },
  {
    id: 'ball_water',
    name: 'Aqua Flow',
    price: 250,
    desc: 'Water trail fluide. AutoPlay +0.4s',
    tier: 'COMMON',
    accent: '#3b82f6',
  },
  {
    id: 'ball_amber',
    name: 'Amber Drift',
    price: 120,
    desc: 'Confort coins (MVP).',
    tier: 'COMMON',
    accent: '#fbbf24',
  },
  {
    id: 'ball_fire',
    name: 'Fire Blaze',
    price: 150,
    desc: 'Flammes destructrices.',
    tier: 'COMMON',
    accent: '#ff6b35',
  },
  {
    id: 'ball_mint',
    name: 'Mint Glide',
    price: 220,
    desc: 'Run plus stable (MVP).',
    tier: 'COMMON',
    accent: '#34d399',
  },
  {
    id: 'ball_rose',
    name: 'Rose Spark',
    price: 300,
    desc: 'Combo feel-good (MVP).',
    tier: 'COMMON',
    accent: '#fb7185',
  },
  {
    id: 'ball_steel',
    name: 'Steel Core',
    price: 420,
    desc: 'Poids / inertie (MVP).',
    tier: 'COMMON',
    accent: '#94a3b8',
  },
  {
    id: 'ball_sunset',
    name: 'Sunset Arc',
    price: 520,
    desc: 'Gates plus lisibles (MVP).',
    tier: 'COMMON',
    accent: '#f97316',
  },
  {
    id: 'ball_ice',
    name: 'Ice Prism',
    price: 700,
    desc: 'Pulsation soft (MVP).',
    tier: 'COMMON',
    accent: '#60a5fa',
  },

  {
    id: 'ball_violet',
    name: 'Violet Pulse',
    price: 900,
    desc: 'AutoPlay + (MVP).',
    tier: 'RARE',
    accent: '#a78bfa',
  },
  {
    id: 'ball_lime',
    name: 'Lime Reactor',
    price: 1100,
    desc: 'Streak sustain (MVP).',
    tier: 'RARE',
    accent: '#a3e635',
  },
  {
    id: 'ball_orchid',
    name: 'Orchid Nova',
    price: 1300,
    desc: 'Shield regen (MVP).',
    tier: 'RARE',
    accent: '#e879f9',
  },
  {
    id: 'ball_glowblue',
    name: 'Glowlite Blue',
    price: 1500,
    desc: 'Vision ++ (MVP).',
    tier: 'RARE',
    accent: '#38bdf8',
  },
  {
    id: 'ball_blood',
    name: 'Blood Ember',
    price: 1700,
    desc: 'Risk / reward (MVP).',
    tier: 'RARE',
    accent: '#ef4444',
  },
  {
    id: 'ball_pearl',
    name: 'Pearl Wave',
    price: 1900,
    desc: 'Run comfort (MVP).',
    tier: 'RARE',
    accent: '#e5e7eb',
  },
  {
    id: 'ball_neonpink',
    name: 'Neon Pink',
    price: 2200,
    desc: 'Boost feel (MVP).',
    tier: 'RARE',
    accent: '#ff6bd5',
  },
  {
    id: 'ball_deeppurple',
    name: 'Deep Purple',
    price: 2500,
    desc: 'Combo pop (MVP).',
    tier: 'RARE',
    accent: '#7c3aed',
  },

  {
    id: 'ball_magnet',
    name: 'Magnet Prime',
    price: 3200,
    desc: 'Pickup coins ++ (MVP).',
    tier: 'EPIC',
    accent: '#f97316',
  },
  {
    id: 'ball_spectrum',
    name: 'Spectrum Drive',
    price: 3800,
    desc: 'AutoPlay ++ (MVP).',
    tier: 'EPIC',
    accent: '#22d3ee',
  },
  {
    id: 'ball_titan',
    name: 'Titan Coil',
    price: 4500,
    desc: 'Shield ++ (MVP).',
    tier: 'EPIC',
    accent: '#34d399',
  },
  {
    id: 'ball_void',
    name: 'Void Runner',
    price: 5200,
    desc: 'Anti-frustration (MVP).',
    tier: 'EPIC',
    accent: '#a78bfa',
  },
  {
    id: 'ball_photon',
    name: 'Photon Blade',
    price: 6000,
    desc: 'Gates permissives (MVP).',
    tier: 'EPIC',
    accent: '#fbbf24',
  },
  {
    id: 'ball_rift',
    name: 'Rift Engine',
    price: 7200,
    desc: 'Perk spécial (MVP).',
    tier: 'EPIC',
    accent: '#e879f9',
  },

  {
    id: 'ball_legend_aurora',
    name: 'Aurora Crown',
    price: 9500,
    desc: 'Signature perk (plus tard).',
    tier: 'LEGENDARY',
    accent: '#ff6bd5',
  },
  {
    id: 'ball_extreme',
    name: 'Extreme Spectrum',
    price: 12000,
    desc: 'Top-tier long terme.',
    tier: 'LEGENDARY',
    accent: '#fbbf24',
  },
];