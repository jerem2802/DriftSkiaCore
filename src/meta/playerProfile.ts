import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlayerProfile = {
  v: number;
  totalCoins: number;
  bestScore: number;

  // ✅ Shop
  ownedItems: Record<string, true>;
  selectedBallId: string;

  updatedAt: number;
};

const KEY = 'drift_profile_v1';

const DEFAULT_PROFILE: PlayerProfile = {
  v: 1,
  totalCoins: 0,
  bestScore: 0,

  ownedItems: { 'ball_classic': true }, // ✅ au moins 1 bille gratuite
  selectedBallId: 'ball_classic',

  updatedAt: Date.now(),
};

export const loadProfile = async (): Promise<PlayerProfile> => {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT_PROFILE;
  try {
    const p = JSON.parse(raw) as Partial<PlayerProfile>;
    return {
      ...DEFAULT_PROFILE,
      ...p,
      v: 1,
      ownedItems: { ...DEFAULT_PROFILE.ownedItems, ...(p.ownedItems ?? {}) },
      selectedBallId: p.selectedBallId ?? DEFAULT_PROFILE.selectedBallId,
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

// ✅ Helpers Shop (MVP)
export const purchaseItem = async (itemId: string, price: number): Promise<PlayerProfile> => {
  const p = await loadProfile();
  if (p.ownedItems[itemId]) return p;
  if (p.totalCoins < price) return p;

  const next: PlayerProfile = {
    ...p,
    totalCoins: p.totalCoins - price,
    ownedItems: { ...p.ownedItems, [itemId]: true },
    updatedAt: Date.now(),
  };
  await saveProfile(next);
  return next;
};

export const selectBall = async (ballId: string): Promise<PlayerProfile> => {
  const p = await loadProfile();
  if (!p.ownedItems[ballId]) return p;

  const next: PlayerProfile = {
    ...p,
    selectedBallId: ballId,
    updatedAt: Date.now(),
  };
  await saveProfile(next);
  return next;
};
