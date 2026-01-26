// src/meta/playerProfile.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Reward } from '../config/bonusConfig';

export type BallUpgrade = {
  autoPlayBonus?: number;
  shieldRegenBonus?: number;
  coinAttractionRange?: number;
  gateWidthBonus?: number;
};

export type ChestStatus = 'locked' | 'countdown' | 'ready';

export interface ChestData {
  id: 'bronze' | 'silver' | 'neon';
  status: ChestStatus;
  unlockCondition?: {
    type: 'score' | 'coins';
    value: number;
  };
  unlockTimestamp?: number;
  countdownDuration?: number;
  adsWatched?: number;
  openPrice?: number;
}

export type PlayerProfile = {
  v: number;
  playerName: string;
  avatarId: string;
  totalCoins: number;
  bestScore: number;
  ownedBalls: string[];
  selectedBallId: string;
  ballUpgrades: Record<string, BallUpgrade>;
  upgrades: {
    shieldBank: number;
    autoPlayBank: number;
    multiplier: number;
  };
  chests: {
    bronze: ChestData;
    silver: ChestData;
    neon: ChestData;
  };
  isPremium: boolean; // ✅ NOUVEAU
  updatedAt: number;
};

const KEY = 'drift_profile_v1';

const DEFAULT_PROFILE: PlayerProfile = {
  v: 1,
  playerName: 'Player',
  avatarId: 'a01',
  totalCoins: 50000,
  bestScore: 1000,
  ownedBalls: ['ball_classic'],
  selectedBallId: 'ball_classic',
  ballUpgrades: {
    ball_water: {
      autoPlayBonus: 0.4,
    },
  },
  upgrades: {
    shieldBank: 1,
    autoPlayBank: 1,
    multiplier: 1,
  },
  chests: {
    bronze: {
      id: 'bronze',
      status: 'locked',
      unlockCondition: { type: 'score', value: 10 },
    },
    silver: {
      id: 'silver',
      status: 'locked',
      unlockCondition: { type: 'score', value: 20 },
    },
    neon: {
      id: 'neon',
      status: 'locked',
      unlockCondition: { type: 'coins', value: 0 },
      openPrice: 0,
    },
  },
  isPremium: false, // ✅ NOUVEAU
  updatedAt: Date.now(),
};

