import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ExplanationSkeleton } from '../../components/ui/explanation/ExplanationSkeleton';
import { GoldExplanationCard } from '../../components/ui/explanation/GoldExplanationCard';
import { ExamTipCard } from '../../components/ui/explanation/ExamTipCard';
import { MemoryTrickCard } from '../../components/ui/explanation/MemoryTrickCard';
import { StepByStepCard } from '../../components/ui/explanation/StepByStepCard';
import { ExplanationFeedbackButtons } from '../../components/ui/explanation/ExplanationFeedbackButtons';
import { LevelUpModal } from '../../components/ui/gamification/LevelUpModal';
import { BadgeUnlockModal } from '../../components/ui/gamification/BadgeUnlockModal';
import { stripMathMarkup } from '../../components/ui/quiz/MathRenderer';
import { useExplanationStore } from '../../store/explanationStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { useProfileStore } from '../../store/profileStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

type Props = StackScreenProps<HomeStackParamList, 'ExplanationScreen'>;

const SUBJECT_NAMES: Record<string, string> = {
  mathematics: 'Mathematics', english: 'English', kiswahili: 'Kiswahili',
  biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics',
  geography: 'Geography', history: 'History', civics: 'Civics',
  commerce: 'Commerce', agriculture: 'Agriculture',
  computerStudies: 'Computer Studies', islamicKnowledge: 'Islamic Knowledge',
};

export function ExplanationScreen({ navigation, route }: Props) {
  const {
    questionId, questionText, quizType, subjectId, formId,
    correctAnswer, options, packTitle, subjectColor, fallbackExplanation,
  } = route.params;

  const { fetchExplanation, getExplanation, isLoading } = useExplanationStore();
  const { pendingLevelUp, pendingBadges, dismissLevelUp, dismissBadge } = useGamificationStore();
  const profile = useProfileStore((s) => s.profile);
  const userId = profile?.uid ?? 'anonymous';

  useEffect(() => {
    fetchExplanation({
      questionId, questionText, correctAnswer, options, quizType,
      subjectId, subjectName: SUBJECT_NAMES[subjectId.replace(/^form_\d+_/, '')] ?? subjectId,
      formId, fallbackExplanation, userId,
    });
  }, [questionId]);

  const explanation = getExplanation(questionId);
  const loading = isLoading(questionId);

  const displayCorrectAnswer = () => {
    if (quizType === 'tf') return correctAnswer === 'true' ? 'True' : 'False';
    const opt = options.find((o) => o.id === correctAnswer);
    return stripMathMarkup(opt ? opt.text : correctAnswer);
  };

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{packTitle}</Text>
        {explanation ? (
          <View style={styles.aiBadge}>
            <Text style={[styles.aiText, { color: subjectColor }]}>
              {explanation.aiProvider === 'gemini' ? '✦ AI' : ''}
            </Text>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Correct answer banner */}
        <View style={[styles.correctBanner, { borderColor: `${COLORS.success}40` }]}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.correctLabel}>Correct Answer: </Text>
          <Text style={styles.correctValue}>{displayCorrectAnswer()}</Text>
        </View>

        {/* Question reference */}
        <Text style={styles.questionRef} numberOfLines={3}>{stripMathMarkup(questionText)}</Text>

        {loading && <ExplanationSkeleton />}

        {!loading && explanation && (
          <>
            {explanation.notice ? (
              <View style={styles.noticeBanner}>
                <Ionicons name="time-outline" size={16} color={COLORS.warning} />
                <Text style={styles.noticeText}>{explanation.notice}</Text>
              </View>
            ) : null}

            <GoldExplanationCard title="Simple Explanation" icon="bulb-outline" defaultExpanded>
              <Text style={styles.bodyText}>{explanation.explanationText}</Text>
            </GoldExplanationCard>

            <GoldExplanationCard
              title="Why This Is Correct"
              icon="checkmark-circle-outline"
              accentColor={COLORS.success}
              defaultExpanded
            >
              <Text style={styles.bodyText}>{explanation.whyCorrect}</Text>
            </GoldExplanationCard>

            {Object.keys(explanation.whyWrong).length > 0 && (
              <GoldExplanationCard
                title="Why Other Options Are Wrong"
                icon="close-circle-outline"
                accentColor={COLORS.error}
              >
                {Object.entries(explanation.whyWrong).map(([key, text]) => (
                  <View key={key} style={styles.wrongRow}>
                    <Text style={styles.wrongKey}>{key}.</Text>
                    <Text style={styles.wrongText}>{text}</Text>
                  </View>
                ))}
              </GoldExplanationCard>
            )}

            <ExamTipCard tip={explanation.examTip} />
            <MemoryTrickCard trick={explanation.memoryTrick} />
            <StepByStepCard steps={explanation.stepByStep} />

            {explanation.finalSummary ? (
              <View style={[styles.summaryCard, { borderColor: `${subjectColor}30` }]}>
                <Text style={[styles.summaryLabel, { color: subjectColor }]}>Summary</Text>
                <Text style={styles.summaryText}>{explanation.finalSummary}</Text>
              </View>
            ) : null}

            <ExplanationFeedbackButtons
              questionId={questionId}
              explanationId={explanation.id}
              userId={userId}
            />
          </>
        )}
      </ScrollView>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
  aiBadge: { width: 36, alignItems: 'center' },
  aiText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  correctBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(78,205,196,0.10)',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    flexWrap: 'wrap',
  },
  correctLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  correctValue: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    flexShrink: 1,
  },
  questionRef: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
    fontStyle: 'italic',
  },
  bodyText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.7,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.warning}18`,
    borderColor: `${COLORS.warning}40`,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  noticeText: {
    flex: 1,
    color: COLORS.warning,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: TYPOGRAPHY.sizes.xs * 1.5,
  },
  wrongRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  wrongKey: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    width: 20,
  },
  wrongText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
  },
  summaryCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.xs,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  summaryText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
    fontStyle: 'italic',
  },
});
