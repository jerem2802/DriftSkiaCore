// src/components/MainMenuCanvasSkia.tsx
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
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

type MainMenuCanvasSkiaProps = {
  visible: boolean;
  profile: PlayerProfile;
  onProfileUpdate: () => void;
  onPlay: () => void;
  onTuto: () => void;
  onShop: () => void;
  onProfile: () => void;
  onCollection?: () => void;
};

export const MainMenuCanvasSkia: React.FC<MainMenuCanvasSkiaProps> = ({
  visible,
  profile,
  onProfileUpdate,
  onPlay,
  onShop,
  onProfile,
  onCollection,
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

  // Active tab state for nav icons
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

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      <View style={[styles.stage, stageStyle]}>
        <Canvas style={styles.canvas}>
          <MenuBackgroundSkia W={W} H={H} opacity={logic.state.screenOpacity} />
          <MenuTopBarSkia layout={layout} coins={logic.totalCoinsUI} />
          <MenuHeaderSkia layout={layout} />
          <MenuHubSkia
            layout={layout}
            bronzeStatus={logic.bronzeStatus}
            silverStatus={logic.silverStatus}
            neonStatus={logic.neonStatus}
            activeTab={activeTab}
          />
        </Canvas>

        <Animated.View style={[styles.uiLayer, uiOpacity]}>
          <MenuHitBoxes
            layout={layout}
            onProfile={onProfile}
            onShopCoins={() => {
              console.log('Shop coins IAP');
            }}
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
          />

          <MenuChestsStrip layout={layout} logic={logic} />
        </Animated.View>

        <View style={styles.chestLayer} pointerEvents="none">
          <View
            style={[
              styles.chestBox,
              {
                left: layout.chestBronzeVisualRect.x,
                top: layout.chestBronzeVisualRect.y,
              },
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
              {
                left: layout.chestSilverVisualRect.x,
                top: layout.chestSilverVisualRect.y,
              },
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
              {
                left: layout.chestNeonVisualRect.x,
                top: layout.chestNeonVisualRect.y,
              },
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
  uiLayer: { position: 'absolute', width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  chestLayer: { position: 'absolute', top: 0, left: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  chestBox: { position: 'absolute' },
});