import React, { useEffect } from 'react';
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
import type { ProfileStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { FeatureRow } from '../../components/ui/subscription/FeatureRow';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { SEED_PLANS } from '../../utils/seedPlans';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useAuthStore } from '../../store/authStore';
import type { FeatureKey } from '../../types/subscription';

type Props = StackScreenProps<ProfileStackParamList, 'SubscriptionStatus'>;

const ALL_FEATURES: FeatureKey[] = [
  'summary',
  'hoq',
  'exam_mode',
  'advanced_analytics',
  'past_papers',
  'ai_tutor',
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-TZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function SubscriptionStatusScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const { subscription, isPremium, fetchSubscription } = useSubscriptionStore();

  useEffect(() => {
    if (user?.uid) fetchSubscription(user.uid);
  }, [user?.uid, fetchSubscription]);

  const premium = isPremium();
  const plan = subscription ? SEED_PLANS.find((p) => p.id === subscription.planId) : null;

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient
        colors={premium ? [`${COLORS.gold}20`, COLORS.bgDark] : [`${COLORS.primary}15`, COLORS.bgDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Subscription</Text>
        <Text style={styles.headerTitle}>Your Plan</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        {premium && subscription && plan ? (
          <LinearGradient colors={GRADIENTS.gold} style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.statusTitle}>{plan.title}</Text>
                <Text style={styles.statusSub}>Active subscription</Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#1A1A1A" />
                <Text style={styles.statusBadgeText}>ACTIVE</Text>
              </View>
            </View>
            <View style={styles.statusMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Expires</Text>
                <Text style={styles.metaValue}>{formatDate(subscription.expiresAt)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Profiles</Text>
                <Text style={styles.metaValue}>{plan.maxProfiles} allowed</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Price</Text>
                <Text style={styles.metaValue}>{plan.priceMonthly.toLocaleString()} TSH/mo</Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.freeCard}>
            <Ionicons name="person-circle-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.freeTitle}>Free Plan</Text>
            <Text style={styles.freeSub}>Limited to daily quiz quotas</Text>
          </View>
        )}

        {/* Feature access */}
        <Text style={styles.sectionLabel}>Feature Access</Text>
        <View style={styles.featureList}>
          {ALL_FEATURES.map((f, i) => (
            <React.Fragment key={f}>
              <FeatureRow featureKey={f} available={premium} />
              {i < ALL_FEATURES.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Daily limits for free users */}
        {!premium && (
          <>
            <Text style={styles.sectionLabel}>Free Daily Limits</Text>
            <View style={styles.limitsCard}>
              {[
                { label: 'Multiple Choice', used: 'MCQ', limit: 5 },
                { label: 'Fill in the Blanks', used: 'FIB', limit: 3 },
                { label: 'True / False', used: 'TF', limit: 2 },
              ].map((item) => (
                <View key={item.used} style={styles.limitRow}>
                  <Text style={styles.limitLabel}>{item.label}</Text>
                  <Text style={styles.limitValue}>{item.limit}/day</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Family link */}
        {premium && subscription?.planId === 'family' && (
          <AppButton
            title="Manage Family Profiles"
            onPress={() => navigation.navigate('FamilyProfiles')}
            variant="secondary"
            icon="people-outline"
          />
        )}

        {/* Upgrade / manage */}
        {!premium ? (
          <AppButton
            title="Upgrade to Premium"
            onPress={() => (navigation as any).navigate('SubscriptionScreen')}
            variant="primary"
            icon="flash"
          />
        ) : (
          <TouchableOpacity style={styles.manageBtn}>
            <Text style={styles.manageBtnText}>Cancel subscription</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING['2xl'],
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  statusCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.md,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusTitle: { color: '#1A1A1A', fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.extrabold },
  statusSub: { color: 'rgba(0,0,0,0.6)', fontSize: TYPOGRAPHY.sizes.sm },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  statusBadgeText: { color: '#1A1A1A', fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  statusMeta: { flexDirection: 'row', gap: SPACING.md },
  metaItem: { flex: 1 },
  metaLabel: { color: 'rgba(0,0,0,0.5)', fontSize: TYPOGRAPHY.sizes.xs },
  metaValue: { color: '#1A1A1A', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  freeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  freeTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold },
  freeSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.sm,
  },
  featureList: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  divider: { height: 1, backgroundColor: COLORS.glassBorder, marginLeft: 52 },
  limitsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  limitLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm },
  limitValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  manageBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  manageBtnText: { color: COLORS.error, fontSize: TYPOGRAPHY.sizes.sm },
});
