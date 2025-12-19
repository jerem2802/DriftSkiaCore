// src/game/effects/PlasmaEffects.tsx
import React from 'react';
import { Line } from '@shopify/react-native-skia';
import { 
  useFrameCallback, 
  useSharedValue, 
  useDerivedValue, 
  type SharedValue
} from 'react-native-reanimated';

const LIGHTNING_RADIUS = 180;
const LIGHTNING_SEGMENTS = 5;
const MAX_LINES = 20;
const REFRESH_EVERY = 2;

const seededRandom = (seed: number) => {
  'worklet';
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

type LineSegment = {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  visible: boolean;
  opacity: number;
};

type Props = {
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
  orbs: Array<{
    x: any;
    y: any;
    visible: any;
  }>;
};

// Composant séparé pour chaque ligne
const LightningLine: React.FC<{ 
  allSegments: SharedValue<LineSegment[]>; 
  index: number 
}> = ({ allSegments, index }) => {
  const segment = useDerivedValue(() => allSegments.value[index] || { p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 }, visible: false, opacity: 0 });
  const p1 = useDerivedValue(() => segment.value.p1);
  const p2 = useDerivedValue(() => segment.value.p2);
  const opacity = useDerivedValue(() => segment.value.visible ? segment.value.opacity : 0);
  
  return (
    <Line
      p1={p1}
      p2={p2}
      color="rgba(100, 200, 255, 1)"
      strokeWidth={1.8}
      opacity={opacity}
    />
  );
};

export const PlasmaEffects: React.FC<Props> = ({ ballX, ballY, orbs }) => {
  const tick = useSharedValue(0);

  useFrameCallback(() => {
    'worklet';
    tick.value = tick.value + 1;
  });

  const lines = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < MAX_LINES; i++) {
      result.push(i);
    }
    return result;
  }, []);

  const allSegments = useDerivedValue<LineSegment[]>(() => {
    'worklet';
    
    const refreshTick = Math.floor(tick.value / REFRESH_EVERY);
    const bx = ballX.value;
    const by = ballY.value;
    
    const segments: LineSegment[] = [];
    let seedCounter = refreshTick;

    const nearbyOrbs: Array<{ x: number; y: number }> = [];
    orbs.forEach(orb => {
      if (orb.visible.value > 0) {
        const ox = orb.x.value;
        const oy = orb.y.value;
        const dx = ox - bx;
        const dy = oy - by;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LIGHTNING_RADIUS) {
          nearbyOrbs.push({ x: ox, y: oy });
        }
      }
    });

    nearbyOrbs.forEach((orb) => {
      let prevX = bx;
      let prevY = by;
      
      for (let i = 1; i <= LIGHTNING_SEGMENTS; i++) {
        seedCounter++;
        const t = i / LIGHTNING_SEGMENTS;
        const baseX = bx + (orb.x - bx) * t;
        const baseY = by + (orb.y - by) * t;
        
        const angle = Math.atan2(orb.y - by, orb.x - bx);
        const perpAngle = angle + Math.PI / 2;
        
        const midFactor = Math.sin(t * Math.PI);
        const offset = (seededRandom(seedCounter) - 0.5) * 40 * midFactor;
        
        const nextX = baseX + Math.cos(perpAngle) * offset;
        const nextY = baseY + Math.sin(perpAngle) * offset;
        
        const segmentOpacity = 0.7 + seededRandom(seedCounter + 1000) * 0.3;
        
        segments.push({
          p1: { x: prevX, y: prevY },
          p2: { x: nextX, y: nextY },
          visible: true,
          opacity: segmentOpacity,
        });
        
        prevX = nextX;
        prevY = nextY;
      }
    });

    while (segments.length < MAX_LINES) {
      segments.push({
        p1: { x: 0, y: 0 },
        p2: { x: 0, y: 0 },
        visible: false,
        opacity: 0,
      });
    }

    return segments;
  });

  return (
    <>
      {lines.map((i) => (
        <LightningLine key={i} allSegments={allSegments} index={i} />
      ))}
    </>
  );
};