import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { PlanCard } from '../../components/ui/subscription/PlanCard';
import { FeatureRow } from '../../components/ui/subscription/FeatureRow';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { SEED_PLANS, FEATURE_META } from '../../utils/seedPlans';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { openWhatsApp } from '../../utils/support';
import type { FeatureKey, PlanId, BillingCycle } from '../../types/subscription';

type Props = StackScreenProps<HomeStackParamList, 'SubscriptionScreen'>;

const ALL_FEATURES: FeatureKey[] = [
  'summary',
  'hoq',
  'exam_mode',
  'advanced_analytics',
];

export function SubscriptionScreen({ navigation }: Props) {
  const { isPremium, subscription, enableDemo } = useSubscriptionStore();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('family');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const alreadyPremium = isPremium();
  const selectedPlan = SEED_PLANS.find((p) => p.id === selectedPlanId)!;
  const price = billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
  const yearlySavingsPct = Math.round(
    100 - (selectedPlan.priceYearly / (selectedPlan.priceMonthly * 12)) * 100,
  );

  const handleDemo = () => {
    enableDemo(selectedPlanId);
    navigation.goBack();
  };

  // WhatsApp is currently the sole upgrade route (mobile money paused). Opens a
  // chat pre-filled with the chosen plan so support can confirm payment and
  // activate the account instantly.
  const handleWhatsAppUpgrade = () =>
    openWhatsApp(
      `Hello! I'd like to upgrade to Soma *${selectedPlan.title}* (${billingCycle}) for ${price.toLocaleString()} TSH.`,
    );

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient
        colors={[`${COLORS.gold}20`, COLORS.bgDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.crownRow}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.crownBadge}>
            <Ionicons name="flash" size={28} color="#1A1A1A" />
          </LinearGradient>
        </View>
        <Text style={styles.headline}>Go Premium</Text>
        <Text style={styles.subheadline}>
          Unlock every NECTA study tool — no limits.
        </Text>

        {alreadyPremium && (
          <View style={styles.activeBanner}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.activeBannerText}>
              Premium active · {subscription?.planId === 'family' ? 'Family Pack' : 'Standard'}
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Feature list */}
        <Text style={styles.sectionLabel}>What you get</Text>
        <View style={styles.featureCard}>
          {ALL_FEATURES.map((f, i) => (
            <React.Fragment key={f}>
              <FeatureRow featureKey={f} available />
              {i < ALL_FEATURES.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Billing cycle toggle */}
        <Text style={styles.sectionLabel}>Billing Cycle</Text>
        <View style={styles.cycleToggle}>
          {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
            <TouchableOpacity
              key={cycle}
              style={[styles.cycleOption, billingCycle === cycle && styles.cycleOptionActive]}
              onPress={() => setBillingCycle(cycle)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cycleText, billingCycle === cycle && styles.cycleTextActive]}>
                {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
              {cycle === 'yearly' && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>Save {yearlySavingsPct}%</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Plan cards */}
        <Text style={styles.sectionLabel}>Choose a Plan</Text>
        {SEED_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlanId === plan.id}
            billingCycle={billingCycle}
            onSelect={(id) => setSelectedPlanId(id as PlanId)}
          />
        ))}

        {/* WhatsApp is the only upgrade route for now — mobile money & Google
            Play are paused. Our team confirms payment on chat and activates the
            account instantly. */}
        <AppButton
          title={`Upgrade on WhatsApp · ${price.toLocaleString()} TSH/${billingCycle === 'yearly' ? 'yr' : 'mo'}`}
          onPress={handleWhatsAppUpgrade}
          variant="primary"
          icon={<Ionicons name="logo-whatsapp" size={18} color={COLORS.textPrimary} />}
        />

        {/* Demo mode — dev builds only; in release this granted full premium
            (unlimited quizzes, HOQ, summaries) to any free user in one tap. */}
        {__DEV__ && (
          <TouchableOpacity onPress={handleDemo} style={styles.demoBtn}>
            <Text style={styles.demoBtnText}>Try Demo Premium (dev only)</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>
          Cancel anytime. Upgrade via WhatsApp — our support team activates your
          account instantly.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING['2xl'],
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  back: {
    alignSelf: 'flex-start',
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  crownRow: { alignItems: 'center', marginTop: SPACING.sm },
  crownBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    textAlign: 'center',
  },
  subheadline: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.success}15`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${COLORS.success}40`,
    marginTop: SPACING.sm,
  },
  activeBannerText: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.sm,
  },
  featureCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  divider: { height: 1, backgroundColor: COLORS.glassBorder, marginLeft: 52 },
  cycleToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 4,
    gap: 4,
  },
  cycleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  cycleOptionActive: { backgroundColor: `${COLORS.primary}20` },
  cycleText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  cycleTextActive: { color: COLORS.primary },
  saveBadge: {
    backgroundColor: `${COLORS.gold}20`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  saveBadgeText: { color: COLORS.gold, fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold },
  demoBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  demoBtnText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    textDecorationLine: 'underline',
  },
  footer: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.xs * 1.6,
  },
});
