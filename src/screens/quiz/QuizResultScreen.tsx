import React, { useState, useEffect } from 'react';
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
import { ResultSummaryCard } from '../../components/ui/quiz/ResultSummaryCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { useGamificationStore } from '../../store/gamificationStore';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { useMissionStore } from '../../store/missionStore';
import { updateLeaderboardScore } from '../../services/leaderboardService';
import { XPAnimationOverlay } from '../../components/ui/gamification/XPAnimationOverlay';
import { LevelUpModal } from '../../components/ui/gamification/LevelUpModal';
import { BadgeUnlockModal } from '../../components/ui/gamification/BadgeUnlockModal';

type Props = StackScreenProps<HomeStackParamList, 'QuizResult'>;

const TYPE_LABEL: Record<string, string> = {
  mcq: 'Multiple Choice',
  fib: 'Fill in the Blanks',
  tf: 'True / False',
  hoq: 'Higher Order Questions',
};

export function QuizResultScreen({ navigation, route }: Props) {
  const {
    xpEarned,
    scorePercent,
    correctCount,
    wrongCount,
    totalQuestions,
    packTitle,
    packId,
    topicId,
    subjectColor,
    formId,
    subjectId,
    quizType,
  } = route.params;

  const { pendingLevelUp, pendingBadges, dismissLevelUp, dismissBadge, checkStreak, checkBadges, persistProfile } = useGamificationStore();
  const uid = useAuthStore((s) => s.user?.uid);
  const profile = useProfileStore((s) => s.profile);
  const updateMissionProgress = useMissionStore((s) => s.updateProgress);
  const [showXpAnim, setShowXpAnim] = useState(xpEarned > 0);

  // On quiz completion: advance the daily streak, evaluate badge unlocks, persist
  // the gamification profile, update the leaderboard, and advance daily missions.
  useEffect(() => {
    if (uid) {
      checkBadges(uid, {
        quizScorePercent: scorePercent,
        subjectKey: subjectId,
        totalQuestions,
        correctCount,
      });
      checkStreak(uid).catch(() => {});
      persistProfile(uid).catch(() => {});
      if (xpEarned > 0 && profile) {
        updateLeaderboardScore(
          uid,
          profile.name,
          profile.avatarId,
          profile.form,
          profile.school ?? '',
          xpEarned,
        ).catch(() => {});
      }
      updateMissionProgress(uid, 'quizzes_completed', 1).catch(() => {});
      updateMissionProgress(uid, 'questions_answered', totalQuestions).catch(() => {});
      if (xpEarned > 0) updateMissionProgress(uid, 'xp_earned_today', xpEarned).catch(() => {});
    }
    // Run once per result screen mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    navigation.replace('QuizIntro', {
      packId,
      packTitle,
      topicId,
      subjectColor,
      formId,
      subjectId,
      quizType,
    });
  };

  const handleBackToPacks = () => {
    navigation.navigate('LearningPackDetail', {
      packId,
      packTitle,
      topicId,
      subjectColor,
      formId,
      subjectId,
    });
  };

  return (
    <ScreenContainer padded={false}>
      {/* Header gradient */}
      <LinearGradient
        colors={[`${subjectColor}28`, COLORS.bgDark]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLabel}>Quiz Complete</Text>
            <Text style={styles.headerTitle} numberOfLines={2}>{packTitle}</Text>
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText}>{TYPE_LABEL[quizType] ?? quizType}</Text>
            </View>
          </View>
          {xpEarned > 0 && (
            <LinearGradient colors={GRADIENTS.gold} style={styles.xpBadge}>
              <Ionicons name="flash" size={18} color="#1A1A1A" />
              <Text style={styles.xpBadgeText}>+{xpEarned} XP</Text>
            </LinearGradient>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Score summary */}
        <ResultSummaryCard
          scorePercent={scorePercent}
          correctCount={correctCount}
          wrongCount={wrongCount}
          totalQuestions={totalQuestions}
          xpEarned={xpEarned}
        />

        {/* Accuracy tip */}
        {scorePercent < 70 && (
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={18} color={COLORS.gold} />
            <Text style={styles.tipText}>
              Review the explanations for missed questions before retrying. Understanding mistakes is key to NECTA success.
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {wrongCount > 0 && (
            <AppButton
              title="Review Mistakes"
              onPress={() => navigation.navigate('WrongAnswerReview', {
                packId,
                packTitle,
                topicId,
                subjectColor,
                formId,
                subjectId,
              })}
              variant="secondary"
              icon={<Ionicons name="bulb-outline" size={18} color={COLORS.primary} />}
            />
          )}
          <AppButton
            title="Retry Quiz"
            onPress={handleRetry}
            variant="secondary"
            icon={<Ionicons name="refresh" size={18} color={COLORS.primary} />}
          />
          <AppButton
            title="Back to Packs"
            onPress={handleBackToPacks}
            variant="primary"
            icon={<Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />}
          />
        </View>

        {/* Streak encouragement */}
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={16} color={COLORS.warning} />
          <Text style={styles.streakText}>Keep your daily streak going — study again tomorrow!</Text>
        </View>
      </ScrollView>

      {xpEarned > 0 && (
        <XPAnimationOverlay
          amount={xpEarned}
          visible={showXpAnim}
          onDone={() => setShowXpAnim(false)}
        />
      )}
      <LevelUpModal
        visible={pendingLevelUp !== null}
        newLevel={pendingLevelUp ?? 1}
        onDismiss={dismissLevelUp}
      />
      <BadgeUnlockModal
        visible={pendingBadges.length > 0}
        badge={pendingBadges[0] ?? null}
        onDismiss={dismissBadge}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING['2xl'],
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  headerLeft: { flex: 1, gap: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.2,
  },
  typeChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  typeChipText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    flexShrink: 0,
  },
  xpBadgeText: {
    color: '#1A1A1A',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.xl,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: 'rgba(247,197,46,0.08)',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(247,197,46,0.2)',
  },
  tipText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
  },
  actions: { gap: SPACING.sm },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  streakText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
});
