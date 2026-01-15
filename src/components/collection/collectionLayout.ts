// src/components/collection/collectionLayout.ts
import { Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

export const LAYOUT = {
  W,
  H,
  CARD_W: W * 0.82,
  CARD_H: H * 0.72,
  CARD_GAP: 35,
  CARD_RADIUS: 32,
  BORDER_WIDTH: 4,
  BALL_SIZE: 130,
  PARALLAX_INTENSITY: 0.015,
};

export const COLORS = {
  GLASS_BG: 'rgba(20, 10, 35, 0.4)',
  BORDER_START: '#a855f7',
  BORDER_END: '#22d3ee',
  GLOW_PINK: '#ff6bd5',
  GLOW_CYAN: '#22d3ee',
  TEXT_WHITE: '#FFE6FF',
  TEXT_GRAY: '#9CA3AF',
};

export const RARITY_COLORS = {
  common: '#f59e0b',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#ff6bd5',
};

export const getCardX = (index: number) => {
  'worklet';
  return index * (LAYOUT.CARD_W + LAYOUT.CARD_GAP);
};