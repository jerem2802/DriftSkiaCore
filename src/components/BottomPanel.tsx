// src/components/BottomPanel.tsx
// Panel en bas de l'écran pour afficher/activer les bonus

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

interface BottomPanelProps {
  autoPlayInInventory: boolean;
  autoPlayActive: SharedValue<boolean>;
  autoPlayTimeLeft: SharedValue<number>;
  onActivateAutoPlay: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  autoPlayInInventory,
  autoPlayActive,
  autoPlayTimeLeft,
  onActivateAutoPlay,
}) => {
  const [timeLeftUI, setTimeLeftUI] = React.useState(0);
  const [isActiveUI, setIsActiveUI] = React.useState(false);

  // Sync timer UI
  useAnimatedReaction(
    () => ({ time: autoPlayTimeLeft.value, active: autoPlayActive.value }),
    (state) => {
      runOnJS(setTimeLeftUI)(state.time);
      runOnJS(setIsActiveUI)(state.active);
    }
  );

  // Afficher si en inventory OU si actif
  if (!autoPlayInInventory && !isActiveUI) {
    return null;
  }

  const secondsLeft = Math.ceil(timeLeftUI / 1000);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.bonusButton,
          isActiveUI && styles.bonusButtonActive
        ]}
        onPress={onActivateAutoPlay}
        activeOpacity={0.7}
        disabled={isActiveUI}
      >
        {isActiveUI ? (
          <Text style={styles.timerText}>{secondsLeft}s</Text>
        ) : (
          <View style={styles.autoPlayIcon} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
    borderWidth: 4,
    borderColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusButtonActive: {
    backgroundColor: '#2a1a3a',
  },
  autoPlayIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8b5cf6',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
});