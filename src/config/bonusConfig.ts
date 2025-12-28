// src/config/bonusConfig.ts

export type RewardType = 
  | 'coins'
  | 'ball'
  | 'upgrade_shield'
  | 'upgrade_autoplay'
  | 'upgrade_multiplier';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ChestType = 'bronze' | 'silver' | 'neon';

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  value?: number; // Pour coins ou niveau d'upgrade
}

export interface ChestRewardPool {
  guaranteed: Reward[];
  possible: Reward[];
  rewardCount: number; // Nombre de rewards tirés du pool "possible"
  probabilities: Record<string, number>; // Probabilité de chaque reward (en %)
}

// ============================================
// 🎱 BALLES EXCLUSIVES COFFRES
// ============================================

export const CHEST_BALLS: Record<Rarity, Reward[]> = {
  common: [
    { id: 'ball_pool', type: 'ball', name: 'Pool Ball', description: 'Bille 8 noire avec trail de craie bleue', icon: '🎱', rarity: 'common' },
    { id: 'ball_orange', type: 'ball', name: 'Orange Ball', description: 'Agrume juteux avec trail de pulpe', icon: '🍊', rarity: 'common' },
    { id: 'ball_soccer', type: 'ball', name: 'Soccer Ball', description: 'Ballon de foot avec trail d\'herbe', icon: '⚽', rarity: 'common' },
    { id: 'ball_tennis', type: 'ball', name: 'Tennis Ball', description: 'Balle de tennis jaune fluo', icon: '🎾', rarity: 'common' },
    { id: 'ball_baseball', type: 'ball', name: 'Baseball', description: 'Balle de baseball classique', icon: '⚾', rarity: 'common' },
    { id: 'ball_volleyball', type: 'ball', name: 'Volleyball', description: 'Ballon de volley-ball blanc', icon: '🏐', rarity: 'common' },
    { id: 'ball_football', type: 'ball', name: 'Football', description: 'Ballon de football américain', icon: '🏈', rarity: 'common' },
    { id: 'ball_softball', type: 'ball', name: 'Softball', description: 'Balle de softball jaune', icon: '🥎', rarity: 'common' },
  ],
  rare: [
    { id: 'ball_earth', type: 'ball', name: 'Earth Ball', description: 'Planète Terre avec trail de nuages', icon: '🌍', rarity: 'rare' },
    { id: 'ball_blueberry', type: 'ball', name: 'Blueberry Ball', description: 'Myrtille juteuse avec trail violet', icon: '🫐', rarity: 'rare' },
    { id: 'ball_moon', type: 'ball', name: 'Moon Ball', description: 'Lune avec trail de poussière lunaire', icon: '🌙', rarity: 'rare' },
    { id: 'ball_sun', type: 'ball', name: 'Sun Ball', description: 'Soleil éclatant avec rayons dorés', icon: '☀️', rarity: 'rare' },
    { id: 'ball_diamond', type: 'ball', name: 'Diamond Ball', description: 'Diamant brillant arc-en-ciel', icon: '💎', rarity: 'rare' },
    { id: 'ball_basketball', type: 'ball', name: 'Basketball', description: 'Ballon de basket orange', icon: '🏀', rarity: 'rare' },
    { id: 'ball_bowling', type: 'ball', name: 'Bowling Ball', description: 'Boule de bowling avec trail strike', icon: '🎳', rarity: 'rare' },
    { id: 'ball_eye', type: 'ball', name: 'Eye Ball', description: 'Œil qui cligne avec trail hypnotique', icon: '👁️', rarity: 'rare' },
    { id: 'ball_virus', type: 'ball', name: 'Virus Ball', description: 'Virus toxique avec trail vert', icon: '🦠', rarity: 'rare' },
    { id: 'ball_brain', type: 'ball', name: 'Brain Ball', description: 'Cerveau avec ondes psychiques', icon: '🧠', rarity: 'rare' },
  ],
  epic: [],
  legendary: [
    { id: 'ball_galaxy', type: 'ball', name: 'Galaxy Ball', description: 'Galaxie entière avec trail cosmique', icon: '🌌', rarity: 'legendary' },
    { id: 'ball_blackhole', type: 'ball', name: 'Black Hole Ball', description: 'Trou noir avec trail d\'aspiration', icon: '🕳️', rarity: 'legendary' },
    { id: 'ball_crystal', type: 'ball', name: 'Crystal Ball', description: 'Boule de cristal magique', icon: '🔮', rarity: 'legendary' },
    { id: 'ball_atom', type: 'ball', name: 'Atom Ball', description: 'Atome avec particules en orbite', icon: '⚛️', rarity: 'legendary' },
    { id: 'ball_skull', type: 'ball', name: 'Skull Ball', description: 'Crâne avec trail de fumée noire', icon: '💀', rarity: 'legendary' },
    { id: 'ball_saturn', type: 'ball', name: 'Saturn Ball', description: 'Saturne avec anneaux et étoiles', icon: '🪐', rarity: 'legendary' },
  ],
};

