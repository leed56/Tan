import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { PaymentProvider } from '../../../types/subscription';
import { PAYMENT_META } from '../../../utils/seedPlans';

interface Props {
  provider: PaymentProvider;
  isSelected: boolean;
  onSelect: (provider: PaymentProvider) => void;
}

export function PaymentMethodCard({ provider, isSelected, onSelect }: Props) {
  const meta = PAYMENT_META[provider];
  if (!meta) return null;

  return (
    <TouchableOpacity
      onPress={() => onSelect(provider)}
      activeOpacity={0.8}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={meta.logo as keyof typeof Ionicons.glyphMap}
          size={22}
          color={isSelected ? COLORS.primary : COLORS.textSecondary}
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>{meta.label}</Text>
        <Text style={styles.instructions} numberOfLines={2}>{meta.instructions}</Text>
      </View>
      <View style={[styles.radioOuter, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgCardLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1 },
  label: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  labelSelected: { color: COLORS.primary },
  instructions: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    lineHeight: TYPOGRAPHY.sizes.xs * 1.5,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: { borderColor: COLORS.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
});
