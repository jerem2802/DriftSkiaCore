// src/constants/gameplay.ts

import { Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

export const CANVAS_WIDTH = W;
export const CANVAS_HEIGHT = H;

// Ring & Ball
export const RING_RADIUS = CANVAS_WIDTH * 0.25;
export const BALL_RADIUS = 10;

// Speed
export const START_ORBIT_SPEED = 1.2;
export const SPEED_INC_PER_RING = 0.035;
export const SPEED_CAP = 15.0;

// Dash (comportement ancien projet SVG)
export const DASH_BASE = 400;
export const DASH_EXTRA_MAX = 300;
export const DASH_CAP = 1200;
export const GODLIKE_SCORE = 100;

// Gate
export const START_GATE_WIDTH = 1.10;
export const MIN_GATE_WIDTH = 0.30;
export const SHRINK_PER_RING = 0.012;
export const PERFECT_THRESHOLD = 0.15;
export const MISS_MARGIN = 0.06;

// Lives & Streak
export const LIVES_MAX = 3;
export const INVULN_TIME = 600;
export const STREAK_FOR_LIFE = 8;
export const SHIELD_CHARGES_PER_ACTIVATION = 3;

// Auto-play bonus
export const AUTO_PLAY_DURATION = 10000; // 10 secondes
export const AUTOPLAY_SPAWN_CHANCE = 0.08; // 8% par ring

// Orbs geometry / collisions (utilisés pour vie + auto-play)
export const LIFE_ORB_OFFSET = Math.PI;
export const AUTOPLAY_ORB_OFFSET = Math.PI / 2;
export const ORB_COLLISION_DIST = 625;

// Timing
export const DASH_TIMEOUT = 3000;

// Ring generation
export const CENTER_Y_CURRENT = H * 0.6;
export const CENTER_Y_NEXT = H * 0.3;
export const RING_GENERATION_MARGIN = 80;
