// src/game/fx/coinFxBuffer.ts
// Buffer minimal (prépare la structure pour futures anims coin)

export type CoinFxPool = {
  seed: number;
};

export const createCoinFxPool = (): CoinFxPool => {
  return { seed: 1337 };
};

// RNG worklet-safe (même style que tes autres buffers)
export const rand01 = (pool: CoinFxPool) => {
  'worklet';
  const MOD = 4294967296;
  pool.seed = (pool.seed * 1664525 + 1013904223) % MOD;
  return pool.seed / MOD;
};
