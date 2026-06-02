import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface XPBadgeProps {
  xp: number;
  size?: 'sm' | 'md';
  gradient?: boolean;
}

export function XPBadge({ xp, size = 'sm', gradient = false }: XPBadgeProps) {
  const label = `+${xp} XP`;

  if (gradient) {
    return (
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.badge, size === 'md' && styles.md]}
      >
        <Text style={[styles.gradText, size === 'md' && styles.mdText]}>{label}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.badge, styles.plain, size === 'md' && styles.md]}>
      <Text style={[styles.text, size === 'md' && styles.mdText]}>{label}</Text>
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
  plain: {
    backgroundColor: 'rgba(123, 111, 242, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(123, 111, 242, 0.3)',
  },
  md: { paddingHorizontal: SPACING.md, paddingVertical: 5 },
  text: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  gradText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  mdText: { fontSize: TYPOGRAPHY.sizes.sm },
});
