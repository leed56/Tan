import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { BadgeDefinition } from '../../../types/gamification';

interface Props {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

const RARITY_GRADIENT: Record<string, string[]> = {
  common: ['#4ECDC4', '#2EAF9F'],
  rare: ['#7B6FF2', '#5A50CC'],
  epic: ['#F7C52E', '#D4A017'],
};

export function BadgeCard({ badge, earned, earnedAt, size = 'md' }: Props) {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 32 : 24;
  const circleSize = size === 'sm' ? 44 : size === 'lg' ? 72 : 56;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 50 }}
      style={[styles.card, size === 'sm' && styles.cardSm]}
    >
      {earned ? (
        <LinearGradient
          colors={RARITY_GRADIENT[badge.rarity] ?? RARITY_GRADIENT.common}
          style={[styles.iconCircle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}
        >
          <Ionicons name={badge.iconName as keyof typeof Ionicons.glyphMap} size={iconSize} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={[styles.iconCircleLocked, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}>
          <Ionicons name="lock-closed" size={iconSize} color={COLORS.textDisabled} />
        </View>
      )}

      <Text style={[styles.title, !earned && styles.titleLocked, size === 'sm' && styles.titleSm]} numberOfLines={2}>
        {badge.title}
      </Text>

      {size !== 'sm' && (
        <Text style={styles.req} numberOfLines={2}>{badge.requirement}</Text>
      )}

      {earned && size !== 'sm' && (
        <View style={[styles.rarityPill, { backgroundColor: `${badge.color}20`, borderColor: `${badge.color}40` }]}>
          <Text style={[styles.rarityText, { color: badge.color }]}>{badge.rarity.toUpperCase()}</Text>
        </View>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cardSm: { padding: SPACING.sm, gap: SPACING.xs },
  iconCircle: { alignItems: 'center', justifyContent: 'center' },
  iconCircleLocked: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgCardLight },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
  titleLocked: { color: COLORS.textMuted },
  titleSm: { fontSize: TYPOGRAPHY.sizes.xs },
  req: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, textAlign: 'center', lineHeight: TYPOGRAPHY.sizes.xs * 1.5 },
  rarityPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
  },
  rarityText: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold },
});
