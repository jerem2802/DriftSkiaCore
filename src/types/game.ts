export interface Position {
  x: number;
  y: number;
}

export interface Ring {
  cx: number;
  cy: number;
  r: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export type BonusType =
  | 'AUTO_PLAY'
  | 'GATE_WIDE'
  | 'SCORE_MULTIPLIER'
  | 'EXTRA_LIFE';

export interface BonusPickup {
  id: string;
  type: BonusType;
  x: number;
  y: number;
  color: string;
}

export interface ActiveBonus {
  type: BonusType;
  startTime: number;
  duration: number;
}

export interface BonusRule {
  requiredStreak: number;
  maxStack?: number;
  duration?: number;
  spawnChance?: number;
  multiplier?: number;
  widthMultiplier?: number;
}

export type GameMode = 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface GameState {
  // Ball
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  angle: number;
  angularVelocity: number;

  // Ring
  ring: Ring;
  gateAngle: number;
  gateWidth: number;
  ringColors: string[];

  // Scoring
  score: number;
  streak: number;
  combo: number;
  highScore: number;

  // Lives
  lives: number;
  maxLives: number;

  // Bonus
  bonuses: ActiveBonus[];
  bonusPickups: BonusPickup[];

  // Particles
  particles: Particle[];

  // Game flow
  mode: GameMode;
  difficulty: number;
  ringsPassed: number;

  // Rainbow mode
  isRainbowMode: boolean;
  rainbowEndTime: number;
}

export interface PhysicsConfig {
  friction: number;
  maxSpeed: number;
  tapForce: number;
  angularDamping: number;
}

export interface DifficultyConfig {
  baseRingRadius: number;
  baseGateWidth: number;
  minRingRadius: number;
  maxRingRadius: number;
  radiusDecrement: number;
  pickupInteractionRadius: number;
}

export interface AchievementType {
  name: string;
  threshold: number;
  score: number;
  color: string;
}
