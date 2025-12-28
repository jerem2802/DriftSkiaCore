// src/game/hooks/useChestLogic.ts
import { useState, useEffect, useRef } from 'react';
import {
  loadProfile,
  saveProfile,
  unlockChest,
  watchAd,
  getRemainingTime,
  claimChestRewards,
} from '../../meta/playerProfile';
import { generateChestRewards, type Reward } from '../../config/bonusConfig';
import { useMainMenuState } from './useMainMenuState';

export const useChestLogic = (visible: boolean) => {
  const state = useMainMenuState();

  const [loadedUI, setLoadedUI] = useState(false);
  const loadedRef = useRef(false);

  const [bronzeStatus, setBronzeStatus] = useState<'locked' | 'countdown' | 'ready'>('locked');
  const [silverStatus, setSilverStatus] = useState<'locked' | 'countdown' | 'ready'>('locked');
  const [neonStatus, setNeonStatus] = useState<'locked' | 'countdown' | 'ready'>('locked');

  const [bronzeTime, setBronzeTime] = useState(0);
  const [silverTime, setSilverTime] = useState(0);
  const [neonTime, setNeonTime] = useState(0);

  const [bronzeUnlock, setBronzeUnlock] = useState(0);
  const [silverUnlock, setSilverUnlock] = useState(0);
  const [neonPrice, setNeonPrice] = useState(0);

  const [bestScore, setBestScore] = useState(0);
  const [totalCoinsUI, setTotalCoinsUI] = useState(0);

  const [bronzeRewards, setBronzeRewards] = useState<Reward[]>([]);
  const [silverRewards, setSilverRewards] = useState<Reward[]>([]);
  const [neonRewards, setNeonRewards] = useState<Reward[]>([]);

  const [showBronzeFlash, setShowBronzeFlash] = useState(false);
  const [showSilverFlash, setShowSilverFlash] = useState(false);
  const [showNeonFlash, setShowNeonFlash] = useState(false);

  const [showBronzePanel, setShowBronzePanel] = useState(false);
  const [showSilverPanel, setShowSilverPanel] = useState(false);
  const [showNeonPanel, setShowNeonPanel] = useState(false);

  const modalOpenRef = useRef(false);

  useEffect(() => {
    modalOpenRef.current = showBronzePanel || showSilverPanel || showNeonPanel;
  }, [showBronzePanel, showSilverPanel, showNeonPanel]);

  useEffect(() => {
    let alive = true;
    let inFlight = false;

    const tick = async () => {
      if (modalOpenRef.current) return;
      if (!visible) return;
      if (inFlight) return;
      inFlight = true;

      try {
        const profile = await loadProfile();
        if (!alive) return;

        if (!loadedRef.current) {
          loadedRef.current = true;
          setLoadedUI(true);
        }

        const bronzeChest = profile.chests.bronze;
        const silverChest = profile.chests.silver;
        const neonChest = profile.chests.neon;

        const bStatus = bronzeChest.status as 'locked' | 'countdown' | 'ready';
        const sStatus = silverChest.status as 'locked' | 'countdown' | 'ready';
        const nStatus = neonChest.status as 'locked' | 'countdown' | 'ready';

        const bRemain = getRemainingTime(bronzeChest);
        const sRemain = getRemainingTime(silverChest);
        const nRemain = getRemainingTime(neonChest);

        const neonCost = neonChest.openPrice ?? 0;

        setBronzeStatus(bStatus);
        setSilverStatus(sStatus);
        setNeonStatus(nStatus);

        setBronzeTime(bRemain);
        setSilverTime(sRemain);
        setNeonTime(nRemain);

        setBestScore(profile.bestScore || 0);
        setTotalCoinsUI(profile.totalCoins || 0);

        setBronzeUnlock(state.bronzeUnlockValue.value);
        setSilverUnlock(state.silverUnlockValue.value);
        setNeonPrice(neonCost);

        state.profileLoaded.value = true;
        state.bronzeStatus.value = bStatus;
        state.silverStatus.value = sStatus;
        state.neonStatus.value = nStatus;
        state.bronzeTimeRemaining.value = bRemain;
        state.silverTimeRemaining.value = sRemain;
        state.neonTimeRemaining.value = nRemain;
        state.bestScore.value = profile.bestScore || 0;
        state.totalCoins.value = profile.totalCoins || 0;
        state.neonOpenPrice.value = neonCost;
        state.bronzeAdsWatched.value = bronzeChest.adsWatched || 0;
        state.silverAdsWatched.value = silverChest.adsWatched || 0;
        state.neonAdsWatched.value = neonChest.adsWatched || 0;
      } finally {
        inFlight = false;
      }
    };

    tick();
    const id = setInterval(tick, 500);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [state, visible]);

  const handleBronzeUnlock = async () => {
    const profile = await loadProfile();
    const required = state.bronzeUnlockValue.value || 0;
    if ((profile.bestScore || 0) < required) return;

    const unlockedChest = unlockChest(profile.chests.bronze);
    await saveProfile({ ...profile, chests: { ...profile.chests, bronze: unlockedChest } });

    state.bronzeStatus.value = unlockedChest.status;
    state.bronzeTimeRemaining.value = getRemainingTime(unlockedChest);
  };

  const handleBronzeWatchAd = async () => {
    const profile = await loadProfile();
    const updatedChest = watchAd(profile.chests.bronze);
    const remaining = getRemainingTime(updatedChest);

    if (remaining === 0) {
      const readyChest = { ...updatedChest, status: 'ready' as const };
      await saveProfile({ ...profile, chests: { ...profile.chests, bronze: readyChest } });
      state.bronzeStatus.value = 'ready';
      state.bronzeTimeRemaining.value = 0;
    } else {
      await saveProfile({ ...profile, chests: { ...profile.chests, bronze: updatedChest } });
      state.bronzeTimeRemaining.value = remaining;
      state.bronzeAdsWatched.value = updatedChest.adsWatched || 0;
    }
  };

  const handleBronzeOpen = () => {
    const rewardsGen = generateChestRewards('bronze');
    setBronzeRewards(rewardsGen);
    state.bronzeAnimating.value = true;
    setShowBronzeFlash(true);
    setTimeout(() => setShowBronzePanel(true), 1500);
  };

  const handleBronzeComplete = () => {
    state.bronzeAnimating.value = false;
    setShowBronzeFlash(false);
  };

  const handleBronzeRewardClose = async () => {
    setShowBronzePanel(false);
    await claimChestRewards('bronze', bronzeRewards);
    setBronzeRewards([]);
    const profile = await loadProfile();
    state.bronzeStatus.value = profile.chests.bronze.status;
    state.bronzeTimeRemaining.value = getRemainingTime(profile.chests.bronze);
  };

  const handleSilverUnlock = async () => {
    const profile = await loadProfile();
    const required = state.silverUnlockValue.value || 0;
    if ((profile.bestScore || 0) < required) return;

    const unlockedChest = unlockChest(profile.chests.silver);
    await saveProfile({ ...profile, chests: { ...profile.chests, silver: unlockedChest } });

    state.silverStatus.value = unlockedChest.status;
    state.silverTimeRemaining.value = getRemainingTime(unlockedChest);
  };

  const handleSilverWatchAd = async () => {
    const profile = await loadProfile();
    const updatedChest = watchAd(profile.chests.silver);
    const remaining = getRemainingTime(updatedChest);

    if (remaining === 0) {
      const readyChest = { ...updatedChest, status: 'ready' as const };
      await saveProfile({ ...profile, chests: { ...profile.chests, silver: readyChest } });
      state.silverStatus.value = 'ready';
      state.silverTimeRemaining.value = 0;
    } else {
      await saveProfile({ ...profile, chests: { ...profile.chests, silver: updatedChest } });
      state.silverTimeRemaining.value = remaining;
      state.silverAdsWatched.value = updatedChest.adsWatched || 0;
    }
  };

  const handleSilverOpen = () => {
    const rewardsGen = generateChestRewards('silver');
    setSilverRewards(rewardsGen);
    state.silverAnimating.value = true;
    setShowSilverFlash(true);
    setTimeout(() => setShowSilverPanel(true), 1500);
  };

  const handleSilverComplete = () => {
    state.silverAnimating.value = false;
    setShowSilverFlash(false);
  };

  const handleSilverRewardClose = async () => {
    setShowSilverPanel(false);
    await claimChestRewards('silver', silverRewards);
    setSilverRewards([]);
    const profile = await loadProfile();
    state.silverStatus.value = profile.chests.silver.status;
    state.silverTimeRemaining.value = getRemainingTime(profile.chests.silver);
  };

  const handleNeonUnlock = async () => {
    const profile = await loadProfile();
    const neonChest = profile.chests.neon;
    const cost = neonChest.openPrice ?? 0;

    console.log('NEON UNLOCK:', {
      totalCoins: profile.totalCoins,
      cost,
      neonStatus,
      openPrice: neonChest.openPrice,
    });

    if ((profile.totalCoins || 0) < cost) {
      console.log('❌ Pas assez de coins');
      return;
    }

    const unlockedChest = unlockChest(neonChest);
    const newCoins = Math.max(0, (profile.totalCoins || 0) - cost);

    await saveProfile({
      ...profile,
      chests: { ...profile.chests, neon: unlockedChest },
      totalCoins: newCoins,
    });

    state.neonStatus.value = unlockedChest.status;
    state.neonTimeRemaining.value = getRemainingTime(unlockedChest);
    state.totalCoins.value = newCoins;
  };

  const handleNeonWatchAd = async () => {
    const profile = await loadProfile();
    const updatedChest = watchAd(profile.chests.neon);
    const remaining = getRemainingTime(updatedChest);

    if (remaining === 0) {
      const readyChest = { ...updatedChest, status: 'ready' as const };
      await saveProfile({ ...profile, chests: { ...profile.chests, neon: readyChest } });
      state.neonStatus.value = 'ready';
      state.neonTimeRemaining.value = 0;
    } else {
      await saveProfile({ ...profile, chests: { ...profile.chests, neon: updatedChest } });
      state.neonTimeRemaining.value = remaining;
      state.neonAdsWatched.value = updatedChest.adsWatched || 0;
    }
  };

  const handleNeonOpen = () => {
    const rewardsGen = generateChestRewards('neon');
    setNeonRewards(rewardsGen);
    state.neonAnimating.value = true;
    setShowNeonFlash(true);
    setTimeout(() => setShowNeonPanel(true), 1500);
  };

  const handleNeonComplete = () => {
    state.neonAnimating.value = false;
    setShowNeonFlash(false);
  };

  const handleNeonRewardClose = async () => {
    setShowNeonPanel(false);
    await claimChestRewards('neon', neonRewards);
    setNeonRewards([]);
    const profile = await loadProfile();
    state.neonStatus.value = profile.chests.neon.status;
    state.neonTimeRemaining.value = getRemainingTime(profile.chests.neon);
  };

  return {
    state,
    loadedUI,
    bronzeStatus,
    silverStatus,
    neonStatus,
    bronzeTime,
    silverTime,
    neonTime,
    bronzeUnlock,
    silverUnlock,
    neonPrice,
    bestScore,
    totalCoinsUI,
    bronzeRewards,
    silverRewards,
    neonRewards,
    showBronzeFlash,
    showSilverFlash,
    showNeonFlash,
    showBronzePanel,
    showSilverPanel,
    showNeonPanel,
    handleBronzeUnlock,
    handleBronzeWatchAd,
    handleBronzeOpen,
    handleBronzeComplete,
    handleBronzeRewardClose,
    handleSilverUnlock,
    handleSilverWatchAd,
    handleSilverOpen,
    handleSilverComplete,
    handleSilverRewardClose,
    handleNeonUnlock,
    handleNeonWatchAd,
    handleNeonOpen,
    handleNeonComplete,
    handleNeonRewardClose,
  };
};