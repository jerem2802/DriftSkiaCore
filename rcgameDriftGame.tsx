[1mdiff --git a/App.tsx b/App.tsx[m
[1mindex ce8b950..2c4227d 100644[m
[1m--- a/App.tsx[m
[1m+++ b/App.tsx[m
[36m@@ -5,7 +5,7 @@[m [mconfigureReanimatedLogger({[m
   strict: false,[m
 });[m
 [m
[31m-import React, { useState } from 'react';[m
[32m+[m[32mimport React, { useState, useCallback } from 'react';[m
 import { View, StyleSheet } from 'react-native';[m
 [m
 import DriftGame from './src/game/DriftGame';[m
[36m@@ -22,33 +22,37 @@[m [mexport default function App() {[m
   const [screen, setScreen] = useState<Screen>('menu');[m
   const [transitioning, setTransitioning] = useState(false);[m
 [m
[31m-  // ✅ d’où vient le shop, pour un back logique[m
[32m+[m[32m  // ✅ d'où vient le shop ? (menu ou game)[m
   const [shopReturnTo, setShopReturnTo] = useState<Screen>('menu');[m
 [m
[31m-  const go = (target: Screen) => {[m
[32m+[m[32m  // ✅ bille équipée (MVP: visuel uniquement)[m
[32m+[m[32m  const [selectedBallId, setSelectedBallId] = useState<string>('core');[m
[32m+[m
[32m+[m[32m  const handleTransition = useCallback((targetScreen: Screen) => {[m
     setTransitioning(true);[m
     setTimeout(() => {[m
[31m-      setScreen(target);[m
[32m+[m[32m      setScreen(targetScreen);[m
       setTransitioning(false);[m
     }, FADE_OUT_DURATION);[m
[31m-  };[m
[32m+[m[32m  }, []);[m
 [m
[31m-  const openShopFromMenu = () => {[m
[32m+[m[32m  const openShopFromMenu = useCallback(() => {[m
     setShopReturnTo('menu');[m
[31m-    go('shop');[m
[31m-  };[m
[32m+[m[32m    handleTransition('shop');[m
[32m+[m[32m  }, [handleTransition]);[m
 [m
[31m-  const openShopFromGame = () => {[m
[32m+[m[32m  const openShopFromGame = useCallback(() => {[m
     setShopReturnTo('game');[m
[31m-    go('shop');[m
[31m-  };[m
[32m+[m[32m    handleTransition('shop');[m
[32m+[m[32m  }, [handleTransition]);[m
 [m
[31m-  const closeShop = () => go(shopReturnTo);[m
[32m+[m[32m  const backFromShop = useCallback(() => {[m
[32m+[m[32m    handleTransition(shopReturnTo);[m
[32m+[m[32m  }, [handleTransition, shopReturnTo]);[m
 [m
[31m-  // ✅ IMPORTANT :[m
[31m-  // - Shop = keepMounted (pré-monté => plus de clac)[m
[31m-  // - Si tu veux revenir sur le GameOver après le shop : DriftGame doit rester monté aussi.[m
[31m-  const keepGameMounted = screen === 'game' || (screen === 'shop' && shopReturnTo === 'game');[m
[32m+[m[32m  // ✅ on garde le game monté derrière le shop seulement si shop ouvert depuis game[m
[32m+[m[32m  const shouldRenderGame =[m
[32m+[m[32m    screen === 'game' || (screen === 'shop' && shopReturnTo === 'game');[m
 [m
   return ([m
     <View style={styles.container}>[m
[36m@@ -57,7 +61,7 @@[m [mexport default function App() {[m
         fadeOutDuration={FADE_OUT_DURATION}[m
       >[m
         <MainMenuScreen[m
[31m-          onPlay={() => go('headphones')}[m
[32m+[m[32m          onPlay={() => handleTransition('headphones')}[m
           onTuto={() => console.log('TUTO')}[m
           onOptions={() => console.log('OPTIONS')}[m
           onShop={openShopFromMenu}[m
[36m@@ -65,31 +69,32 @@[m [mexport default function App() {[m
       </ScreenTransition>[m
 [m
       <ScreenTransition[m
[31m-        visible={screen === 'headphones' && !transitioning}[m
[32m+[m[32m        visible={screen === 'shop' && !transitioning}[m
         fadeOutDuration={FADE_OUT_DURATION}[m
       >[m
[31m-        <HeadphonesScreen onConfirm={() => go('game')} />[m
[32m+[m[32m        <ShopScreen[m
[32m+[m[32m          onBack={backFromShop}[m
[32m+[m[32m          onSelectedBallId={setSelectedBallId}[m
[32m+[m[32m        />[m
       </ScreenTransition>[m
 [m
       <ScreenTransition[m
[31m-        visible={screen === 'game' && !transitioning}[m
[32m+[m[32m        visible={screen === 'headphones' && !transitioning}[m
         fadeOutDuration={FADE_OUT_DURATION}[m
[31m-        keepMounted={keepGameMounted}[m
       >[m
[31m-        <DriftGame onShop={openShopFromGame} />[m
[32m+[m[32m        <HeadphonesScreen onConfirm={() => handleTransition('game')} />[m
       </ScreenTransition>[m
 [m
[31m-      <ScreenTransition[m
[31m-        visible={screen === 'shop' && !transitioning}[m
[31m-        fadeOutDuration={FADE_OUT_DURATION}[m
[31m-        keepMounted[m
[31m-      >[m
[31m-        <ShopScreen onBack={closeShop} />[m
[31m-      </ScreenTransition>[m
[32m+[m[32m      {shouldRenderGame && ([m
[32m+[m[32m        <DriftGame onShop={openShopFromGame} selectedBallId={selectedBallId} />[m
[32m+[m[32m      )}[m
     </View>[m
   );[m
 }[m
 [m
 const styles = StyleSheet.create({[m
[31m-  container: { flex: 1, backgroundColor: 'black' },[m
[32m+[m[32m  container: {[m
[32m+[m[32m    flex: 1,[m
[32m+[m[32m    backgroundColor: 'black',[m
[32m+[m[32m  },[m
 });[m
[1mdiff --git a/src/components/GameOverOverlay.tsx b/src/components/GameOverOverlay.tsx[m
[1mindex 313f3a9..8559457 100644[m
[1m--- a/src/components/GameOverOverlay.tsx[m
[1m+++ b/src/components/GameOverOverlay.tsx[m
[36m@@ -12,8 +12,7 @@[m [minterface GameOverOverlayProps {[m
   onShare: () => void;[m
   onWatchAd: () => void;[m
 [m
[31m-  // ✅ NEW[m
[31m-  onShop: () => void;[m
[32m+[m[32m  onShop: () => void; // ✅[m
 }[m
 [m
 export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({[m
[36m@@ -33,7 +32,6 @@[m [mexport const GameOverOverlay: React.FC<GameOverOverlayProps> = ({[m
   return ([m
     <View style={styles.overlay}>[m
       <View style={styles.card}>[m
[31m-        {/* HEADER ART */}[m
         <View style={styles.header}>[m
           <Image[m
             source={require('../assets/images/menu_driftring_header.png')}[m
[36m@@ -57,7 +55,6 @@[m [mexport const GameOverOverlay: React.FC<GameOverOverlayProps> = ({[m
           </View>[m
         </View>[m
 [m
[31m-        {/* STATS */}[m
         <View style={styles.statsRow}>[m
           <View style={[styles.statTile, styles.statTileCyan]}>[m
             <Text style={styles.statLabel}>Score</Text>[m
[36m@@ -70,7 +67,6 @@[m [mexport const GameOverOverlay: React.FC<GameOverOverlayProps> = ({[m
           </View>[m
         </View>[m
 [m
[31m-        {/* COINS GROUP */}[m
         <View style={styles.coinsRow}>[m
           <View style={[styles.coinsChip, styles.coinsChipLeft]}>[m
             <View style={styles.coinDot} />[m
[36m@@ -85,7 +81,6 @@[m [mexport const GameOverOverlay: React.FC<GameOverOverlayProps> = ({[m
           </View>[m
         </View>[m
 [m
[31m-        {/* CTA */}[m
         <TouchableOpacity[m
           style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}[m
           onPress={onWatchAd}[m
[36m@@ -373,19 +368,19 @@[m [mconst styles = StyleSheet.create({[m
 [m
   shopButton: {[m
     marginHorizontal: 14,[m
[31m-    marginBottom: 10,[m
[32m+[m[32m    marginBottom: 12,[m
     borderRadius: 999,[m
     paddingVertical: 11,[m
     alignItems: 'center',[m
[31m-    backgroundColor: 'rgba(0,0,0,0.35)',[m
[32m+[m[32m    backgroundColor: 'rgba(2,6,23,0.70)',[m
     borderWidth: 1,[m
[31m-    borderColor: 'rgba(251,191,36,0.35)',[m
[32m+[m[32m    borderColor: 'rgba(251,191,36,0.25)',[m
   },[m
   shopText: {[m
     color: '#fbbf24',[m
     fontSize: 13,[m
     fontWeight: '900',[m
[31m-    letterSpacing: 1.2,[m
[32m+[m[32m    letterSpacing: 1,[m
   },[m
 [m
   footerHint: {[m
[1mdiff --git a/src/components/shop/ShopScreen.tsx b/src/components/shop/ShopScreen.tsx[m
[1mindex 38d2da4..a44e6cb 100644[m
[1m--- a/src/components/shop/ShopScreen.tsx[m
[1m+++ b/src/components/shop/ShopScreen.tsx[m
[36m@@ -18,14 +18,19 @@[m [mimport { SHOP_BALLS, type ShopBall } from './shopCatalog';[m
 import { ShopHeader } from './ShopHeader';[m
 import { ShopBallCard } from './ShopBallCard';[m
 [m
[31m-export const ShopScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {[m
[32m+[m[32mtype Props = {[m
[32m+[m[32m  onBack: () => v