// ============================================
// ⚡ UPGRADES
// ============================================

export const UPGRADES: Record<string, Reward[]> = {
  shield: [
    { id: 'shield_lvl1', type: 'upgrade_shield', name: 'Shield Bank Lvl 1', description: '1 shield max', icon: '🛡️', rarity: 'common', value: 1 },
    { id: 'shield_lvl2', type: 'upgrade_shield', name: 'Shield Bank Lvl 2', description: '2 shields max', icon: '🛡️', rarity: 'common', value: 2 },
    { id: 'shield_lvl3', type: 'upgrade_shield', name: 'Shield Bank Lvl 3', description: '3 shields max', icon: '🛡️', rarity: 'rare', value: 3 },
    { id: 'shield_lvl4', type: 'upgrade_shield', name: 'Shield Bank Lvl 4', description: '4 shields max', icon: '🛡️', rarity: 'epic', value: 4 },
  ],
  autoplay: [
    { id: 'autoplay_lvl1', type: 'upgrade_autoplay', name: 'Auto-Play Bank Lvl 1', description: '1 charge (3s)', icon: '⚡', rarity: 'common', value: 1 },
    { id: 'autoplay_lvl2', type: 'upgrade_autoplay', name: 'Auto-Play Bank Lvl 2', description: '2 charges (6s total)', icon: '⚡', rarity: 'common', value: 2 },
    { id: 'autoplay_lvl3', type: 'upgrade_autoplay', name: 'Auto-Play Bank Lvl 3', description: '3 charges (9s total)', icon: '⚡', rarity: 'rare', value: 3 },
    { id: 'autoplay_lvl4', type: 'upgrade_autoplay', name: 'Auto-Play Bank Lvl 4', description: '4 charges (12s total)', icon: '⚡', rarity: 'epic', value: 4 },
  ],
  multiplier: [
    { id: 'multiplier_lvl1', type: 'upgrade_multiplier', name: 'Score Multiplier x1', description: 'Score normal', icon: '⭐', rarity: 'common', value: 1 },
    { id: 'multiplier_lvl2', type: 'upgrade_multiplier', name: 'Score Multiplier x2', description: 'Score x2', icon: '⭐', rarity: 'common', value: 2 },
    { id: 'multiplier_lvl3', type: 'upgrade_multiplier', name: 'Score Multiplier x3', description: 'Score x3', icon: '⭐', rarity: 'rare', value: 3 },
    { id: 'multiplier_lvl4', type: 'upgrade_multiplier', name: 'Score Multiplier x5', description: 'Score x5', icon: '⭐', rarity: 'rare', value: 5 },
    { id: 'multiplier_lvl5', type: 'upgrade_multiplier', name: 'Score Multiplier x7', description: 'Score x7', icon: '⭐', rarity: 'epic', value: 7 },
    { id: 'multiplier_lvl6', type: 'upgrade_multiplier', name: 'Score Multiplier x10', description: 'Score x10', icon: '⭐', rarity: 'legendary', value: 10 },
  ],
};

// ============================================
// 💰 COINS REWARDS
// ============================================

export const COINS_REWARDS: Record<ChestType, { min: number; max: number }> = {
  bronze: { min: 50, max: 150 },
  silver: { min: 200, max: 500 },
  neon: { min: 800, max: 1500 },
};

// ============================================
// 🎁 CONFIGURATION DES COFFRES
// ============================================

