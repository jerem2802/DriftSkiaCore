// src/components/ScreenTransition.tsx
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface ScreenTransitionProps {
  visible: boolean;
  children: React.ReactNode;
  fadeInDuration?: number;
  fadeOutDuration?: number;

  // ✅ NEW (par défaut false) : ne démonte jamais le contenu
  keepMounted?: boolean;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  visible,
  children,
  fadeInDuration = 2000,
  fadeOutDuration = 2000,
  keepMounted = false,
}) => {
  const opacity = useSharedValue(visible ? 1 : 0);
  const [shouldRender, setShouldRender] = React.useState(keepMounted ? true : visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      opacity.value = withTiming(1, {
        duration: fadeInDuration,
        easing: Easing.out(Easing.ease),
      });
    } else {
      opacity.value = withTiming(
        0,
        {
          duration: fadeOutDuration,
          easing: Easing.in(Easing.ease),
        },
        (finished) => {
          if (!finished) return;
          if (keepMounted) return; // ✅ ne démonte pas
          runOnJS(setShouldRender)(false);
        }
      );
    }
  }, [visible, fadeInDuration, fadeOutDuration, opacity, keepMounted]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animatedStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  );
};
