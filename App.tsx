// App.tsx
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DriftGame from './src/game/DriftGame';
import { MainMenuCanvasSkia } from './src/components/MainMenuCanvasSkia';
import HeadphonesScreen from './src/components/HeadphonesScreen';
import { ScreenTransition } from './src/components/ScreenTransition';
import { ShopScreen } from './src/components/shop/ShopScreen';
import { CollectionScreen } from './src/components/collection/CollectionScreen';
import { ProfileScreen } from './src/components/profile/ProlfileScreen';
import { CoinShopScreen } from './src/components/shop/CoinShopScreen';

import * as RNIap from 'react-native-iap';
import type { Purchase } from 'react-native-iap';

import {
  loadProfile,
  resetProfileForDev,
  setSelectedBall,
  purchaseRemoveAds,
  grantCoins,
  type PlayerProfile,
} from './src/meta/playerProfile';

import { PreloadProvider } from './src/contexts/PreloadContext';
import { usePreloadAssets } from './src/game/hooks/usePreloadAssets';
import { PreloadSplashScreen } from './src/components/preload/PreloadSplashScreen';

type Screen = 'menu' | 'headphones' | 'game' | 'shop' | 'collection' | 'profile' | 'coinshop';

const FADE_OUT_DURATION = 800;
const DEV_RESET_PROFILE_ON_LAUNCH = false;

// ✅ DEV SIMU = true => simulation en Metro DEV, false => vrai flow Play (release only)
const DEV_SIMULATE_IAP = false;

// ---- SKUs ----
const REMOVE_ADS_SKU = 'remove_ads_299';

const COIN_PACKS_BY_SKU: Record<string, number> = {
  coins_pack_2500: 2500,
  coins_small_299: 8000,
  coins_medium_499: 15000,
  coins_large_999: 35000,
  coins_mega_1999: 80000,
  coins_ultimate_4999: 250000,
};

const ALL_SKUS = [REMOVE_ADS_SKU, ...Object.keys(COIN_PACKS_BY_SKU)];

