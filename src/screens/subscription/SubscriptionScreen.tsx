import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
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
import { notify } from '../../utils/confirm';
import type { FeatureKey, PlanId, BillingCycle } from '../../types/subscription';

type Props = StackScreenProps<HomeStackParamList, 'SubscriptionScreen'>;

const WHATSAPP_NUMBER = process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP_NUMBER ?? null;
const WHATSAPP_GREEN = '#25D366';
// Google Play billing only exists inside the installed Android app — it must
// never surface on web or iOS (where it does nothing and confuses buyers, and
// on Play it's the *required* path for digital goods). Shown on Android only.
const SHOW_GOOGLE_PLAY = Platform.OS === 'android';

const ALL_FEATURES: FeatureKey[] = [
  'summary',
  'hoq',
  'exam_mode',
  'advanced_analytics',
  'past_papers',
  'ai_tutor',
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

  const handleContinue = () => {
    navigation.navigate('PaymentMethodScreen', {
      planId: selectedPlanId,
      planTitle: selectedPlan.title,
      billingCycle,
      price,
    });
  };

  const handleDemo = () => {
    enableDemo(selectedPlanId);
    navigation.goBack();
  };

  // Direct WhatsApp upgrade — opens a chat pre-filled with the chosen plan so
  // support can confirm mobile-money payment and activate instantly.
  const handleWhatsAppUpgrade = () => {
    if (!WHATSAPP_NUMBER) {
      notify(
        'WhatsApp upgrade',
        'Our WhatsApp line is being set up. For now, tap "Pay with Mobile Money" to subscribe.',
      );
      return;
    }
    const text = encodeURIComponent(
      `Hello! I'd like to upgrade to Soma AI *${selectedPlan.title}* (${billingCycle}) for ${price.toLocaleString()} TSH.`,
    );
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    Linking.openURL(url).catch(() => {});
  };

  // Google Play billing is a native module that isn't wired yet. Rather than a
  // dead button (or a Play-policy-violating WhatsApp redirect), it degrades to
  // a clear message pointing at the working payment routes.
  const handleGooglePlay = () => {
    notify(
      'Google Play',
      'Google Play billing is coming to the Android app. For now, upgrade instantly via mobile money or WhatsApp.',
    );
  };

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

        {/* CTAs — mobile money is the primary route everywhere; WhatsApp is a
            direct-contact fallback; Google Play only shows inside the Android
            app (never on web/iOS). */}
        <AppButton
          title={`Pay with Mobile Money · ${price.toLocaleString()} TSH/${billingCycle === 'yearly' ? 'yr' : 'mo'}`}
          onPress={handleContinue}
          variant="primary"
          icon={<Ionicons name="phone-portrait-outline" size={18} color={COLORS.textPrimary} />}
        />
        <AppButton
          title="Chat on WhatsApp to upgrade"
          onPress={handleWhatsAppUpgrade}
          variant="secondary"
          icon={<Ionicons name="logo-whatsapp" size={18} color={WHATSAPP_GREEN} />}
        />
        {SHOW_GOOGLE_PLAY && (
          <AppButton
            title="Subscribe with Google Play"
            onPress={handleGooglePlay}
            variant="secondary"
            icon={<Ionicons name="logo-google-playstore" size={18} color={COLORS.primary} />}
          />
        )}

        {/* Demo mode — dev builds only; in release this granted full premium
            (unlimited quizzes, HOQ, summaries) to any free user in one tap. */}
        {__DEV__ && (
          <TouchableOpacity onPress={handleDemo} style={styles.demoBtn}>
            <Text style={styles.demoBtnText}>Try Demo Premium (dev only)</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>
          Cancel anytime.{' '}
          {SHOW_GOOGLE_PLAY
            ? 'Pay via Google Play, mobile money, or WhatsApp.'
            : 'Payments via mobile money or WhatsApp support.'}
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
