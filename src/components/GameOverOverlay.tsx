// src/components/GameOverOverlay.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface GameOverOverlayProps {
  visible: boolean;
  score: number;
  bestScore: number;
  coinsEarned: number;
  totalCoins: number;
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
  totalCoins,
  canContinue,
  onRestart,
  onShare,
  onWatchAd,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* HEADER ART */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/menu_driftring_header.png')}
            style={styles.headerImage}
            resizeMode="cover"
          />

          {/* overlay sombre pour lisibilité */}
          <View pointerEvents="none" style={styles.headerShade} />
          <View pointerEvents="none" style={styles.headerGlowLine} />

          <View style={styles.headerContent}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>RUN END</Text>
              </View>
            </View>

            <Text style={styles.title}>GAME OVER</Text>
            <Text style={styles.subtitle}>Encore un run. Ça passe.</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={[styles.statTile, styles.statTileCyan]}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>

          <View style={[styles.statTile, styles.statTilePurple]}>
            <Text style={styles.statLabel}>Best</Text>
            <Text style={styles.statValue}>{bestScore}</Text>
          </View>
        </View>

        {/* COINS GROUP */}
        <View style={styles.coinsRow}>
          <View style={[styles.coinsChip, styles.coinsChipLeft]}>
            <View style={styles.coinDot} />
            <Text style={styles.coinsChipLabel}>Coins run</Text>
            <Text style={styles.coinsChipValue}>+{coinsEarned}</Text>
          </View>

          <View style={styles.coinsChip}>
            <View style={styles.coinDot} />
            <Text style={styles.coinsChipLabel}>Total</Text>
            <Text style={styles.coinsChipValue}>{totalCoins}</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
          onPress={onWatchAd}
          disabled={!canContinue}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryTitle}>CONTINUE</Text>
          <Text style={styles.primarySubtitle}>
            {canContinue ? '+1 vie (pub)' : 'Déjà utilisé'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onRestart} activeOpacity={0.9}>
            <Text style={styles.secondaryText}>RESTART</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButtonAlt}
            onPress={onShare}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryText}>PARTAGER</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerHint}>Tip: vise la gate au dernier quart, c’est plus stable.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: '#050a18',
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },

  header: {
    height: 138,
    backgroundColor: '#020617',
  },

  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.95,
  },

  headerShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2,6,23,0.55)',
  },

  headerGlowLine: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
    height: 2,
    backgroundColor: 'rgba(34,211,238,0.35)',
  },

  headerContent: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(34,211,238,0.10)',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#22d3ee',
    marginRight: 8,
    shadowColor: '#22d3ee',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  badgeText: {
    color: '#22d3ee',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  statTile: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,23,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(30,41,59,0.95)',
  },
  statTileCyan: {
    marginRight: 10,
    borderColor: 'rgba(34,211,238,0.28)',
  },
  statTilePurple: {
    borderColor: 'rgba(139,92,246,0.28)',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },

  coinsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  coinsChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(251,191,36,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
  },
  coinsChipLeft: {
    marginRight: 10,
  },
  coinDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#fbbf24',
    marginRight: 8,
    shadowColor: '#fbbf24',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  coinsChipLabel: {
    color: '#fde68a',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 8,
  },
  coinsChipValue: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 'auto',
  },

  primaryButton: {
    marginHorizontal: 14,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.55)',
    shadowColor: '#22c55e',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryTitle: {
    color: '#052e16',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  primarySubtitle: {
    color: '#052e16',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
  },

  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,23,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.30)',
    marginRight: 10,
  },
  secondaryButtonAlt: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,23,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.30)',
  },
  secondaryText: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  footerHint: {
    color: 'rgba(203,213,225,0.75)',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
});
