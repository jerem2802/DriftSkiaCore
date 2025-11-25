import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { BACKGROUND_COLOR, RING_COLORS, BALL_COLOR } from '../constants/colors';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  RING_RADIUS,
  BALL_RADIUS,
  ORBIT_SPEED,
} from '../constants/gameplay';

// petit state minimal pour l'instant
type BasicGameState = {
  angle: number; // angle de la bille en radians
};

const DriftGame: React.FC = () => {
  const [state, setState] = useState<BasicGameState>({ angle: 0 });

  // mini game loop avec setInterval (simple, on optimisera plus tard)
  useEffect(() => {
    let lastTime = Date.now();

    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000; // en secondes
      lastTime = now;

      setState(prev => {
        const nextAngle = (prev.angle + ORBIT_SPEED * dt) % (Math.PI * 2);
        return { ...prev, angle: nextAngle };
      });
    }, 16); // ~60 FPS

    return () => clearInterval(id);
  }, []);

  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;

  // position de la bille sur le ring
  const ballX = centerX + Math.cos(state.angle) * RING_RADIUS;
  const ballY = centerY + Math.sin(state.angle) * RING_RADIUS;

  const ringColor = RING_COLORS[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.canvasWrapper}>
        <Canvas style={styles.canvas}>
          {/* fond */}
          <Circle cx={centerX} cy={centerY} r={CANVAS_WIDTH} color={BACKGROUND_COLOR} />

          {/* ring */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={RING_RADIUS}
            color={ringColor}
          />

          {/* bille */}
          <Circle
            cx={ballX}
            cy={ballY}
            r={BALL_RADIUS}
            color={BALL_COLOR}
          />
        </Canvas>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  canvasWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
});

export default DriftGame;
