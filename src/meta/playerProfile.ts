import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlayerProfile = {
  v: number;
  totalCoins: number;
  bestScore: number;
  updatedAt: number;
};

const KEY = 'drift_profile_v1';

const DEFAULT_PROFILE: PlayerProfile = {
  v: 1,
  totalCoins: 0,
  bestScore: 0,
  updatedAt: Date.now(),
};

export const loadProfile = async (): Promise<PlayerProfile> => {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT_PROFILE;
  try {
    const p = JSON.parse(raw) as PlayerProfile;
    return {
      ...DEFAULT_PROFILE,
      ...p,
      v: 1,
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
