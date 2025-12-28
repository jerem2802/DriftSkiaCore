// src/components/shop/ShopScreen.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';

import {
  purchaseBall,
  setSelectedBall,
  type PlayerProfile,
} from '../../meta/playerProfile';

import { SHOP_BALLS, type ShopBall } from './shopCatalog';
import { ShopHeader } from './ShopHeader';
import { ShopBallCard } from './ShopBallCard';

type Props = {
  profile: PlayerProfile;
  onProfileUpdate: () => void;
  onBack: () => void;
};

const DEV_UNLOCK_ALL = false;

export const ShopScreen: React.FC<Props> = ({ profile, onProfileUpdate, onBack }) => {
  const [busy, setBusy] = React.useState(false);

  const { width } = useWindowDimensions();
  const cols = width >= 720 ? 3 : 2;

  const onBuy = React.useCallback(
    async (id: string, price: number) => {
      if (busy) return;
      setBusy(true);
      try {
        await purchaseBall(id, price);
        onProfileUpdate();
      } finally {
        setBusy(false);
      }
    },
    [busy, onProfileUpdate]
  );

  const onEquip = React.useCallback(
    async (id: string) => {
      if (busy) return;
      setBusy(true);
      try {
        await setSelectedBall(id);
        onProfileUpdate();
      } finally {
        setBusy(false);
      }
    },
    [busy, onProfileUpdate]
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
          onSelect={onEquip}
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