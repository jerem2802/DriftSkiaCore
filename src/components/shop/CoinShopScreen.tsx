import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import type { PlayerProfile } from '../../meta/playerProfile';

type CoinPack = {
  id: string;
  coins: number;
  price: string; // fallback
  priceValue: number;
  badge?: 'BEST VALUE' | 'POPULAR' | 'ULTIMATE';
  bonus?: number; // %
  sku?: string; // Google Play product ID
};

type Props = {
  profile: PlayerProfile;
  onBack: () => void;
  onProfileUpdate: () => void;
  onBuyPack: (sku: string, coins: number) => Promise<void>;

  iapReady: boolean;
  pricesBySku: Record<string, string>;
};

const COIN_PACKS: CoinPack[] = [
  { id: 'starter', coins: 2500, price: '€0.99', priceValue: 0.99, badge: 'BEST VALUE', sku: 'coins_pack_2500' },
  { id: 'small', coins: 8000, price: '€2.99', priceValue: 2.99, sku: 'coins_small_299' },
  { id: 'medium', coins: 15000, price: '€4.99', priceValue: 4.99, badge: 'POPULAR', sku: 'coins_medium_499' },
  { id: 'large', coins: 35000, price: '€9.99', priceValue: 9.99, bonus: 5, sku: 'coins_large_999' },
  { id: 'mega', coins: 80000, price: '€19.99', priceValue: 19.99, bonus: 10, badge: 'BEST VALUE', sku: 'coins_mega_1999' },
  { id: 'ultimate', coins: 250000, price: '€49.99', priceValue: 49.99, bonus: 25, badge: 'ULTIMATE', sku: 'coins_ultimate_4999' },
];

export const CoinShopScreen: React.FC<Props> = ({
  profile,
  onBack,
  onProfileUpdate,
  onBuyPack,
  iapReady,
  pricesBySku,
}) => {
  const { width } = useWindowDimensions();

  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePurchase = async (pack: CoinPack) => {
    if (!pack.sku) return;

    if (!iapReady) {
      setErrorMsg('Shop not ready yet (products loading)…');
      return;
    }

    setErrorMsg(null);
    setPurchasing(pack.id);

    try {
      await onBuyPack(pack.sku, pack.coins);
      onProfileUpdate();

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } catch (err: any) {
      console.error('Purchase failed:', err);
      setErrorMsg(err?.message ? String(err.message) : 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const COLS = width > 400 ? 2 : 1;
  const H_PADDING = 18;
  const GAP = 14;
  const available = Math.max(280, width - H_PADDING * 2);
  const CARD_W = COLS === 2 ? (available - GAP) / 2 : available;

  const formatCoins = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backTxt}>←</Text>
        </Pressable>
        <Text style={styles.title}>COIN SHOP</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>YOUR BALANCE</Text>
        <View style={styles.balancePill}>
          <View style={styles.coinIcon} />
          <Text style={styles.balanceValue}>{formatCoins(profile.totalCoins)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: H_PADDING }]}
        showsVerticalScrollIndicator={false}
      >
        {!iapReady && (
          <View style={styles.iapNotice}>
            <Text style={styles.iapNoticeText}>Loading shop…</Text>
          </View>
        )}

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <View style={[styles.grid, { gap: GAP }]}>
          {COIN_PACKS.map((pack) => {
            const isPurchasing = purchasing === pack.id;
            const localizedPrice = pack.sku ? pricesBySku[pack.sku] : undefined;
            const displayPrice = localizedPrice ?? pack.price;

            const disabled = !iapReady || isPurchasing || purchasing !== null;

            return (
              <Pressable
                key={pack.id}
                onPress={() => handlePurchase(pack)}
                disabled={disabled}
                style={[
                  styles.packCard,
                  { width: CARD_W },
                  !iapReady && styles.packCardDisabled,
                ]}
                hitSlop={8}
              >
                {pack.badge && (
                  <View
                    style={[
                      styles.badge,
                      pack.badge === 'ULTIMATE' && styles.badgeUltimate,
                      pack.badge === 'BEST VALUE' && styles.badgeBestValue,
                      pack.badge === 'POPULAR' && styles.badgePopular,
                    ]}
                  >
                    <Text style={styles.badgeText}>{pack.badge}</Text>
                  </View>
                )}

                <View style={styles.packIconContainer}>
                  <View style={styles.packCoinIcon} />
                  <Text style={styles.packCoins}>{formatCoins(pack.coins)}</Text>
                </View>

                {pack.bonus && (
                  <View style={styles.bonusPill}>
                    <Text style={styles.bonusText}>+{pack.bonus}% BONUS</Text>
                  </View>
                )}

                <View style={styles.priceContainer}>
                  {isPurchasing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.price}>{displayPrice}</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {showConfetti && (
        <View style={styles.confettiOverlay} pointerEvents="none">
          <Text style={styles.confettiText}>🎉 COINS ADDED! 🎉</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  topBar: {
    height: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  backTxt: { color: '#fff', fontSize: 24, fontWeight: '800' },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 },

  balanceContainer: { paddingHorizontal: 18, paddingVertical: 20, alignItems: 'center' },
  balanceLabel: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },

  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: 'rgba(251, 191, 36, 1)',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  coinIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    marginRight: 10,
  },

  balanceValue: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },

  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 10 },

  iapNotice: {
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  iapNoticeText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  errorBox: {
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  errorText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '800' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },

  packCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.70)',
    borderWidth: 2.5,
    borderColor: 'rgba(139, 92, 246, 0.60)',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: 'rgba(139, 92, 246, 1)',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },

  packCardDisabled: { opacity: 0.6 },

  badge: {
    position: 'absolute',
    top: -6,
    right: '5%',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
  },

  badgeUltimate: { backgroundColor: 'rgba(251, 191, 36, 1.0)' },
  badgeBestValue: { backgroundColor: 'rgba(34, 197, 94, 1.0)' },
  badgePopular: { backgroundColor: 'rgba(139, 92, 246, 1.0)' },

  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  packIconContainer: { alignItems: 'center', marginBottom: 14 },

  packCoinIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(251, 191, 36, 0.90)',
    marginBottom: 12,
    shadowColor: 'rgba(251, 191, 36, 1)',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },

  packCoins: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },

  bonusPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.70)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },

  bonusText: { color: 'rgba(34, 197, 94, 1.0)', fontSize: 11, fontWeight: '900', letterSpacing: 1 },

  priceContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.20)',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.80)',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 10,
    minWidth: 100,
    alignItems: 'center',
  },

  price: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },

  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  confettiText: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
});
