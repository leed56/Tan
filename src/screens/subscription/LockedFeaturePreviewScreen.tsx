import React from 'react';
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
import { AppButton } from '../../components/ui/AppButton';
import { FeatureRow } from '../../components/ui/subscription/FeatureRow';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { FEATURE_META, SEED_PLANS } from '../../utils/seedPlans';
import type { FeatureKey } from '../../types/subscription';

const standardPlan = SEED_PLANS.find((p) => p.id === 'standard')!;
const familyPlan = SEED_PLANS.find((p) => p.id === 'family')!;

type Props = StackScreenProps<HomeStackParamList, 'LockedFeaturePreview'>;

const ALL_FEATURES: FeatureKey[] = [
  'full_practice',
  'summary',
  'hoq',
  'exam_mode',
  'advanced_analytics',
];

export function LockedFeaturePreviewScreen({ navigation, route }: Props) {
  const { featureKey, featureTitle, featureDescription } = route.params;
  const meta = FEATURE_META[featureKey];

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

        {/* Lock icon */}
        <View style={styles.lockIconWrap}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.lockIcon}>
            <Ionicons
              name={(meta?.iconName ?? 'lock-closed') as keyof typeof Ionicons.glyphMap}
              size={32}
              color="#1A1A1A"
            />
          </LinearGradient>
        </View>

        <View style={styles.premiumBadge}>
          <Ionicons name="lock-closed" size={12} color={COLORS.gold} />
          <Text style={styles.premiumBadgeText}>Premium</Text>
        </View>
        <Text style={styles.featureTitle}>{featureTitle}</Text>
        <Text style={styles.featureDesc}>{featureDescription}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview card (blurred / locked visual) */}
        <View style={styles.previewCard}>
          <View style={styles.previewFrosted}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.previewLine}>
                <View style={[styles.previewBlock, { width: `${60 + i * 10}%` as any }]} />
              </View>
            ))}
          </View>
          <View style={styles.previewOverlay}>
            <Ionicons name="lock-closed" size={28} color={COLORS.gold} />
            <Text style={styles.previewOverlayText}>Upgrade to unlock</Text>
          </View>
        </View>

        {/* What's included */}
        <Text style={styles.sectionLabel}>Everything in Premium</Text>
        <View style={styles.featureList}>
          {ALL_FEATURES.map((f, i) => (
            <React.Fragment key={f}>
              <FeatureRow featureKey={f as FeatureKey} available={false} />
              {i < ALL_FEATURES.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Plans summary */}
        <View style={styles.planRow}>
          <View style={styles.planChip}>
            <Text style={styles.planChipTitle}>{standardPlan.title}</Text>
            <Text style={styles.planChipPrice}>{standardPlan.priceMonthly.toLocaleString()} TSH/mo</Text>
          </View>
          <View style={[styles.planChip, styles.planChipPopular]}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.planChipBadge}>
              <Text style={styles.planChipBadgeText}>BEST</Text>
            </LinearGradient>
            <Text style={styles.planChipTitle}>{familyPlan.title}</Text>
            <Text style={styles.planChipPrice}>{familyPlan.priceMonthly.toLocaleString()} TSH/mo</Text>
            <Text style={styles.planChipSub}>1 primary + 3 profiles</Text>
          </View>
        </View>

        <AppButton
          title="Upgrade to Premium"
          onPress={() => navigation.navigate('SubscriptionScreen')}
          variant="primary"
          icon={<Ionicons name="flash" size={18} color={COLORS.textPrimary} />}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Maybe later</Text>
        </TouchableOpacity>
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
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  lockIconWrap: { marginTop: SPACING.sm },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.gold}15`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${COLORS.gold}40`,
    marginTop: SPACING.sm,
  },
  premiumBadgeText: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  featureTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    textAlign: 'center',
  },
  featureDesc: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
    paddingHorizontal: SPACING.lg,
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  previewCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    minHeight: 120,
  },
  previewFrosted: { padding: SPACING.base, gap: SPACING.sm, opacity: 0.2 },
  previewLine: { paddingVertical: 4 },
  previewBlock: { height: 12, backgroundColor: COLORS.textPrimary, borderRadius: RADIUS.sm },
  previewOverlay: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,14,39,0.6)',
    gap: SPACING.sm,
  },
  previewOverlayText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
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
  planRow: { flexDirection: 'row', gap: SPACING.sm },
  planChip: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: 4,
    overflow: 'hidden',
  },
  planChipPopular: {
    borderColor: `${COLORS.gold}50`,
    backgroundColor: `${COLORS.gold}08`,
  },
  planChipBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginBottom: 2,
  },
  planChipBadgeText: { color: '#1A1A1A', fontSize: 9, fontWeight: TYPOGRAPHY.weights.extrabold },
  planChipTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  planChipPrice: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  planChipSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  skipBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  skipText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
});