function AppContent() {
  const [appReady, setAppReady] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [screen, setScreen] = useState<Screen>('menu');
  const [shopReturnTo, setShopReturnTo] = useState<Screen>('menu');
  const [selectedBallId, setSelectedBallId] = useState<string>('core');

  // ✅ UI flag: juste "connection billing OK"
  const [iapConnectedUI, setIapConnectedUI] = useState(false);

  // ✅ SKU -> prix localisé Play (si dispo)
  const [pricesBySku, setPricesBySku] = useState<Record<string, string>>({});

  const assetsReady = usePreloadAssets();
  const [splashReady, setSplashReady] = useState(false);

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistSeqRef = useRef(0);
  const persistedSelectedRef = useRef<string>('core');

  // ---- IAP refs ----
  const iapReadyRef = useRef(false);

  // pending resolvers so CoinShop can await "success"
  const pendingRef = useRef(new Map<string, { resolve: (ok: boolean) => void; reject: (e: any) => void }>());
  const processedTokensRef = useRef(new Set<string>());

  const finishPending = (sku: string, ok: boolean, err?: any) => {
    const pending = pendingRef.current.get(sku);
    if (!pending) return;
    pendingRef.current.delete(sku);
    ok ? pending.resolve(true) : pending.reject(err ?? new Error('purchase failed'));
  };

  const waitForSku = (sku: string) => {
    return new Promise<boolean>((resolve, reject) => {
      pendingRef.current.set(sku, { resolve, reject });

      setTimeout(() => {
        if (pendingRef.current.has(sku)) {
          pendingRef.current.delete(sku);
          reject(new Error('IAP timeout'));
        }
      }, 60_000);
    });
  };

  const refreshProfile = useCallback(async () => {
    const p = await loadProfile();
    setProfile(p);
    setSelectedBallId(p.selectedBallId || 'core');
    persistedSelectedRef.current = p.selectedBallId || 'core';
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        if (DEV_RESET_PROFILE_ON_LAUNCH) {
          await resetProfileForDev();
        }
        await refreshProfile();
        setAppReady(true);
      } catch {
        setAppReady(true);
      }
    };
    init();
  }, [refreshProfile]);

  // ---- IAP init + listeners ----
  useEffect(() => {
    let subUpdate: any;
    let subError: any;

    const buildPricesMap = (items: any[]) => {
      const map: Record<string, string> = {};
      for (const p of items ?? []) {
        const sku = p?.productId;
        const price = p?.localizedPrice || p?.price;
        if (sku && price) map[sku] = price;
      }
      return map;
    };

    const initIap = async () => {
      try {
        // Petit log utile en debug
        // (et ça te prouve que le module est là)
        console.log('RNIap keys:', Object.keys(RNIap ?? {}));

        const ok = await RNIap.initConnection();
        const connected = !!ok;
        iapReadyRef.current = connected;
        setIapConnectedUI(connected);

        // Android safe call
        try {
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        } catch {}

        // ✅ IMPORTANT: on essaye de charger les produits pour avoir les prix,
        // mais on NE BLOQUE PAS l'achat si ça renvoie [].
        try {
          // @ts-ignore new signature
          const items = await RNIap.getProducts({ skus: ALL_SKUS });
          if (Array.isArray(items) && items.length > 0) {
            setPricesBySku(buildPricesMap(items as any[]));
          } else {
            setPricesBySku({});
          }
          console.log('IAP getProducts count =', Array.isArray(items) ? items.length : -1);
          console.log('IAP getProducts ids =', Array.isArray(items) ? (items as any[]).map((p: any) => p?.productId).join(', ') : 'none');
        } catch {
          try {
            // @ts-ignore old signature
            const items = await RNIap.getProducts(ALL_SKUS);
            if (Array.isArray(items) && items.length > 0) {
              setPricesBySku(buildPricesMap(items as any[]));
            } else {
              setPricesBySku({});
            }
            console.log('IAP getProducts count =', Array.isArray(items) ? items.length : -1);
            console.log('IAP getProducts ids =', Array.isArray(items) ? (items as any[]).map((p: any) => p?.productId).join(', ') : 'none');
          } catch {
            setPricesBySku({});
          }
        }

        subUpdate = RNIap.purchaseUpdatedListener(async (purchase: Purchase) => {
          try {
            const sku = (purchase as any).productId as string;
            const token =
              (purchase as any).purchaseToken ||
              (purchase as any).transactionId ||
              `${sku}:${(purchase as any).transactionDate || ''}`;

            if (token && processedTokensRef.current.has(token)) return;

            if (sku === REMOVE_ADS_SKU) {
              await purchaseRemoveAds();
              await refreshProfile();
            } else {
              const coins = COIN_PACKS_BY_SKU[sku];
              if (coins && coins > 0) {
                await grantCoins(coins);
                await refreshProfile();
              }
            }

            if (token) processedTokensRef.current.add(token);

            try {
              const isConsumable = sku !== REMOVE_ADS_SKU;
              // @ts-ignore
              await RNIap.finishTransaction({ purchase, isConsumable });
            } catch {}

            finishPending(sku, true);
          } catch (e) {
            const sku = ((purchase as any).productId as string) || 'unknown';
            finishPending(sku, false, e);
          }
        });

        subError = RNIap.purchaseErrorListener((err: any) => {
          const sku = (err as any)?.productId as string | undefined;
          if (sku) finishPending(sku, false, err);
          console.log('IAP purchaseError:', err);
        });
      } catch (e) {
        iapReadyRef.current = false;
        setIapConnectedUI(false);
        setPricesBySku({});
        console.log('IAP initConnection FAILED:', e);
      }
    };

    initIap();

    return () => {
      try {
        subUpdate?.remove?.();
        subError?.remove?.();
      } catch {}
      try {
        RNIap.endConnection();
      } catch {}
    };
  }, [refreshProfile]);

  const handleTransition = useCallback((target: Screen) => setScreen(target), []);

  const openShopFromMenu = useCallback(() => {
    setShopReturnTo('menu');
    handleTransition('shop');
  }, [handleTransition]);

  const openShopFromGame = useCallback(() => {
    setShopReturnTo('game');
    handleTransition('shop');
  }, [handleTransition]);

  const backFromShop = useCallback(() => {
    handleTransition(shopReturnTo);
  }, [handleTransition, shopReturnTo]);

  const openCollection = useCallback(() => {
    handleTransition('collection');
  }, [handleTransition]);

  const backFromCollection = useCallback(() => {
    handleTransition('menu');
  }, [handleTransition]);

  const openProfile = useCallback(() => {
    handleTransition('profile');
  }, [handleTransition]);

  const backFromProfile = useCallback(() => {
    handleTransition('menu');
  }, [handleTransition]);

  const openCoinShop = useCallback(() => {
    handleTransition('coinshop');
  }, [handleTransition]);

  const backFromCoinShop = useCallback(() => {
    handleTransition('menu');
  }, [handleTransition]);

  // ✅ ONE function used by RemoveAds + CoinShop
  const requestIap = useCallback(
    async (sku: string, devSimAction: () => Promise<void>) => {
      if (__DEV__ && DEV_SIMULATE_IAP) {
        await new Promise((r) => setTimeout(r, 600));
        await devSimAction();
        await refreshProfile();
        return true;
      }

      if (!iapReadyRef.current) {
        throw new Error('IAP not connected');
      }

      // Refresh product details cache for this specific SKU (required by Google Play Billing v5)
      // coins_pack_2500 is already cached from init, but others may need a refresh
      try {
        // @ts-ignore
        await RNIap.getProducts({ skus: [sku] });
      } catch {
        try {
          // @ts-ignore old signature fallback
          await RNIap.getProducts([sku]);
        } catch {}
      }

      // @ts-ignore Android new signature (skus as array)
      await RNIap.requestPurchase({ skus: [sku] });

      return await waitForSku(sku);
    },
    [refreshProfile]
  );

  const handleRemoveAds = useCallback(async () => {
    await requestIap(REMOVE_ADS_SKU, async () => {
      await purchaseRemoveAds();
    });
  }, [requestIap]);

  const handleBuyCoinsPack = useCallback(
    async (sku: string, coins: number) => {
      await requestIap(sku, async () => {
        await grantCoins(coins);
      });
    },
    [requestIap]
  );

  const onSelectedBallIdChange = useCallback((id: string) => {
    setSelectedBallId(id);
    setProfile((p) => (p ? { ...p, selectedBallId: id, updatedAt: Date.now() } : p));
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (selectedBallId === persistedSelectedRef.current) return;

    persistSeqRef.current += 1;
    const mySeq = persistSeqRef.current;

    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);

    persistTimerRef.current = setTimeout(() => {
      setSelectedBall(selectedBallId)
        .then(() => {
          if (mySeq !== persistSeqRef.current) return;
          persistedSelectedRef.current = selectedBallId;
        })
        .catch(() => {
          if (mySeq !== persistSeqRef.current) return;

          const back = persistedSelectedRef.current;
          setSelectedBallId(back);
          setProfile((p) => (p ? { ...p, selectedBallId: back, updatedAt: Date.now() } : p));
        });
    }, 180);

    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [selectedBallId, profile]);

  if (!appReady || !profile || !assetsReady || !splashReady) {
    return <PreloadSplashScreen title="DRIFT-RING" onReady={() => setSplashReady(true)} />;
  }

  const shouldRenderGame =
    screen === 'game' ||
    screen === 'headphones' ||
    (screen === 'shop' && shopReturnTo === 'game');

  const gamePointerEvents = screen === 'game' ? 'auto' : 'none';
  const showGameVisual = screen === 'game' || (screen === 'shop' && shopReturnTo === 'game');

  const menuVisible = screen === 'menu';

  return (
    <View style={styles.container}>
      {shouldRenderGame && (
        <View style={[StyleSheet.absoluteFillObject, { opacity: showGameVisual ? 1 : 0 }]} pointerEvents={gamePointerEvents}>
          <DriftGame onShop={openShopFromGame} selectedBallId={selectedBallId} allowStart={screen === 'game'} isPremium={profile.isPremium ?? false} />
        </View>
      )}

      <View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: menuVisible ? 1 : 0, pointerEvents: menuVisible ? 'auto' : 'none' },
        ]}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <MainMenuCanvasSkia
            visible={menuVisible}
            profile={profile}
            onProfileUpdate={refreshProfile}
            onPlay={() => handleTransition('headphones')}
            onTuto={() => {}}
            onShop={openShopFromMenu}
            onProfile={openProfile}
            onCollection={openCollection}
            onCoinShop={openCoinShop}
            onRemoveAds={handleRemoveAds}
          />
        </View>
      </View>

      <ScreenTransition visible={screen === 'collection'} fadeOutDuration={FADE_OUT_DURATION}>
        <CollectionScreen
          profile={profile}
          onBack={backFromCollection}
          _onProfileUpdate={refreshProfile}
          onSelectedBallIdChange={onSelectedBallIdChange}
        />
      </ScreenTransition>

      <ScreenTransition visible={screen === 'profile'} fadeOutDuration={FADE_OUT_DURATION}>
        <ProfileScreen profile={profile} onBack={backFromProfile} onProfileUpdate={refreshProfile} />
      </ScreenTransition>

      <ScreenTransition visible={screen === 'shop'} fadeOutDuration={FADE_OUT_DURATION}>
        <ShopScreen profile={profile} onProfileUpdate={refreshProfile} onBack={backFromShop} />
      </ScreenTransition>

      <ScreenTransition visible={screen === 'coinshop'} fadeOutDuration={FADE_OUT_DURATION}>
        <CoinShopScreen
          profile={profile}
          onBack={backFromCoinShop}
          onProfileUpdate={refreshProfile}
          onBuyPack={handleBuyCoinsPack}
          iapReady={iapConnectedUI}   // ✅ IMPORTANT: ne bloque plus sur getProducts()
          pricesBySku={pricesBySku}
        />
      </ScreenTransition>

      {screen === 'headphones' && (
        <ScreenTransition visible fadeOutDuration={FADE_OUT_DURATION}>
          <HeadphonesScreen onConfirm={() => handleTransition('game')} />
        </ScreenTransition>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PreloadProvider>
        <AppContent />
      </PreloadProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
});
