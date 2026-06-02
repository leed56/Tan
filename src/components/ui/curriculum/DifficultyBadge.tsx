import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { DifficultyLevel } from '../../../types/curriculum';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  size?: 'sm' | 'md';
}

const CONFIG: Record<DifficultyLevel, { label: string; color: string; bg: string }> = {
  easy:   { label: 'Easy',   color: COLORS.success,  bg: `${COLORS.success}20`  },
  medium: { label: 'Medium', color: COLORS.warning,  bg: `${COLORS.warning}20`  },
  hard:   { label: 'Hard',   color: COLORS.error,    bg: `${COLORS.error}20`    },
};

export function DifficultyBadge({ difficulty, size = 'sm' }: DifficultyBadgeProps) {
  const c = CONFIG[difficulty];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, size === 'md' && styles.md]}>
      <Text style={[styles.text, { color: c.color }, size === 'md' && styles.mdText]}>
        {c.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  md: { paddingHorizontal: SPACING.md, paddingVertical: 5 },
  text: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  mdText: { fontSize: TYPOGRAPHY.sizes.sm },
});
