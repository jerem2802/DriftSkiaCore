// src/game/hooks/useMainMenuState.ts
import { useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import {
  loadProfile,
  saveProfile,
  getRemainingTime,
  setChestReady,
} from '../../meta/playerProfile';

export const useMainMenuState = () => {
  const profileLoaded = useSharedValue(false);

  const bestScore = useSharedValue(0);
  const totalCoins = useSharedValue(0);

  const bronzeStatus = useSharedValue<'locked' | 'countdown' | 'ready'>('locked');
  const bronzeUnlockValue = useSharedValue(0);
  const bronzeTimeRemaining = useSharedValue(0);
  const bronzeAdsWatched = useSharedValue(0);

  const silverStatus = useSharedValue<'locked' | 'countdown' | 'ready'>('locked');
  const silverUnlockValue = useSharedValue(0);
  const silverTimeRemaining = useSharedValue(0);
  const silverAdsWatched = useSharedValue(0);

  const neonStatus = useSharedValue<'locked' | 'countdown' | 'ready'>('locked');
  const neonUnlockValue = useSharedValue(0);
  const neonOpenPrice = useSharedValue(0);
  const neonTimeRemaining = useSharedValue(0);
  const neonAdsWatched = useSharedValue(0);

  const bronzeAnimating = useSharedValue(false);
  const silverAnimating = useSharedValue(false);
  const neonAnimating = useSharedValue(false);

  const showBronzeRewards = useSharedValue(false);
  const showSilverRewards = useSharedValue(false);
  const showNeonRewards = useSharedValue(false);

  const screenOpacity = useSharedValue(0);

  // Init
  useEffect(() => {
    let cancelled = false;

    loadProfile().then((profile) => {
      if (cancelled) return;

      bestScore.value = profile.bestScore;
      totalCoins.value = profile.totalCoins;

      // Ads watched (utile si tu limites à 4 pubs)
      bronzeAdsWatched.value = profile.chests.bronze.adsWatched || 0;
      silverAdsWatched.value = profile.chests.silver.adsWatched || 0;
      neonAdsWatched.value = profile.chests.neon.adsWatched || 0;

      // BRONZE
      if (profile.chests.bronze.status === 'countdown' && getRemainingTime(profile.chests.bronze) === 0) {
        const readyChest = setChestReady(profile.chests.bronze);
        saveProfile({ ...profile, chests: { ...profile.chests, bronze: readyChest } });
        bronzeStatus.value = 'ready';
      } else {
        bronzeStatus.value = profile.chests.bronze.status;
      }
      bronzeUnlockValue.value = profile.chests.bronze.unlockCondition?.value || 0;

      // SILVER
      if (profile.chests.silver.status === 'countdown' && getRemainingTime(profile.chests.silver) === 0) {
        const readyChest = setChestReady(profile.chests.silver);
        saveProfile({ ...profile, chests: { ...profile.chests, silver: readyChest } });
        silverStatus.value = 'ready';
      } else {
        silverStatus.value = profile.chests.silver.status;
      }
      silverUnlockValue.value = profile.chests.silver.unlockCondition?.value || 0;

      // NEON
      if (profile.chests.neon.status === 'countdown' && getRemainingTime(profile.chests.neon) === 0) {
        const readyChest = setChestReady(profile.chests.neon);
        saveProfile({ ...profile, chests: { ...profile.chests, neon: readyChest } });
        neonStatus.value = 'ready';
      } else {
        neonStatus.value = profile.chests.neon.status;
      }
      neonUnlockValue.value = profile.chests.neon.unlockCondition?.value || 0;
      neonOpenPrice.value = profile.chests.neon.openPrice || 0;

      profileLoaded.value = true;
    });

    return () => {
      cancelled = true;
    };
  }, [
    profileLoaded,
    bestScore,
    totalCoins,
    bronzeStatus,
    bronzeUnlockValue,
    bronzeAdsWatched,
    silverStatus,
    silverUnlockValue,
    silverAdsWatched,
    neonStatus,
    neonUnlockValue,
    neonOpenPrice,
    neonAdsWatched,
  ]);

  // Poll (1s)
  useEffect(() => {
    if (!profileLoaded.value) return;

    const interval = setInterval(() => {
      loadProfile().then((profile) => {
        // Meta sync (important)
        bestScore.value = profile.bestScore;
        totalCoins.value = profile.totalCoins;

        bronzeAdsWatched.value = profile.chests.bronze.adsWatched || 0;
        silverAdsWatched.value = profile.chests.silver.adsWatched || 0;
        neonAdsWatched.value = profile.chests.neon.adsWatched || 0;

        // BRONZE
        if (profile.chests.bronze.status === 'countdown') {
          const remaining = getRemainingTime(profile.chests.bronze);
          bronzeTimeRemaining.value = remaining;

          if (remaining === 0 && bronzeStatus.value === 'countdown') {
            bronzeStatus.value = 'ready';
            const updated = setChestReady(profile.chests.bronze);
            saveProfile({ ...profile, chests: { ...profile.chests, bronze: updated } });
          }
        } else {
          bronzeTimeRemaining.value = 0;
        }

        // SILVER
        if (profile.chests.silver.status === 'countdown') {
          const remaining = getRemainingTime(profile.chests.silver);
          silverTimeRemaining.value = remaining;

          if (remaining === 0 && silverStatus.value === 'countdown') {
            silverStatus.value = 'ready';
            const updated = setChestReady(profile.chests.silver);
            saveProfile({ ...profile, chests: { ...profile.chests, silver: updated } });
          }
        } else {
          silverTimeRemaining.value = 0;
        }

        // NEON
        if (profile.chests.neon.status === 'countdown') {
          const remaining = getRemainingTime(profile.chests.neon);
          neonTimeRemaining.value = remaining;

          if (remaining === 0 && neonStatus.value === 'countdown') {
            neonStatus.value = 'ready';
            const updated = setChestReady(profile.chests.neon);
            saveProfile({ ...profile, chests: { ...profile.chests, neon: updated } });
          }
        } else {
          neonTimeRemaining.value = 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    profileLoaded,
    bestScore,
    totalCoins,
    bronzeStatus,
    bronzeTimeRemaining,
    bronzeAdsWatched,
    silverStatus,
    silverTimeRemaining,
    silverAdsWatched,
    neonStatus,
    neonTimeRemaining,
    neonAdsWatched,
  ]);

  return {
    profileLoaded,
    bestScore,
    totalCoins,

    bronzeStatus,
    bronzeUnlockValue,
    bronzeTimeRemaining,
    bronzeAdsWatched,
    bronzeAnimating,
    showBronzeRewards,

    silverStatus,
    silverUnlockValue,
    silverTimeRemaining,
    silverAdsWatched,
    silverAnimating,
    showSilverRewards,

    neonStatus,
    neonUnlockValue,
    neonOpenPrice,
    neonTimeRemaining,
    neonAdsWatched,
    neonAnimating,
    showNeonRewards,

    screenOpacity,
  };
};
