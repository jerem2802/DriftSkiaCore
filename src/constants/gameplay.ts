// src/constants/gameplay.ts

import { Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

export const CANVAS_WIDTH = W;
export const CANVAS_HEIGHT = H;

// Ring & Ball
export const RING_RADIUS = W * 0.35;
export const BALL_RADIUS = 10;

// Speed
export const START_ORBIT_SPEED = 1.2;
export const SPEED_INC_PER_RING = 0.035;
export const SPEED_CAP = 10.0;
export const DASH_SPEED = 620;

// Gate
export const START_GATE_WIDTH = 1.10;
export const MIN_GATE_WIDTH = 0.30;
export const SHRINK_PER_RING = 0.012;
export const PERFECT_THRESHOLD = 0.15;
export const MISS_MARGIN = 0.06;

// Lives
export const LIVES_MAX = 3;
export const INVULN_TIME = 600; // ms

// Timing
export const DASH_TIMEOUT = 3000; // ms

// Ring generation
export const CENTER_Y_CURRENT = H * 0.6;
export const CENTER_Y_NEXT = H * 0.3;
export const RING_GENERATION_MARGIN = 80;