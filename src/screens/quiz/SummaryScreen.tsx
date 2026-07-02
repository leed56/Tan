import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { ErrorState } from '../../components/ui/ErrorState';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

type Props = StackScreenProps<HomeStackParamList, 'SummaryPack'>;

// Summary packs have no question docs and no right/wrong scoring — they're a
// self-paced study aid (per-point review), so completion is self-reported
// rather than graded.
export function SummaryScreen({ navigation, route }: Props) {
  const { packTitle, subjectColor, completionXP, summaryPoints } = route.params;
  const [reviewedCount, setReviewedCount] = useState(0);

  const allReviewed = summaryPoints.length > 0 && reviewedCount >= summaryPoints.length;

  const handleReviewedPoint = (index: number) => {
    setReviewedCount((c) => Math.max(c, index + 1));
  };

  const handleFinish = () => {
    navigation.replace('PackCompletion', {
      xpEarned: completionXP,
      packTitle,
    });
  };

  if (summaryPoints.length === 0) {
    return (
      <ScreenContainer>
        <ErrorState
          message="This summary isn't ready yet. Please check back soon."
          onRetry={() => navigation.goBack()}
          retryLabel="Go Back"
          fullScreen
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient colors={[`${subjectColor}28`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Summary</Text>
        <Text style={styles.headerTitle} numberOfLines={2}>{packTitle}</Text>
        <View style={styles.progressChip}>
          <Ionicons name="document-text-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.progressChipText}>
            {Math.min(reviewedCount, summaryPoints.length)}/{summaryPoints.length} points reviewed
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {summaryPoints.map((item, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.85}
            onPress={() => handleReviewedPoint(i)}
            style={[
              styles.pointCard,
              i < reviewedCount && { borderColor: `${subjectColor}55` },
            ]}
          >
            <View style={styles.pointHeader}>
              <View style={[styles.pointBadge, { backgroundColor: `${subjectColor}25` }]}>
                <Text style={[styles.pointBadgeText, { color: subjectColor }]}>{i + 1}</Text>
              </View>
              <Text style={styles.pointTitle}>{item.point}</Text>
              {i < reviewedCount && (
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              )}
            </View>
            {!!item.detail && <Text style={styles.pointDetail}>{item.detail}</Text>}
          </TouchableOpacity>
        ))}

        <AppButton
          title={allReviewed ? `Finish — Earn ${completionXP} XP` : 'Review all points to finish'}
          onPress={handleFinish}
          disabled={!allReviewed}
          variant={allReviewed ? 'gold' : 'secondary'}
          icon={allReviewed ? <Ionicons name="checkmark-circle" size={18} color="#1A1A1A" /> : undefined}
        />
        <Text style={styles.hint}>Tap each card above to mark it reviewed.</Text>
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
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.2,
  },
  progressChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginTop: SPACING.xs,
  },
  progressChipText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  pointCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.xs,
  },
  pointHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  pointBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  pointBadgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  pointTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
  },
  pointDetail: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.55,
    marginLeft: 30,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: -SPACING.xs,
  },
});
