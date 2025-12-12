// src/game/logic/scoreRules.ts
// Règles de gain de points (worklet-safe)

export interface ComputeGainedPointsParams {
  basePoints: number;
  streakAfterThisRing: number;
}

// Garde-fou : max points par ring (ne change rien aujourd'hui car max théorique = 2 * 4 = 8)
const GAIN_CAP = 8;

export const computeGainedPoints = (params: ComputeGainedPointsParams): number => {
  'worklet';
  const { basePoints, streakAfterThisRing } = params;

  let mult = 1;
  if (streakAfterThisRing >= 20) mult = 4;
  else if (streakAfterThisRing >= 10) mult = 3;
  else if (streakAfterThisRing >= 5) mult = 2;

  const gained = basePoints * mult;
  return gained > GAIN_CAP ? GAIN_CAP : gained;
};
