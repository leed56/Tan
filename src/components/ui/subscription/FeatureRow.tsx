import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { FeatureKey } from '../../../types/subscription';
import { FEATURE_META } from '../../../utils/seedPlans';

interface Props {
  featureKey: FeatureKey;
  available: boolean;
}

export function FeatureRow({ featureKey, available }: Props) {
  const meta = FEATURE_META[featureKey];
  if (!meta) return null;

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, available ? styles.iconAvail : styles.iconLocked]}>
        <Ionicons
          name={meta.iconName as keyof typeof Ionicons.glyphMap}
          size={16}
          color={available ? COLORS.success : COLORS.textMuted}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, !available && styles.titleLocked]}>{meta.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{meta.description}</Text>
      </View>
      {available ? (
        <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
      ) : (
        <Ionicons name="lock-closed" size={16} color={COLORS.gold} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconAvail: { backgroundColor: `${COLORS.success}15` },
  iconLocked: { backgroundColor: COLORS.bgCardLight },
  textWrap: { flex: 1 },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  titleLocked: { color: COLORS.textMuted },
  desc: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: TYPOGRAPHY.sizes.xs * 1.5,
    marginTop: 2,
  },
});