export const CHEST_CONFIG: Record<ChestType, ChestRewardPool> = {
  bronze: {
    guaranteed: [
      { id: 'coins_bronze', type: 'coins', name: 'Coins', description: '50-150 coins', icon: '💰', rarity: 'common', value: 0 },
    ],
    possible: [
      ...CHEST_BALLS.common,
      { id: 'upgrade_shield_bronze', type: 'upgrade_shield', name: 'Shield Bank +1', description: '+1 shield max', icon: '🛡️', rarity: 'common' },
      { id: 'upgrade_autoplay_bronze', type: 'upgrade_autoplay', name: 'Auto-Play Bank +1', description: '+1 charge (3s)', icon: '⚡', rarity: 'common' },
    ],
    rewardCount: 1,
    probabilities: {
      'ball_pool': 10,
      'ball_orange': 10,
      'ball_soccer': 10,
      'ball_tennis': 10,
      'ball_baseball': 10,
      'ball_volleyball': 10,
      'ball_football': 10,
      'ball_softball': 10,
      'upgrade_shield_bronze': 10,
      'upgrade_autoplay_bronze': 10,
    },
  },

  silver: {
    guaranteed: [
      { id: 'coins_silver', type: 'coins', name: 'Coins', description: '200-500 coins', icon: '💰', rarity: 'rare', value: 0 },
    ],
    possible: [
      ...CHEST_BALLS.rare,
      { id: 'upgrade_shield_silver', type: 'upgrade_shield', name: 'Shield Bank +1', description: '+1 shield max', icon: '🛡️', rarity: 'rare' },
      { id: 'upgrade_autoplay_silver', type: 'upgrade_autoplay', name: 'Auto-Play Bank +1', description: '+1 charge (3s)', icon: '⚡', rarity: 'rare' },
    ],
    rewardCount: 2,
    probabilities: {
      'ball_earth': 6.5,
      'ball_blueberry': 6.5,
      'ball_moon': 6.5,
      'ball_sun': 6.5,
      'ball_diamond': 6.5,
      'ball_basketball': 6.5,
      'ball_bowling': 6.5,
      'ball_eye': 6.5,
      'ball_virus': 6.5,
      'ball_brain': 6.5,
      'upgrade_shield_silver': 15,
      'upgrade_autoplay_silver': 20,
    },
  },

  neon: {
    guaranteed: [
      { id: 'coins_neon', type: 'coins', name: 'Coins', description: '800-1500 coins', icon: '💰', rarity: 'epic', value: 0 },
    ],
    possible: [
      ...CHEST_BALLS.legendary,
      { id: 'upgrade_shield_neon', type: 'upgrade_shield', name: 'Shield Bank +1', description: '+1 shield max', icon: '🛡️', rarity: 'epic' },
      { id: 'upgrade_autoplay_neon', type: 'upgrade_autoplay', name: 'Auto-Play Bank +1', description: '+1 charge (3s)', icon: '⚡', rarity: 'epic' },
      { id: 'upgrade_multiplier_neon', type: 'upgrade_multiplier', name: 'Score Multiplier +1', description: 'Augmente le multiplicateur de score', icon: '⭐', rarity: 'epic' },
    ],
    rewardCount: 3,
    probabilities: {
      'ball_galaxy': 6.67,
      'ball_blackhole': 6.67,
      'ball_crystal': 6.67,
      'ball_atom': 6.67,
      'ball_skull': 6.67,
      'ball_saturn': 6.67,
      'upgrade_shield_neon': 20,
      'upgrade_autoplay_neon': 25,
      'upgrade_multiplier_neon': 15,
    },
  },
};

// ============================================
// 🎲 HELPER FUNCTIONS
// ============================================

/**
 * Génère un montant de coins aléatoire pour un type de coffre
 */
export function generateCoins(chestType: ChestType): number {
  const { min, max } = COINS_REWARDS[chestType];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Tire un reward aléatoire du pool selon les probabilités
 */
export function pickRandomReward(pool: Reward[], probabilities: Record<string, number>): Reward {
  const totalProbability = Object.values(probabilities).reduce((sum, prob) => sum + prob, 0);
  let random = Math.random() * totalProbability;

  for (const reward of pool) {
    const probability = probabilities[reward.id] || 0;
    random -= probability;
    if (random <= 0) {
      return reward;
    }
  }

  return pool[0]; // Fallback
}

/**
 * Génère les rewards d'un coffre
 */
export function generateChestRewards(chestType: ChestType): Reward[] {
  const config = CHEST_CONFIG[chestType];
  const rewards: Reward[] = [];

  // 1. Guaranteed rewards (coins)
  const coinsReward = { ...config.guaranteed[0], value: generateCoins(chestType) };
  rewards.push(coinsReward);

  // 2. Random rewards from pool
  const pickedRewards: Reward[] = [];
  for (let i = 0; i < config.rewardCount; i++) {
    let reward: Reward;
    let attempts = 0;
    do {
      reward = pickRandomReward(config.possible, config.probabilities);
      attempts++;
    } while (pickedRewards.some(r => r.id === reward.id) && attempts < 50); // Éviter les doublons

    pickedRewards.push(reward);
  }

  rewards.push(...pickedRewards);

  return rewards;
}

/**
 * Vérifie si un joueur peut débloquer un niveau d'upgrade
 */
export function canUpgrade(currentLevel: number, maxLevel: number): boolean {
  return currentLevel < maxLevel;
}

/**
 * Récupère le prochain niveau d'upgrade
 */
export function getNextUpgradeLevel(upgradeType: 'shield' | 'autoplay' | 'multiplier', currentLevel: number): Reward | null {
  const upgrades = UPGRADES[upgradeType];
  const nextLevel = currentLevel + 1;
  return upgrades.find(u => u.value === nextLevel) || null;
}