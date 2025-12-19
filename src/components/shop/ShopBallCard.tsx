import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { OrbPreview } from './OrbPreview';
import { WaterBallPreview } from './WaterBallPreview';
import { tierFrame, type ShopBall } from './shopCatalog';

type Props = {
  item: ShopBall;
  owned: boolean;
  selected: boolean;
  canBuy: boolean;
  busy: boolean;
  onBuy: (id: string, price: number) => void;
  onSelect: (id: string) => void;
};

export const ShopBallCard: React.FC<Props> = React.memo(
  ({ item, owned, selected, canBuy, busy, onBuy, onSelect }) => {
    const locked = !owned && !canBuy;
    const disabled = busy || locked || (owned && selected);

    const ctaLabel = !owned ? (locked ? 'LOCKED' : 'BUY') : (selected ? 'EQUIPPED' : 'EQUIP');

    const onPressCTA = () => {
      if (!owned) onBuy(item.id, item.price);
      else onSelect(item.id);
    };

    return (
      <View style={[styles.card, { borderColor: tierFrame(item.tier) }]}>
        {/* glow interne */}
        <View pointerEvents="none" style={[styles.innerGlow, { borderColor: item.accent }]} />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.priceChip, item.price === 0 && styles.priceChipFree]}>
            <Text style={styles.priceValue}>{item.price}</Text>
            <Text style={styles.priceUnit}>C</Text>
          </View>

          <View style={[styles.tierChip, { borderColor: tierFrame(item.tier) }]}>
            <Text style={styles.tierText}>{item.tier}</Text>
          </View>
        </View>

        {/* Orb */}
        <View style={styles.orbWrap}>
          <View pointerEvents="none" style={[styles.orbHalo, { backgroundColor: item.accent }]} />
          {item.id === 'ball_water' ? (
            <WaterBallPreview size={62} />
          ) : (
            <OrbPreview accent={item.accent} size={62} />
          )}
        </View>

        {/* Text */}
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>

        <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
          {item.desc}
        </Text>

        {/* CTA */}
        <Pressable
          onPress={onPressCTA}
          disabled={disabled}
          style={({ pressed }) => [
            styles.cta,
            { borderColor: item.accent },
            locked && styles.ctaLocked,
            selected && styles.ctaEquipped,
            disabled && styles.ctaDisabled,
            pressed && !disabled && styles.ctaPressed,
          ]}
        >
          <Text
            style={[
              styles.ctaText,
              { color: item.accent },
              (locked || selected) && styles.ctaTextOnDark,
            ]}
            numberOfLines={1}
          >
            {ctaLabel}
          </Text>
        </Pressable>

        {/* Badge selected discret */}
        {selected && (
          <View style={[styles.selectedBadge, { borderColor: item.accent }]}>
            <Text style={[styles.selectedText, { color: item.accent }]}>SELECTED</Text>
          </View>
        )}

        {/* voile locked */}
        {locked && <View pointerEvents="none" style={styles.lockedVeil} />}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.2,
    backgroundColor: 'rgba(5,10,24,0.92)',
    overflow: 'hidden',
    minHeight: 250,
    elevation: 4,
  },

  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 20,
    opacity: 0.14,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.30)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  priceChipFree: {
    borderColor: 'rgba(34,211,238,0.35)',
  },
  priceValue: { color: '#fbbf24', fontSize: 12, fontWeight: '900' },
  priceUnit: { color: '#fde68a', fontSize: 10, fontWeight: '900', marginLeft: 4 },

  tierChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  tierText: { color: '#e5e7eb', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  orbWrap: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbHalo: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 96,
    opacity: 0.18,
    transform: [{ scale: 1.15 }],
  },

  name: {
    marginTop: 14,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  desc: {
    marginTop: 6,
    color: '#a3b3c8',
    fontSize: 12,
    lineHeight: 16,
    minHeight: 32,
  },

  cta: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: { opacity: 0.86 },
  ctaDisabled: { opacity: 0.55 },

  ctaLocked: {
    borderColor: 'rgba(148,163,184,0.35)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  ctaEquipped: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  ctaText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  ctaTextOnDark: {
    // garde la lisibilité sur le bouton sombre
  },

  selectedBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  selectedText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },

  lockedVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
});