import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../../theme';
import { SEED_PLANS, FEATURE_META } from '../../../utils/seedPlans';
import type { FeatureKey } from '../../../types/subscription';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  /** Optional feature that triggered this modal */
  triggerFeature?: FeatureKey;
}

const FEATURES: FeatureKey[] = [
  'summary',
  'hoq',
  'exam_mode',
  'advanced_analytics',
  'past_papers',
  'ai_tutor',
];

export function PremiumUpgradeModal({
  visible,
  onClose,
  onSelectPlan,
  triggerFeature,
}: Props) {
  const triggerMeta = triggerFeature ? FEATURE_META[triggerFeature] : null;

  const handlePlan = useCallback(
    (planId: string) => {
      onSelectPlan(planId);
      onClose();
    },
    [onSelectPlan, onClose],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.crownBadge}>
            <Ionicons name="flash" size={22} color="#1A1A1A" />
          </LinearGradient>
          <Text style={styles.headline}>Unlock Premium</Text>
          {triggerMeta ? (
            <Text style={styles.subheadline}>
              Access <Text style={styles.highlight}>{triggerMeta.title}</Text> and all premium features
            </Text>
          ) : (
            <Text style={styles.subheadline}>
              Get unlimited access to all NECTA study tools
            </Text>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
        >
          {/* Feature list */}
          <View style={styles.featureList}>
            {FEATURES.map((f) => {
              const meta = FEATURE_META[f];
              const isHighlighted = f === triggerFeature;
              return (
                <View
                  key={f}
                  style={[styles.featureItem, isHighlighted && styles.featureHighlighted]}
                >
                  <Ionicons
                    name={meta.iconName as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={isHighlighted ? COLORS.gold : COLORS.success}
                  />
                  <Text style={[styles.featureText, isHighlighted && styles.featureTextHighlighted]}>
                    {meta.title}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Plans */}
          <Text style={styles.choosePlan}>Choose a Plan</Text>
          {SEED_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => handlePlan(plan.id)}
              activeOpacity={0.85}
              style={[styles.planCard, plan.isPopular && styles.planCardPopular]}
            >
              {plan.isPopular && (
                <LinearGradient colors={GRADIENTS.gold} style={styles.popularPill}>
                  <Text style={styles.popularPillText}>BEST VALUE</Text>
                </LinearGradient>
              )}
              <View style={styles.planRow}>
                <View style={styles.planInfo}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planSub}>Up to {plan.maxProfiles} profile{plan.maxProfiles > 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.planPricing}>
                  <Text style={styles.planPrice}>
                    {plan.priceMonthly.toLocaleString()} <Text style={styles.planCurrency}>TSH</Text>
                  </Text>
                  <Text style={styles.planPeriod}>/month</Text>
                </View>
              </View>
              <View style={styles.planCta}>
                <LinearGradient
                  colors={plan.isPopular ? GRADIENTS.gold : GRADIENTS.primary}
                  style={styles.planCtaBtn}
                >
                  <Text style={[styles.planCtaText, !plan.isPopular && styles.planCtaTextWhite]}>
                    Subscribe
                  </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ))}

          <Text style={styles.footer}>
            Cancel anytime. Mobile money & WhatsApp payments accepted.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.glassBorder,
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  header: {
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.xl,
    paddingBottom: SPACING.base,
  },
  crownBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  subheadline: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
  highlight: { color: COLORS.gold, fontWeight: TYPOGRAPHY.weights.bold },
  closeBtn: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.xl,
    padding: SPACING.xs,
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  featureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  featureHighlighted: {
    borderColor: `${COLORS.gold}60`,
    backgroundColor: `${COLORS.gold}10`,
  },
  featureText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs },
  featureTextHighlighted: { color: COLORS.gold, fontWeight: TYPOGRAPHY.weights.semibold },
  choosePlan: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.sm,
  },
  planCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    gap: SPACING.sm,
    overflow: 'hidden',
  },
  planCardPopular: {
    borderColor: COLORS.gold,
    backgroundColor: `${COLORS.gold}08`,
  },
  popularPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  popularPillText: { color: '#1A1A1A', fontSize: 10, fontWeight: TYPOGRAPHY.weights.extrabold },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planInfo: { gap: 2 },
  planTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  planSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  planPricing: { alignItems: 'flex-end' },
  planPrice: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  planCurrency: { fontSize: TYPOGRAPHY.sizes.xs },
  planPeriod: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  planCta: {},
  planCtaBtn: {
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  planCtaText: {
    color: '#1A1A1A',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  planCtaTextWhite: { color: COLORS.textPrimary },
  footer: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.xs * 1.6,
    marginTop: SPACING.sm,
  },
});