export const loadProfile = async (): Promise<PlayerProfile> => {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT_PROFILE;

  try {
    const p = JSON.parse(raw) as Partial<PlayerProfile>;

    const ownedRaw = Array.isArray(p.ownedBalls) ? p.ownedBalls : DEFAULT_PROFILE.ownedBalls;
    const ownedBalls = ownedRaw.map((x) => (x === 'core' ? 'ball_classic' : x));

    const selectedBallIdRaw =
      typeof p.selectedBallId === 'string' ? p.selectedBallId : DEFAULT_PROFILE.selectedBallId;
    const selectedBallId = selectedBallIdRaw === 'core' ? 'ball_classic' : selectedBallIdRaw;

    const playerName =
      typeof (p as any).playerName === 'string' ? (p as any).playerName : DEFAULT_PROFILE.playerName;

    const avatarId =
      typeof (p as any).avatarId === 'string' ? (p as any).avatarId : DEFAULT_PROFILE.avatarId;

    const isPremium =
      typeof (p as any).isPremium === 'boolean' ? (p as any).isPremium : DEFAULT_PROFILE.isPremium;

    return {
      ...DEFAULT_PROFILE,
      ...p,
      v: 1,
      playerName,
      avatarId,
      isPremium, // ✅ NOUVEAU
      ownedBalls,
      selectedBallId,
      ballUpgrades: p.ballUpgrades ?? DEFAULT_PROFILE.ballUpgrades,
      upgrades: {
        ...DEFAULT_PROFILE.upgrades,
        ...(p as any).upgrades,
      },
      chests: {
        bronze: { ...DEFAULT_PROFILE.chests.bronze, ...(p.chests as any)?.bronze },
        silver: { ...DEFAULT_PROFILE.chests.silver, ...(p.chests as any)?.silver },
        neon: { ...DEFAULT_PROFILE.chests.neon, ...(p.chests as any)?.neon },
      },
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = async (profile: PlayerProfile): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
};

export const commitRunToProfile = async (params: {
  coinsEarned: number;
  score: number;
}): Promise<PlayerProfile> => {
  const p = await loadProfile();
  const next: PlayerProfile = {
    ...p,
    totalCoins: p.totalCoins + Math.max(0, params.coinsEarned),
    bestScore: Math.max(p.bestScore, params.score),
    updatedAt: Date.now(),
  };
  await saveProfile(next);
  return next;
};

export const setSelectedBall = async (ballId: string): Promise<PlayerProfile> => {
  const p = await loadProfile();
  const next: PlayerProfile = { ...p, selectedBallId: ballId, updatedAt: Date.now() };
  await saveProfile(next);
  return next;
};

export const setPlayerIdentity = async (params: { playerName: string; avatarId: string }): Promise<PlayerProfile> => {
  const p = await loadProfile();

  const cleanName = (params.playerName || '').trim().slice(0, 8) || 'Player';
  const cleanAvatar = (params.avatarId || 'a01').trim() || 'a01';

  const next: PlayerProfile = {
    ...p,
    playerName: cleanName,
    avatarId: cleanAvatar,
    updatedAt: Date.now(),
  };

  await saveProfile(next);
  return next;
};

export const setPlayerName = async (name: string): Promise<PlayerProfile> => {
  const p = await loadProfile();
  const clean = (name || '').trim().slice(0, 8);
  const next: PlayerProfile = {
    ...p,
    playerName: clean || 'Player',
    updatedAt: Date.now(),
  };
  await saveProfile(next);
  return next;
};

export const purchaseBall = async (ballId: string, price: number): Promise<PlayerProfile> => {
  const p = await loadProfile();
  if (p.ownedBalls.includes(ballId)) return p;
  if (p.totalCoins < price) return p;

  const next: PlayerProfile = {
    ...p,
    totalCoins: p.totalCoins - price,
    ownedBalls: [...p.ownedBalls, ballId],
    updatedAt: Date.now(),
  };
  await saveProfile(next);
  return next;
};

// ✅ NOUVEAU: Purchase Remove Ads
export const purchaseRemoveAds = async (): Promise<PlayerProfile> => {
  const p = await loadProfile();
  const next: PlayerProfile = {
    ...p,
    isPremium: true,
    updatedAt: Date.now(),
  };
  await saveProfile(next);
  return next;
};

export const getActiveBallUpgrade = (profile: PlayerProfile): BallUpgrade | null => {
  const id = profile.selectedBallId;
  return profile.ballUpgrades[id] ?? null;
};

export function canUnlockChest(chest: ChestData, playerScore: number, playerCoins: number): boolean {
  if (chest.status !== 'locked') return false;
  if (!chest.unlockCondition) return false;

  if (chest.unlockCondition.type === 'score') return playerScore >= chest.unlockCondition.value;
  if (chest.unlockCondition.type === 'coins') return playerCoins >= chest.unlockCondition.value;

  return false;
}

export function unlockChest(chest: ChestData): ChestData {
  const countdownDurations = {
    bronze: 6 * 3600,
    silver: 12 * 3600,
    neon: 24 * 3600,
  };

  return {
    ...chest,
    status: 'countdown',
    unlockTimestamp: Date.now(),
    countdownDuration: countdownDurations[chest.id],
    adsWatched: 0,
  };
}

export function getRemainingTime(chest: ChestData): number {
  if (chest.status !== 'countdown') return 0;
  if (!chest.unlockTimestamp || !chest.countdownDuration) return 0;

  const elapsedSeconds = Math.floor((Date.now() - chest.unlockTimestamp) / 1000);
  const remainingSeconds = chest.countdownDuration - elapsedSeconds;

  return Math.max(0, remainingSeconds);
}

export function isChestReady(chest: ChestData): boolean {
  if (chest.status === 'ready') return true;
  if (chest.status === 'countdown') return getRemainingTime(chest) === 0;
  return false;
}

export function setChestReady(chest: ChestData): ChestData {
  return { ...chest, status: 'ready' };
}

export function watchAd(chest: ChestData): ChestData {
  if (chest.status !== 'countdown') return chest;
  if (!chest.countdownDuration || !chest.unlockTimestamp) return chest;

  const THREE_HOURS = 3 * 3600;

  const elapsedSeconds = Math.floor((Date.now() - chest.unlockTimestamp) / 1000);
  const currentRemaining = chest.countdownDuration - elapsedSeconds;

  const newRemaining = Math.max(0, currentRemaining - THREE_HOURS);

  return {
    ...chest,
    unlockTimestamp: Date.now(),
    countdownDuration: newRemaining,
    adsWatched: (chest.adsWatched || 0) + 1,
  };
}

export function openChest(chest: ChestData): ChestData {
  return {
    id: chest.id,
    status: 'locked',
    unlockCondition: chest.unlockCondition,
    openPrice: chest.openPrice,
  };
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
}

export const updateChestInProfile = async (
  chestId: 'bronze' | 'silver' | 'neon',
  updatedChest: ChestData
): Promise<PlayerProfile> => {
  const p = await loadProfile();
  const next: PlayerProfile = {
    ...p,
    chests: { ...p.chests, [chestId]: updatedChest },
    updatedAt: Date.now(),
  };
  await saveProfile(next);
  return next;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function applyRewardsToProfile(profile: PlayerProfile, rewards: Reward[]): PlayerProfile {
  let next: PlayerProfile = { ...profile };

  for (const r of rewards) {
    if (!r) continue;

    if (r.type === 'coins') {
      const add = Math.max(0, r.value ?? 0);
      next = { ...next, totalCoins: next.totalCoins + add };
      continue;
    }

    if (r.type === 'ball') {
      if (!next.ownedBalls.includes(r.id)) {
        next = { ...next, ownedBalls: [...next.ownedBalls, r.id] };
      }
      continue;
    }

    if (r.type === 'upgrade_shield') {
      const cur = next.upgrades.shieldBank ?? 1;
      next = { ...next, upgrades: { ...next.upgrades, shieldBank: clamp(cur + 1, 1, 4) } };
      continue;
    }

    if (r.type === 'upgrade_autoplay') {
      const cur = next.upgrades.autoPlayBank ?? 1;
      next = { ...next, upgrades: { ...next.upgrades, autoPlayBank: clamp(cur + 1, 1, 4) } };
      continue;
    }

    if (r.type === 'upgrade_multiplier') {
      const cur = next.upgrades.multiplier ?? 1;
      next = { ...next, upgrades: { ...next.upgrades, multiplier: clamp(cur + 1, 1, 6) } };
      continue;
    }
  }

  return { ...next, updatedAt: Date.now() };
}

export const claimChestRewards = async (
  chestId: 'bronze' | 'silver' | 'neon',
  rewards: Reward[]
): Promise<PlayerProfile> => {
  const p = await loadProfile();

  const withRewards = applyRewardsToProfile(p, rewards);
  const resetChest = openChest(withRewards.chests[chestId]);

  const next: PlayerProfile = {
    ...withRewards,
    chests: { ...withRewards.chests, [chestId]: resetChest },
    updatedAt: Date.now(),
  };

  await saveProfile(next);
  return next;
};

export const resetProfileForDev = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEY);
  console.log('✅ Profil reset ! Le DEFAULT_PROFILE sera rechargé au prochain loadProfile()');
};