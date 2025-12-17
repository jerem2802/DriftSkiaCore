// src/components/GameOverOverlay.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface GameOverOverlayProps {
  visible: boolean;
  score: number;
  bestScore: number;
  coinsEarned: number;
  canContinue: boolean;
  onRestart: () => void;
  onShare: () => void;
  onWatchAd: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  visible,
  score,
  bestScore,
  coinsEarned,
  canContinue,
  onRestart,
  onShare,
  onWatchAd,
}) => {
  if (!visible) {
    return null;
  }

  const continueOpacity = canContinue ? 1 : 0.4;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>GAME OVER</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Score final</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Neon Coins gagnés</Text>
          <Text style={styles.scoreValue}>+{coinsEarned}</Text>
        </View>

        <Text style={styles.subtitle}>Continue, tu vas y arriver ! 💪</Text>

        <TouchableOpacity
          style={[styles.continueButton, { opacity: continueOpacity }]}
          onPress={onWatchAd}
          disabled={!canContinue}
        >
          <Text style={styles.continueTitle}>📺 CONTINUE (+1❤️)</Text>
          <Text style={styles.continueSubtitle}>
            {canContinue ? 'Regarder une pub' : 'Déjà utilisé'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartText}>⟲ RESTART</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={onShare}>
          <Text style={styles.shareText}>📱 PARTAGER</Text>
        </TouchableOpacity>

        <Text style={styles.bestScoreText}>
          Meilleur score : <Text style={styles.bestScoreValue}>{bestScore}</Text> 🏆
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '80%',
    maxWidth: 360,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  scoreCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2933',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#020617',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    color: '#e5e7eb',
    fontSize: 16,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: '#e5e7eb',
    fontSize: 14,
    marginBottom: 18,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#22c55e',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  continueTitle: {
    color: '#022c22',
    fontSize: 16,
    fontWeight: '800',
  },
  continueSubtitle: {
    color: '#022c22',
    fontSize: 12,
  },
  restartButton: {
    width: '100%',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1d4ed8',
    backgroundColor: '#020617',
  },
  restartText: {
    color: '#bfdbfe',
    fontSize: 15,
    fontWeight: '700',
  },
  shareButton: {
    width: '100%',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#6d28d9',
    backgroundColor: '#020617',
  },
  shareText: {
    color: '#e9d5ff',
    fontSize: 15,
    fontWeight: '700',
  },
  bestScoreText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  bestScoreValue: {
    fontWeight: '800',
  },
});
