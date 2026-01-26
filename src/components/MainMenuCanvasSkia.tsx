// src/components/MainMenuCanvasSkia.tsx
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { Canvas, Text, matchFont } from '@shopify/react-native-skia';
import Animated, { useAnimatedReaction, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/gameplay';
import { useChestLogic } from '../game/hooks/useChestLogic';
import type { PlayerProfile } from '../meta/playerProfile';


import { ChestBoxSkia } from './chests/ChestBoxSkia';
import { ChestOpeningAnimation } from './chests/ChestOpeningAnimation';
import { RewardPanelSkia } from './chests/RewardPanelSkia';
import { OptionsMenu } from './OptionsMenu';

import { createMenuLayout } from './menu/menuLayout';
import { MenuBackgroundSkia } from './menu/MenuBackgroundSkia';
import { MenuTopBarSkia } from './menu/MenuTopBarSkia';
import { MenuHeaderSkia } from './menu/MenuHeaderSkia';
import { MenuHubSkia } from './menu/MenuHubSkia';
import { MenuHitBoxes } from './menu/MenuHitBoxes';
import { MenuChestsStrip } from './menu/MenuChestsStrip';
import { MenuRemoveAdsButton } from './menu/MenuRemoveAdsButton';

type MainMenuCanvasSkiaProps = {
  visible: boolean;
  profile: PlayerProfile;
  onProfileUpdate: () => void;
  onPlay: () => void;
  onTuto: () => void;
  onShop: () => void;
  onProfile: () => void;
  onCollection?: () => void;
  onCoinShop: () => void;
  onRemoveAds: () => void;
};

export const MainMenuCanvasSkia: React.FC<MainMenuCanvasSkiaProps> = ({
  visible,
  profile,
  onProfileUpdate,
  onPlay,
  onShop,
  onProfile,
  onCollection,
  onCoinShop,
  onRemoveAds,
}) => {
  const { width: winW, height: winH } = useWindowDimensions();

  const W = CANVAS_WIDTH;
  const H = CANVAS_HEIGHT;

  const scale = Math.min(winW / W, winH / H);
  const stageStyle = useMemo(
    () => ({
      width: W,
      height: H,
      transform: [{ scale }],
    }),
    [W, H, scale]
  );

  const layout = useMemo(() => createMenuLayout(W, H), [W, H]);

  const logic = useChestLogic(visible, profile, onProfileUpdate);
  const [showOptions, setShowOptions] = useState(false);

  const [activeTab, setActiveTab] = useState<'shop' | 'leaderboard' | 'collection'>('shop');

  useAnimatedReaction(
    () => visible,
    (v) => {
      logic.state.screenOpacity.value = withTiming(v ? 1 : 0, {
        duration: v ? 600 : 250,
        easing: v ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      });
    },
    [visible]
  );

  const uiOpacity = useAnimatedStyle(() => ({ opacity: logic.state.screenOpacity.value }));
  const handleCollection = onCollection ?? onProfile;

  const isModalOpen = logic.showBronzePanel || logic.showSilverPanel || logic.showNeonPanel || showOptions;
  const uiPointerEvents = isModalOpen ? 'none' : 'auto';

  const playerName = profile.playerName ?? 'Player';
  const avatarId = profile.avatarId ?? 'a01';

  const priceFont = useMemo(() => matchFont({
    fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
    fontSize: 23,
    fontWeight: '900',
  }), []);

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      <View style={[styles.stage, stageStyle]}>
        <Canvas style={styles.canvas}>
          <MenuBackgroundSkia W={W} H={H} opacity={logic.state.screenOpacity} />
          <MenuTopBarSkia layout={layout} coins={logic.totalCoinsUI} playerName={playerName} avatarId={avatarId} />
          <MenuHeaderSkia layout={layout} />

          <MenuRemoveAdsButton
            x={layout.removeAdsRect.x}
            y={layout.removeAdsRect.y}
            w={layout.removeAdsRect.w}
            h={layout.removeAdsRect.h}
            isPremium={profile.isPremium ?? false}
          />

          {/* ✅ PRIX TOUJOURS VISIBLE */}
          <Text
            x={layout.removeAdsRect.x + layout.removeAdsRect.w * 0.39}
            y={layout.removeAdsRect.y + layout.removeAdsRect.h * 1.2}
            text="€2.99"
            font={priceFont}
            color="#FF6B35"
          />

          <MenuHubSkia
            layout={layout}
            bronzeStatus={logic.bronzeStatus}
            silverStatus={logic.silverStatus}
            neonStatus={logic.neonStatus}
            activeTab={activeTab}
          />
        </Canvas>

        <View style={styles.chestLayer} pointerEvents="none">
          <View
            style={[
              styles.chestBox,
              { left: layout.chestBronzeVisualRect.x, top: layout.chestBronzeVisualRect.y },
            ]}
          >
            <ChestBoxSkia
              type="bronze"
              onPress={() => {}}
              shouldAnimate={logic.state.bronzeAnimating.value}
              width={layout.chestBronzeVisualRect.w}
              height={layout.chestBronzeVisualRect.h}
            />
          </View>

          <View
            style={[
              styles.chestBox,
              { left: layout.chestSilverVisualRect.x, top: layout.chestSilverVisualRect.y },
            ]}
          >
            <ChestBoxSkia
              type="silver"
              onPress={() => {}}
              shouldAnimate={logic.state.silverAnimating.value}
              width={layout.chestSilverVisualRect.w}
              height={layout.chestSilverVisualRect.h}
            />
          </View>

          <View
            style={[
              styles.chestBox,
              { left: layout.chestNeonVisualRect.x, top: layout.chestNeonVisualRect.y },
            ]}
          >
            <ChestBoxSkia
              type="neon"
              onPress={() => {}}
              shouldAnimate={logic.state.neonAnimating.value}
              width={layout.chestNeonVisualRect.w}
              height={layout.chestNeonVisualRect.h}
            />
          </View>
        </View>

        <Animated.View style={[styles.uiLayer, uiOpacity]} pointerEvents={uiPointerEvents}>
          <MenuChestsStrip layout={layout} logic={logic} hideText={isModalOpen} />

          <MenuHitBoxes
            layout={layout}
            onProfile={onProfile}
            onShopCoins={onCoinShop}
            onSettings={() => setShowOptions(true)}
            onPlay={onPlay}
            onShop={() => {
              setActiveTab('shop');
              onShop();
            }}
            onLeaderboard={() => {
              setActiveTab('leaderboard');
              console.log('Leaderboard clicked');
            }}
            onCollection={() => {
              setActiveTab('collection');
              handleCollection();
            }}
            onRemoveAds={onRemoveAds}
          />
        </Animated.View>

        <ChestOpeningAnimation isActive={logic.showBronzeFlash} onComplete={logic.handleBronzeComplete} />
        <ChestOpeningAnimation isActive={logic.showSilverFlash} onComplete={logic.handleSilverComplete} />
        <ChestOpeningAnimation isActive={logic.showNeonFlash} onComplete={logic.handleNeonComplete} />

        <RewardPanelSkia isVisible={logic.showBronzePanel} rewards={logic.bronzeRewards} onClose={logic.handleBronzeRewardClose} />
        <RewardPanelSkia isVisible={logic.showSilverPanel} rewards={logic.silverRewards} onClose={logic.handleSilverRewardClose} />
        <RewardPanelSkia isVisible={logic.showNeonPanel} rewards={logic.neonRewards} onClose={logic.handleNeonRewardClose} />

        {showOptions ? <OptionsMenu onClose={() => setShowOptions(false)} /> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  stage: { position: 'relative' },
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, position: 'absolute' },
  uiLayer: { position: 'absolute', width: CANVAS_WIDTH, height: CANVAS_HEIGHT, zIndex: 10 },
  chestLayer: { position: 'absolute', top: 0, left: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  chestBox: { position: 'absolute' },
});