import AsyncStorage from '@react-native-async-storage/async-storage';

export type BallUpgrade = {
  autoPlayBonus?: number;      // secondes
  shieldRegenBonus?: number;   // %
  coinAttractionRange?: number; // pixels
  gateWidthBonus?: number;     // radians
};

export type PlayerProfile = {
  v: number;
  totalCoins: number;
  bestScore: number;

  ownedBalls: string[];
  selectedBallId: string;
  
  ballUpgrades: Record<string, BallUpgrade>;

  updatedAt: number;
};

const KEY = 'drift_profile_v1';

const DEFAULT_PROFILE: PlayerProfile = {
  v: 1,
  totalCoins: 0,
  bestScore: 0,

  ownedBalls: ['ball_classic'],
  selectedBallId: 'ball_classic',
  
  ballUpgrades: {
    ball_water: {
      autoPlayBonus: 0.4,
    },
  },

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

    return {
      ...DEFAULT_PROFILE,
      ...p,
      v: 1,
      ownedBalls,
      selectedBallId,
      ballUpgrades: p.ballUpgrades ?? DEFAULT_PROFILE.ballUpgrades,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = async (profile: PlayerProfile): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
};

export const commitRunToProfile = async (params: { coinsEarned: number; score: number }): Promise<PlayerProfile> => {
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
  const next: PlayerProfile = {
    ...p,
    selectedBallId: ballId,
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

export const getActiveBallUpgrade = (profile: PlayerProfile): BallUpgrade | null => {
  const id = profile.selectedBallId;
  return profile.ballUpgrades[id] ?? null;
};