// src/game/logic/ringGenerator.ts
// Logique de génération des rings

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MOVE_RINGS_SPEED_MIN,
  MOVE_RINGS_SPEED_MAX,
} from '../../constants/gameplay';

interface RingPosition {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
}

/**
 * Génère la position, taille et vitesse d'un nouveau ring
 * Avec anti-imbrication pour éviter overlaps excessifs
 */
export const generateNextRing = (
  currentX: number,
  currentY: number,
  currentR: number,
  baseRadius: number
): RingPosition => {
  'worklet';

  const minDistanceFromEdge = baseRadius * 1.3;
  const spawnZoneWidth = CANVAS_WIDTH - 2 * minDistanceFromEdge;
  const spawnZoneHeight = CANVAS_HEIGHT - 2 * minDistanceFromEdge;

  // Position aléatoire dans zone de spawn
  let x = minDistanceFromEdge + Math.random() * spawnZoneWidth;
  let y = minDistanceFromEdge + Math.random() * spawnZoneHeight;

  // Tailles plus variées (70% → 110% du base radius)
  const r = baseRadius * (0.7 + Math.random() * 0.4);

  // ANTI-IMBRICATION: vérifier distance entre centres
  const distBetweenCenters = Math.sqrt((x - currentX) ** 2 + (y - currentY) ** 2);
  const minDistance = (currentR + r) * 0.6; // Overlap max 40%

  // Si trop proche, re-roll position (1 tentative)
  if (distBetweenCenters < minDistance) {
    x = minDistanceFromEdge + Math.random() * spawnZoneWidth;
    y = minDistanceFromEdge + Math.random() * spawnZoneHeight;
  }

  // Petite vitesse aléatoire pour MoveRings
  const angle = Math.random() * Math.PI * 2;
  const speed =
    MOVE_RINGS_SPEED_MIN +
    Math.random() * (MOVE_RINGS_SPEED_MAX - MOVE_RINGS_SPEED_MIN);

  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  return { x, y, r, vx, vy };
};
