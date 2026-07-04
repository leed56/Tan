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
      style={[
        styles.cardWrap,
        isSelected && (plan.isPopular ? styles.cardWrapSelectedGold : styles.cardWrapSelected),
      ]}
    >
      {plan.isPopular ? (
        <LinearGradient
          colors={isSelected ? [`${COLORS.gold}1F`, COLORS.bgCard] : [COLORS.bgCard, COLORS.bgCard]}
          style={[styles.card, isSelected && styles.cardSelectedGold]}
        >
          <PlanCardBody
            plan={plan}
            isSelected={isSelected}
            billingCycle={billingCycle}
            price={price}
            profileLabel={profileLabel}
          />
        </LinearGradient>
      ) : (
        <View style={[styles.card, isSelected && styles.cardSelected]}>
          <PlanCardBody
            plan={plan}
            isSelected={isSelected}
            billingCycle={billingCycle}
            price={price}
            profileLabel={profileLabel}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

function PlanCardBody({
  plan,
  isSelected,
  billingCycle,
  price,
  profileLabel,
}: {
  plan: SubscriptionPlan;
  isSelected: boolean;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  profileLabel: string;
}) {
  return (
    <>
      {plan.isPopular && (
        <LinearGradient colors={GRADIENTS.gold} style={styles.popularBadge}>
          <Ionicons name="star" size={11} color="#1A1A1A" />
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </LinearGradient>
      )}

      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planDesc}>{plan.description}</Text>
        </View>
        <View
          style={[
            styles.radioOuter,
            isSelected && (plan.isPopular ? styles.radioOuterGold : styles.radioOuterSelected),
          ]}
        >
          {isSelected && (
            <Ionicons
              name="checkmark"
              size={13}
              color={plan.isPopular ? '#1A1A1A' : COLORS.textPrimary}
            />
          )}
        </View>
      </View>

      <View style={styles.pricingRow}>
        <Text style={styles.price}>{price.toLocaleString()}</Text>
        <Text style={styles.currency}>TSH</Text>
        <Text style={styles.period}>/{billingCycle === 'yearly' ? 'year' : 'month'}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.features}>
        {plan.features.map((f) => {
          const meta = FEATURE_META[f];
          return (
            <View key={f} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIconBg,
                  { backgroundColor: plan.isPopular ? `${COLORS.gold}20` : `${COLORS.success}18` },
                ]}
              >
                <Ionicons
                  name={(meta?.iconName as keyof typeof Ionicons.glyphMap) ?? 'checkmark-circle'}
                  size={13}
                  color={plan.isPopular ? COLORS.gold : COLORS.success}
                />
              </View>
              <Text style={styles.featureText}>{meta?.title ?? f}</Text>
            </View>
          );
        })}
        <View style={styles.featureRow}>
          <View style={styles.featureIconBgMuted}>
            <Ionicons name="people-outline" size={13} color={COLORS.textMuted} />
          </View>
          <Text style={styles.featureText}>{profileLabel}</Text>
        </View>
        <View style={styles.featureRow}>
          <View style={styles.featureIconBgMuted}>
            <Ionicons name="phone-portrait-outline" size={13} color={COLORS.textMuted} />
          </View>
          <Text style={styles.featureText}>Up to {plan.maxDevices} devices</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: RADIUS.xl + 2,
  },
  cardWrapSelected: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cardWrapSelectedGold: {
    shadowColor: COLORS.gold,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    gap: SPACING.sm,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}12`,
  },
  cardSelectedGold: {
    borderColor: COLORS.gold,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderBottomLeftRadius: RADIUS.md,
  },
  popularText: {
    color: '#1A1A1A',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, paddingRight: SPACING.xl },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  radioOuterGold: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold,
  },
  info: { flex: 1 },
  planTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  planDesc: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    lineHeight: TYPOGRAPHY.sizes.xs * 1.5,
  },
  pricingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  price: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  currency: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  period: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: 4,
    marginLeft: 2,
  },
  divider: { height: 1, backgroundColor: COLORS.glassBorder },
  features: { gap: SPACING.xs },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  featureIconBg: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconBgMuted: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCardLight,
  },
  featureText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, flex: 1 },
});
