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

  // Shield
  shieldAvailable: boolean;
  shieldArmed: boolean;
  shieldCharges: number;
  onActivateShield: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  autoPlayInInventory,
  autoPlayActive,
  autoPlayTimeLeft,
  onActivateAutoPlay,
  shieldAvailable,
  shieldArmed,
  shieldCharges,
  onActivateShield,
}) => {
  const [timeLeftUI, setTimeLeftUI] = React.useState(0);
  const [isActiveUI, setIsActiveUI] = React.useState(false);

  // Sync timer UI pour l'auto-play
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
        return; // rien de nouveau → pas de runOnJS
      }

      runOnJS(setTimeLeftUI)(state.time);
      runOnJS(setIsActiveUI)(state.active);
    }
  );

  const hasAutoPlayVisible = autoPlayInInventory || isActiveUI;

  // Icône shield visible si :
  // - shield en stock (shieldAvailable)
  // - ou shield armé
  // - ou il reste des charges
  const hasShieldVisible = shieldAvailable || shieldArmed || shieldCharges > 0;

  // Panel visible seulement s'il y a au moins un bonus à afficher
  if (!hasAutoPlayVisible && !hasShieldVisible) {
    return null;
  }

  const secondsLeft = Math.ceil(timeLeftUI / 1000);

  // On peut cliquer sur le shield si :
  // - on a un shield en stock
  // - il n'est pas encore armé
  // (les charges sont gérées par la logique loseLife)
  const canPressShield = shieldAvailable && !shieldArmed;

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
            shieldArmed && styles.shieldButtonArmed,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a1a',
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
