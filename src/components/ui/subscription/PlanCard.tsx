import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../../theme';
import type { SubscriptionPlan } from '../../../types/subscription';
import { FEATURE_META } from '../../../utils/seedPlans';

interface Props {
  plan: SubscriptionPlan;
  isSelected: boolean;
  billingCycle?: 'monthly' | 'yearly';
  onSelect: (planId: string) => void;
}

export function PlanCard({ plan, isSelected, billingCycle = 'monthly', onSelect }: Props) {
  const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const profileLabel =
    plan.id === 'family'
      ? '1 primary + 3 student profiles'
      : `${plan.maxProfiles} profile`;

  return (
    <TouchableOpacity
      onPress={() => onSelect(plan.id)}
      activeOpacity={0.85}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      {plan.isPopular && (
        <LinearGradient colors={GRADIENTS.gold} style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </LinearGradient>
      )}

      <View style={styles.row}>
        <View style={styles.radioOuter}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <View style={styles.info}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planDesc}>{plan.description}</Text>
        </View>
        <View style={styles.pricing}>
          <Text style={styles.price}>
            {price.toLocaleString()}
            <Text style={styles.currency}> TSH</Text>
          </Text>
          <Text style={styles.period}>/{billingCycle === 'yearly' ? 'year' : 'month'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.features}>
        {plan.features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.featureText}>{FEATURE_META[f]?.title ?? f}</Text>
          </View>
        ))}
        <View style={styles.featureRow}>
          <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.featureText}>{profileLabel}</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="phone-portrait-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.featureText}>Up to {plan.maxDevices} devices</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    gap: SPACING.md,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}12`,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderBottomLeftRadius: RADIUS.md,
  },
  popularText: {
    color: '#1A1A1A',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  info: { flex: 1 },
  planTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  planDesc: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    lineHeight: TYPOGRAPHY.sizes.xs * 1.5,
  },
  pricing: { alignItems: 'flex-end' },
  price: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  currency: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textMuted,
  },
  period: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  divider: { height: 1, backgroundColor: COLORS.glassBorder },
  features: { gap: 6 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, flex: 1 },
});
