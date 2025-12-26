// src/screens/MainMenuScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { ChestBox } from '../components/chests/ChestBox';
import { ChestOpeningAnimation } from '../components/chests/ChestOpeningAnimation';

type MainMenuScreenProps = {
onPlay: () => void;
onTuto: () => void;
onOptions: () => void;
onShop: () => void;
};

const backgroundSource = require('../assets/images/menu_driftring.png');

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onPlay, onTuto, onOptions, onShop }) => {
const [isBronzeAnimating, setIsBronzeAnimating] = useState(false);
const [showBronzeFlash, setShowBronzeFlash] = useState(false);

const [isSilverAnimating, setIsSilverAnimating] = useState(false);
const [showSilverFlash, setShowSilverFlash] = useState(false);

const [isNeonAnimating, setIsNeonAnimating] = useState(false);
const [showNeonFlash, setShowNeonFlash] = useState(false);

const handleBronzePress = () => {
console.log('🥉 BRONZE OPENED!');
setIsBronzeAnimating(true);
setShowBronzeFlash(true);
};

const handleBronzeComplete = () => {
console.log('✅ Bronze complete!');
setIsBronzeAnimating(false);
setShowBronzeFlash(false);
};

const handleSilverPress = () => {
console.log('🥈 SILVER OPENED!');
setIsSilverAnimating(true);
setShowSilverFlash(true);
};

const handleSilverComplete = () => {
console.log('✅ Silver complete!');
setIsSilverAnimating(false);
setShowSilverFlash(false);
};

const handleNeonPress = () => {
console.log('🎁 NEON OPENED!');
setIsNeonAnimating(true);
setShowNeonFlash(true);
};

const handleNeonComplete = () => {
console.log('✅ Neon complete!');
setIsNeonAnimating(false);
setShowNeonFlash(false);
};

return (
<ImageBackground source={backgroundSource} style={styles.background} resizeMode="cover">
<View style={styles.overlay}>
<View style={styles.headerRow}>
<View style={styles.headerLeft}>
<Pressable style={styles.headerButton} onPress={onTuto}>
<Text style={styles.headerButtonText}>TUTO</Text>
</Pressable>
<Pressable style={styles.headerButton} onPress={onShop}>
<Text style={styles.headerButtonText}>SHOP</Text>
</Pressable>
</View>
<Pressable style={styles.headerButton} onPress={onOptions}>
<Text style={styles.headerButtonText}>⚙</Text>
</Pressable>
</View>

<View pointerEvents="none" style={styles.titleWrap}>
<Text style={styles.title}>DRIFT-RING</Text>
</View>

<View style={styles.chestsContainer}>
<View style={styles.chestWrapper}>
<Text style={styles.chestLabel}>BRONZE CHEST</Text>
<Text style={styles.chestTimer}>6h</Text>
<View style={styles.chestBox}>
<ChestBox type="bronze" onPress={handleBronzePress} shouldAnimate={isBronzeAnimating} />
</View>
<Pressable style={styles.unlockButton} onPress={handleBronzePress}>
<Text style={styles.unlockText}>UNLOCK</Text>
</Pressable>
<Text style={styles.chestCondition}>Score 80</Text>
</View>

<View style={styles.chestWrapper}>
<Text style={styles.chestLabel}>SILVER CHEST</Text>
<Text style={styles.chestTimer}>12h</Text>
<View style={styles.chestBox}>
<ChestBox type="silver" onPress={handleSilverPress} shouldAnimate={isSilverAnimating} />
</View>
<Text style={styles.countdown}>⏰ 11:58:23</Text>
<Text style={styles.ads}>📺 3h | 0/4</Text>
</View>

<View style={styles.chestWrapper}>
<Text style={styles.chestLabel}>NEON CHEST</Text>
<Text style={styles.chestTimer}>24h</Text>
<View style={styles.chestBox}>
<ChestBox type="neon" onPress={handleNeonPress} shouldAnimate={isNeonAnimating} />
</View>
<Pressable style={styles.openButton} onPress={handleNeonPress}>
<Text style={styles.openText}>OPEN</Text>
</Pressable>
<Text style={styles.price}>💰 1000</Text>
</View>
</View>

<View style={styles.center}>
<Pressable style={styles.playButton} onPress={onPlay}>
<Text style={styles.playText}>PLAY</Text>
</Pressable>
<Text style={styles.metaText}>Best : --</Text>
<Text style={styles.metaText}>Today: 2/3 missions</Text>
</View>

<View style={styles.footer}>
<Text style={styles.footerText}>Pour une expérience optimale, utilise un casque.</Text>
</View>

<ChestOpeningAnimation isActive={showBronzeFlash} onComplete={handleBronzeComplete} />
<ChestOpeningAnimation isActive={showSilverFlash} onComplete={handleSilverComplete} />
<ChestOpeningAnimation isActive={showNeonFlash} onComplete={handleNeonComplete} />
</View>
</ImageBackground>
);
};

export default MainMenuScreen;

const styles = StyleSheet.create({
background: { flex: 1 },
overlay: { flex: 1, paddingHorizontal: 24, paddingVertical: 32 },
headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
headerButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.35)', backgroundColor: 'rgba(0, 0, 0, 0.45)' },
headerButtonText: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: '#e5e7eb' },
titleWrap: { alignItems: 'center', marginTop: 40 },
title: { fontSize: 32, fontWeight: '900', letterSpacing: 4, color: '#f9fafb', textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
chestsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 32, marginBottom: 20 },
chestWrapper: { alignItems: 'center', gap: 6 },
chestLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, color: '#e5e7eb', textTransform: 'uppercase' },
chestTimer: { fontSize: 8, color: '#9ca3af' },
chestBox: { position: 'relative', width: 150, height: 170, justifyContent: 'center', alignItems: 'center' },
unlockButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, backgroundColor: 'rgba(34, 197, 94, 0.2)', borderWidth: 1, borderColor: '#22c55e' },
unlockText: { fontSize: 10, fontWeight: '700', color: '#22c55e', letterSpacing: 1 },
chestCondition: { fontSize: 9, color: '#d1d5db' },
countdown: { fontSize: 10, fontWeight: '600', color: '#60a5fa' },
ads: { fontSize: 8, color: '#9ca3af' },
openButton: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 4, backgroundColor: 'rgba(192, 38, 211, 0.3)', borderWidth: 1, borderColor: '#C026D3' },
openText: { fontSize: 10, fontWeight: '700', color: '#E879F9', letterSpacing: 1 },
price: { fontSize: 10, fontWeight: '600', color: '#fbbf24' },
center: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60, gap: 8 },
playButton: { paddingHorizontal: 48, paddingVertical: 16, borderRadius: 999, borderWidth: 3, borderColor: '#ff6bd5', backgroundColor: 'rgba(0, 0, 0, 0.55)' },
playText: { fontSize: 22, fontWeight: '900', letterSpacing: 3, color: '#ffe6ff' },
metaText: { fontSize: 12, color: '#e5e7eb', opacity: 0.9 },
footer: { alignItems: 'center', paddingBottom: 10 },
footerText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
});