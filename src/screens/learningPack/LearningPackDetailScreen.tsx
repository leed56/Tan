import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { PremiumLockCard } from '../../components/ui/PremiumLockCard';
import { AppButton } from '../../components/ui/AppButton';
import { ErrorState } from '../../components/ui/ErrorState';
import { LearningPackListItem } from '../../components/ui/curriculum/LearningPackList';
import { SkeletonList } from '../../components/ui/curriculum/SkeletonCard';
import { EmptyCurriculumState } from '../../components/ui/curriculum/EmptyCurriculumState';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useCurriculumStore } from '../../store/curriculumStore';
import { useProgressStore } from '../../store/progressStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { FEATURE_META } from '../../utils/seedPlans';
import type { CurriculumLearningPack } from '../../types/curriculum';
import type { FeatureKey } from '../../types/subscription';

type Props = StackScreenProps<HomeStackParamList, 'LearningPackDetail'>;

export function LearningPackDetailScreen({ navigation, route }: Props) {
  const {
    topicId,
    packTitle,
    subjectColor,
    formId: routeFormId,
    subjectId: routeSubjectId,
  } = route.params;

  const [launching, setLaunching] = useState(false);

  const {
    selectedFormId,
    packsByTopic,
    loadingPacks,
    error,
    fetchLearningPacks,
    clearError,
  } = useCurriculumStore();

  const { getPackProgress } = useProgressStore();
  const { isPremium } = useSubscriptionStore();

  const formId = routeFormId ?? selectedFormId;
  const subjectId = routeSubjectId ?? '';

  useEffect(() => {
    if (subjectId) {
      fetchLearningPacks(formId, subjectId, topicId);
    }
  }, [formId, subjectId, topicId, fetchLearningPacks]);

  const packs = packsByTopic[topicId] ?? [];
  const freePacks = useMemo(() => packs.filter((p) => !p.isPremium), [packs]);
  const premiumPacks = useMemo(() => packs.filter((p) => p.isPremium), [packs]);
  const completedCount = useMemo(
    () => packs.filter((p) => getPackProgress(p.id).isCompleted).length,
    [packs, getPackProgress],
  );

  const nextFreePack = useMemo(
    () => freePacks.find((p) => !getPackProgress(p.id).isCompleted),
    [freePacks, getPackProgress],
  );

  const handlePackPress = useCallback((pack: CurriculumLearningPack) => {
    // Premium pack — check subscription
    if (pack.isPremium) {
      if (!isPremium()) {
        const featureKey: FeatureKey = pack.type === 'summary' ? 'summary' : 'hoq';
        const meta = FEATURE_META[featureKey];
        navigation.navigate('LockedFeaturePreview', {
          featureKey,
          featureTitle: meta?.title ?? pack.title,
          featureDescription: meta?.description ?? 'Upgrade to access this content.',
        });
        return;
      }
      // Premium user, HOQ — same 4-option quiz engine as MCQ, via QuizIntro.
      if (pack.type === 'hoq') {
        navigation.navigate('QuizIntro', {
          packId: pack.id,
          packTitle: pack.title,
          topicId: pack.topicId,
          subjectColor,
          formId,
          subjectId,
          quizType: 'hoq',
        });
        return;
      }
      // Premium user, Summary — no question docs; review content lives on the
      // pack itself as summaryPoints.
      if (pack.type === 'summary') {
        navigation.navigate('SummaryPack', {
          packId: pack.id,
          packTitle: pack.title,
          topicId: pack.topicId,
          subjectColor,
          formId,
          subjectId,
          completionXP: pack.completionXP,
          summaryPoints: pack.summaryPoints ?? [],
        });
        return;
      }
    }
    // Free pack — MCQ / FIB / TF → quiz engine
    if (pack.type === 'mcq' || pack.type === 'fib' || pack.type === 'tf') {
      navigation.navigate('QuizIntro', {
        packId: pack.id,
        packTitle: pack.title,
        topicId: pack.topicId,
        subjectColor,
        formId,
        subjectId,
        quizType: pack.type,
      });
      return;
    }
    // Fallback placeholder (unrecognized pack type)
    setLaunching(true);
    setTimeout(() => {
      setLaunching(false);
      navigation.navigate('PackCompletion', {
        xpEarned: pack.completionXP,
        packTitle: pack.title,
      });
    }, 600);
  }, [navigation, subjectColor, formId, subjectId, isPremium]);

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState
          message={error}
          onRetry={() => { clearError(); fetchLearningPacks(formId, subjectId, topicId); }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient
        colors={[`${subjectColor}25`, COLORS.bgDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topicLabel}>Learning Packs</Text>
        <Text style={styles.topicTitle}>{packTitle}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="layers-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{packs.length} packs</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.success} />
            <Text style={styles.metaText}>{completedCount} completed</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Body */}
      {loadingPacks ? (
        <View style={styles.body}>
          <SkeletonList count={5} />
        </View>
      ) : packs.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyBody}>
          <EmptyCurriculumState
            variant="packs"
            onAction={() => navigation.goBack()}
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {/* Free packs */}
          {freePacks.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Free Content</Text>
              {freePacks.map((pack) => {
                const { progressPercent, isCompleted } = getPackProgress(pack.id);
                return (
                  <LearningPackListItem
                    key={pack.id}
                    pack={pack}
                    subjectColor={subjectColor}
                    progressPercent={progressPercent}
                    isCompleted={isCompleted}
                    onPress={handlePackPress}
                  />
                );
              })}
            </>
          )}

          {/* Premium packs */}
          {premiumPacks.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Premium Content</Text>
              <PremiumLockCard
                title="Premium Packs Locked"
                description="Upgrade to access AI summaries and Higher Order Questions — NECTA's most tested format."
              />
              {premiumPacks.map((pack) => {
                const { progressPercent, isCompleted } = getPackProgress(pack.id);
                return (
                  <View key={pack.id} style={styles.lockedCard}>
                    <LearningPackListItem
                      pack={pack}
                      subjectColor={subjectColor}
                      progressPercent={progressPercent}
                      isCompleted={isCompleted}
                      onPress={handlePackPress}
                    />
                    <View style={styles.lockedOverlay} pointerEvents="none">
                      <Ionicons name="lock-closed" size={20} color={COLORS.gold} />
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {/* Start next pack CTA */}
          {nextFreePack && (
            <View style={styles.ctaSection}>
              <AppButton
                title={launching ? 'Preparing quiz...' : 'Start Next Pack'}
                onPress={() => handlePackPress(nextFreePack)}
                loading={launching}
                variant="primary"
              />
              <Text style={styles.ctaHint}>Continuing: {nextFreePack.title}</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  topicLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  topicTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.2,
  },
  metaRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  metaText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    gap: SPACING.sm,
    paddingBottom: SPACING['3xl'],
  },
  emptyBody: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.sm,
  },
  lockedCard: { position: 'relative' },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(10,14,39,0.5)',
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaSection: {
    gap: SPACING.sm,
    marginTop: SPACING.base,
    paddingTop: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  ctaHint: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
});
