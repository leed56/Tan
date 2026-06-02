import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface PremiumBadgeProps {
  size?: 'sm' | 'md';
  label?: string;
}

export function PremiumBadge({ size = 'sm', label = 'Premium' }: PremiumBadgeProps) {
  return (
    <View style={[styles.badge, size === 'md' && styles.md]}>
      <Ionicons
        name="lock-closed"
        size={size === 'md' ? 12 : 10}
        color={COLORS.gold}
      />
      <Text style={[styles.text, size === 'md' && styles.mdText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(247, 197, 46, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(247, 197, 46, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  md: { paddingHorizontal: SPACING.md, paddingVertical: 5 },
  text: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  mdText: { fontSize: TYPOGRAPHY.sizes.sm },
});
