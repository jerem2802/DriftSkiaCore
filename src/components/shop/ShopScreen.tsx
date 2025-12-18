import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';

import {
  loadProfile,
  purchaseBall,
  setSelectedBall,
  type PlayerProfile,
} from '../../meta/playerProfile';

import { SHOP_BALLS, type ShopBall } from './shopCatalog';
import { ShopHeader } from './ShopHeader';
import { ShopBallCard } from './ShopBallCard';

type Props = {
  onBack: () => void;
  onSelectedBallId?: (id: string) => void; // ✅ remonte au App pour update visuel
};

// ✅ DEV : permet d’équiper n’importe quelle bille (sans achat) pour tester vite
const DEV_UNLOCK_ALL = __DEV__;

export const ShopScreen: React.FC<Props> = ({ onBack, onSelectedBallId }) => {
  const [profile, setProfile] = React.useState<PlayerProfile | null>(null);
  const [busy, setBusy] = React.useState(false);

  const { width } = useWindowDimensions();
  const cols = width >= 720 ? 3 : 2;

  const refresh = React.useCallback(() => {
    loadProfile().then(setProfile).catch(() => {});
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const onBuy = React.useCallback(
    async (id: string, price: number) => {
      if (busy) return;
      setBusy(true);
      try {
        const next = await purchaseBall(id, price);
        setProfile(next);
      } finally {
        setBusy(false);
      }
    },
    [busy]
  );

  const onEquip = React.useCallback(
    async (id: string) => {
      if (busy) return;
      setBusy(true);
      try {
        const next = await setSelectedBall(id);
        setProfile(next);
        onSelectedBallId?.(id);
      } finally {
        setBusy(false);
      }
    },
    [busy, onSelectedBallId]
  );

  const renderItem = React.useCallback(
    ({ item }: { item: ShopBall }) => {
      const ownedRaw = !!profile?.ownedBalls?.includes(item.id);
      const owned = DEV_UNLOCK_ALL ? true : ownedRaw;

      const selected = profile?.selectedBallId === item.id;

      const canBuyRaw = !!profile && profile.totalCoins >= item.price;
      const canBuy = DEV_UNLOCK_ALL ? true : canBuyRaw;

      return (
        <ShopBallCard
          item={item}
          owned={owned}
          selected={selected}
          canBuy={canBuy}
          busy={busy}
          onBuy={onBuy}
          onSelect={onEquip} // ✅ même si non owned en DEV, tu peux équiper
        />
      );
    },
    [profile, busy, onBuy, onEquip]
  );

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={require('../../assets/images/menu_driftring.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.shade} />

        <ShopHeader totalCoins={profile?.totalCoins ?? null} onBack={onBack} />

        <FlatList
          key={cols}
          data={SHOP_BALLS}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          numColumns={cols}
          columnWrapperStyle={styles.row}
          initialNumToRender={10}
          windowSize={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={16}
          removeClippedSubviews
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },

  shade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.82)',
  },

  list: {
    paddingHorizontal: 14,
    paddingBottom: 22,
  },

  row: {
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
});
