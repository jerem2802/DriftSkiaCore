// src/components/BottomPanel.tsx
// Panel en bas de l'écran pour afficher/activer les bonus

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

interface BottomPanelProps {
  // Auto-play
  autoPlayInInventory: SharedValue<boolean>;
  autoPlayActive: SharedValue<boolean>;
  autoPlayTimeLeft: SharedValue<number>;
  onActivateAutoPlay: () => void;

  // Shield
  shieldAvailable: SharedValue<boolean>;
  shieldArmed: SharedValue<boolean>;
  onActivateShield: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  autoPlayInInventory,
  autoPlayActive,
  autoPlayTimeLeft,
  onActivateAutoPlay,
  shieldAvailable,
  shieldArmed,
  onActivateShield,
}) => {
  const [timeLeftUI, setTimeLeftUI] = React.useState(0);
  const [isActiveUI, setIsActiveUI] = React.useState(false);

  const [autoPlayInInventoryUI, setAutoPlayInInventoryUI] = React.useState(
    autoPlayInInventory.value
  );
  const [shieldAvailableUI, setShieldAvailableUI] = React.useState(
    shieldAvailable.value
  );
  const [shieldArmedUI, setShieldArmedUI] = React.useState(
    shieldArmed.value
  );

  // Sync timer UI (on met à jour le JS seulement si la seconde affichée change
  // ou si l'état actif/inactif change)
  useAnimatedReaction(
    () => ({
      time: autoPlayTimeLeft.value,
      active: autoPlayActive.value,
    }),
    (state, prev) => {
      const currentSecond = Math.ceil(state.time / 1000);
      const prevSecond = prev != null ? Math.ceil(prev.time / 1000) : null;

      const activeChanged = !prev || prev.active !== state.active;
      const secondChanged = !prev || currentSecond !== prevSecond;

      if (!activeChanged && !secondChanged) {
        return;
      }

      runOnJS(setTimeLeftUI)(state.time);
      runOnJS(setIsActiveUI)(state.active);
    }
  );

  // Sync inventaire Auto-Play
  useAnimatedReaction(
    () => autoPlayInInventory.value,
    (val, prev) => {
      if (prev === val) return;
      runOnJS(setAutoPlayInInventoryUI)(val);
    }
  );

  // Sync shield disponible / armé
  useAnimatedReaction(
    () => ({
      available: shieldAvailable.value,
      armed: shieldArmed.value,
    }),
    (state, prev) => {
      if (prev && prev.available === state.available && prev.armed === state.armed) {
        return;
      }
      runOnJS(setShieldAvailableUI)(state.available);
      runOnJS(setShieldArmedUI)(state.armed);
    }
  );

  const hasAutoPlayVisible = autoPlayInInventoryUI || isActiveUI;
  const hasShieldVisible = shieldAvailableUI || shieldArmedUI;

  const secondsLeft = Math.ceil(timeLeftUI / 1000);
  const canPressShield = shieldAvailableUI && !shieldArmedUI;

  return (
    <View style={styles.container}>
      {hasAutoPlayVisible && (
        <TouchableOpacity
          style={[
            styles.bonusButton,
            styles.autoPlayButton,
            isActiveUI && styles.bonusButtonActive,
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
      )}

      {hasShieldVisible && (
        <TouchableOpacity
          style={[
            styles.bonusButton,
            styles.shieldButton,
            shieldArmedUI && styles.shieldButtonArmed,
            !canPressShield && styles.bonusButtonDisabled,
          ]}
          onPress={onActivateShield}
          activeOpacity={0.7}
          disabled={!canPressShield}
        >
          <Text style={styles.shieldIconText}>🛡</Text>
        </TouchableOpacity>
      )}
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
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusButtonActive: {
    backgroundColor: '#2a1a3a',
  },
  bonusButtonDisabled: {
    opacity: 0.4,
  },
  autoPlayButton: {
    borderColor: '#8b5cf6',
  },
  autoPlayIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8b5cf6',
  },
  shieldButton: {
    marginLeft: 24,
    borderColor: '#22d3ee',
    backgroundColor: '#0b1120',
  },
  shieldButtonArmed: {
    backgroundColor: '#022c3a',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  shieldIconText: {
    fontSize: 40,
  },
});
