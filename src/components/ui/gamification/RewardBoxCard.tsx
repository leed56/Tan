import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../../theme';
import type { RewardBox } from '../../../types/gamification';

interface Props {
  box: RewardBox;
  onOpen?: () => void;
}

const RARITY_GRADIENT: Record<string, string[]> = {
  common: ['rgba(78,205,196,0.2)', 'rgba(78,205,196,0.05)'],
  rare: ['rgba(123,111,242,0.2)', 'rgba(123,111,242,0.05)'],
  epic: ['rgba(247,197,46,0.25)', 'rgba(247,197,46,0.05)'],
};

const RARITY_COLOR: Record<string, string> = {
  common: COLORS.success,
  rare: COLORS.primary,
  epic: COLORS.gold,
};

export function RewardBoxCard({ box, onOpen }: Props) {
  const canOpen = box.isAvailable;
  const color = RARITY_COLOR[box.rarity];

  return (
    <LinearGradient colors={RARITY_GRADIENT[box.rarity] ?? RARITY_GRADIENT.common} style={styles.card}>
      <View style={[styles.boxIcon, { borderColor: `${color}40` }]}>
        <Text style={styles.boxEmoji}>
          {box.rarity === 'epic' ? '🎁' : box.rarity === 'rare' ? '📦' : '📫'}
        </Text>
      </View>

      <Text style={styles.label}>{box.label}</Text>
      <Text style={styles.rewards}>
        {box.coinsMin}–{box.coinsMax} 🪙
        {box.xpBonus > 0 ? ` · +${box.xpBonus} XP` : ''}
      </Text>

      <View style={[styles.rarityPill, { backgroundColor: `${color}15`, borderColor: `${color}40` }]}>
        <Text style={[styles.rarityText, { color }]}>{box.rarity.toUpperCase()}</Text>
      </View>

      {canOpen ? (
        <TouchableOpacity onPress={onOpen} activeOpacity={0.85} style={styles.openBtnWrap}>
          <LinearGradient
            colors={box.rarity === 'epic' ? GRADIENTS.gold : GRADIENTS.primary}
            style={styles.openBtn}
          >
            <Ionicons name="gift-outline" size={14} color={box.rarity === 'epic' ? '#1A1A1A' : COLORS.textPrimary} />
            <Text style={[styles.openBtnText, box.rarity === 'epic' && styles.openBtnTextDark]}>Open</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.lockedBtn}>
          <Ionicons name="lock-closed-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.lockedBtnText}>Locked</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  boxIcon: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  boxEmoji: { fontSize: 32 },
  label: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, textAlign: 'center' },
  rewards: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs },
  rarityPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderWidth: 1,
  },
  rarityText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold },
  openBtnWrap: { width: '100%' },
  openBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, borderRadius: RADIUS.md, paddingVertical: SPACING.sm,
  },
  openBtnText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  openBtnTextDark: { color: '#1A1A1A' },
  lockedBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
  },
  lockedBtnText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
});
