// src/game/logic/collisionDetection.ts
// Logique de collision et détection

import { normalizeAngle, insideRing as insideRingUtil } from '../../utils/math';
import { MISS_MARGIN } from '../../constants/gameplay';

/**
 * Vérifie si le tap est valide (dans la gate avec marge)
 * @returns 'hit' | 'miss' | 'ignored'
 */
export const validateTap = (
  angle: number,
  gateAngle: number,
  gateWidth: number
): 'hit' | 'miss' | 'ignored' => {
  'worklet';

  const half = gateWidth / 2;
  const gA = normalizeAngle(gateAngle);
  const bA = normalizeAngle(angle);
  let delta = Math.abs(gA - bA);
  if (delta > Math.PI) {
    delta = 2 * Math.PI - delta;
  }

  if (delta <= half + 0.2) {
    return 'hit';
  } else if (delta > half + MISS_MARGIN) {
    return 'miss';
  }
  return 'ignored';
};

/**
 * Vérifie si la bille est entrée dans le ring
 */
export const insideRing = (
  ballX: number,
  ballY: number,
  ringX: number,
  ringY: number,
  ringR: number
): boolean => {
  'worklet';
  return insideRingUtil(ballX, ballY, ringX, ringY, ringR);
};