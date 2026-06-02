import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

interface StreakCardProps {
  streak: number;
  compact?: boolean;
}

export function StreakCard({ streak, compact = false }: StreakCardProps) {
  const isActive = streak > 0;

  return (
    <LinearGradient
      colors={
        isActive
          ? ['rgba(247, 197, 46, 0.2)', 'rgba(255, 140, 66, 0.15)']
          : ['rgba(107, 116, 153, 0.15)', 'rgba(107, 116, 153, 0.05)']
      }
      style={[styles.card, compact && styles.compact]}
    >
      <View style={[styles.iconContainer, isActive && styles.iconActive]}>
        <Ionicons
          name="flame"
          size={compact ? 20 : 28}
          color={isActive ? '#FF8C42' : COLORS.textMuted}
        />
      </View>
      <View style={styles.text}>
        <Text style={[styles.number, isActive && styles.numberActive]}>
          {streak}
        </Text>
        <Text style={styles.label}>{compact ? 'streak' : 'day streak'}</Text>
      </View>
      {!compact && streak >= 7 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥 Hot!</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(247, 197, 46, 0.2)',
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  compact: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(107, 116, 153, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: 'rgba(255, 140, 66, 0.2)',
  },
  text: { flex: 1 },
  number: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.1,
  },
  numberActive: {
    color: '#FF8C42',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(255, 140, 66, 0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#FF8C42',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
