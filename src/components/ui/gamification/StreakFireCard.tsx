import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface Props {
  streak: number;
  longestStreak?: number;
}

export function StreakFireCard({ streak, longestStreak }: Props) {
  const isActive = streak > 0;

  return (
    <LinearGradient
      colors={isActive ? ['rgba(255,140,66,0.25)', 'rgba(255,80,30,0.12)'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      style={styles.card}
    >
      <MotiView
        from={{ scale: 0.9 }}
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ type: 'timing', duration: 900, loop: isActive }}
        style={styles.fireWrap}
      >
        <Text style={[styles.fireEmoji, !isActive && styles.fireInactive]}>🔥</Text>
      </MotiView>

      <View style={styles.info}>
        <Text style={[styles.count, isActive && styles.countActive]}>{streak}</Text>
        <Text style={styles.label}>day streak</Text>
      </View>

      {longestStreak !== undefined && longestStreak > 0 && (
        <View style={styles.best}>
          <Text style={styles.bestLabel}>Best</Text>
          <Text style={styles.bestValue}>{longestStreak}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(255,140,66,0.25)',
  },
  fireWrap: {},
  fireEmoji: { fontSize: 32 },
  fireInactive: { opacity: 0.4 },
  info: { flex: 1 },
  count: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  countActive: { color: '#FF8C42' },
  label: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  best: { alignItems: 'flex-end' },
  bestLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  bestValue: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
});
