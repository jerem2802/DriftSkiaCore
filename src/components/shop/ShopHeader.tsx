import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export const ShopHeader: React.FC<{
  totalCoins: number | null;
  onBack: () => void;
}> = React.memo(({ totalCoins, onBack }) => {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>BACK</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.title}>SHOP</Text>
        <Text style={styles.sub}>Unlock balls. Get stronger.</Text>
      </View>

      <View style={styles.coinsBox}>
        <Text style={styles.coinsValue}>{totalCoins ?? '—'}</Text>
        <Text style={styles.coinsLabel}>TOTAL</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backText: { color: '#22d3ee', fontWeight: '900', letterSpacing: 0.6 },
  center: { flex: 1, paddingHorizontal: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  sub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  coinsBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'flex-end',
    minWidth: 90,
  },
  coinsValue: { color: '#fbbf24', fontSize: 16, fontWeight: '900' },
  coinsLabel: { color: '#fde68a', fontSize: 10, fontWeight: '800', marginTop: 2 },
});
