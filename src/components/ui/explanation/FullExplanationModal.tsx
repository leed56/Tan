import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExplanationStore } from '../../../store/explanationStore';
import { useProfileStore } from '../../../store/profileStore';
import { ExplanationSkeleton } from './ExplanationSkeleton';
import { GoldExplanationCard } from './GoldExplanationCard';
import { ExamTipCard } from './ExamTipCard';
import { MemoryTrickCard } from './MemoryTrickCard';
import { StepByStepCard } from './StepByStepCard';
import { ExplanationFeedbackButtons } from './ExplanationFeedbackButtons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  questionId: string;
  questionText: string;
  quizType: 'mcq' | 'fib' | 'tf' | 'hoq';
  subjectId: string;
  formId: string;
  correctAnswer: string;
  options: Array<{ id: string; text: string }>;
  packTitle: string;
  fallbackExplanation: string;
}

const SUBJECT_NAMES: Record<string, string> = {
  mathematics: 'Mathematics', english: 'English', kiswahili: 'Kiswahili',
  biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics',
  geography: 'Geography', history: 'History', civics: 'Civics',
  commerce: 'Commerce', agriculture: 'Agriculture',
  computerStudies: 'Computer Studies', islamicKnowledge: 'Islamic Knowledge',
};

export function FullExplanationModal({
  visible, onClose, questionId, questionText, quizType,
  subjectId, formId, correctAnswer, options, packTitle, fallbackExplanation,
}: Props) {
  const { fetchExplanation, getExplanation, isLoading } = useExplanationStore();
  const profile = useProfileStore((s) => s.profile);
  const userId = profile?.uid ?? 'anonymous';

  useEffect(() => {
    if (!visible) return;
    fetchExplanation({
      questionId, questionText, correctAnswer, options, quizType,
      subjectId, subjectName: SUBJECT_NAMES[subjectId] ?? subjectId,
      formId, fallbackExplanation, userId,
    });
  }, [visible, questionId]);

  const explanation = getExplanation(questionId);
  const loading = isLoading(questionId);

  const displayCorrectAnswer = () => {
    if (quizType === 'tf') return correctAnswer === 'true' ? 'True' : 'False';
    const opt = options.find((o) => o.id === correctAnswer);
    return opt ? opt.text : correctAnswer;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{packTitle}</Text>
          {explanation && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiText}>
                {explanation.aiProvider === 'gemini' ? '✦ AI' : ''}
              </Text>
            </View>
          )}
          {!explanation && <View style={{ width: 36 }} />}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {/* Correct answer banner */}
          <View style={styles.correctBanner}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.correctLabel}>Correct Answer: </Text>
            <Text style={styles.correctValue}>{displayCorrectAnswer()}</Text>
          </View>

          {loading && <ExplanationSkeleton />}

          {!loading && explanation && (
            <>
              {/* Simple explanation */}
              <GoldExplanationCard title="Simple Explanation" icon="bulb-outline" defaultExpanded>
                <Text style={styles.bodyText}>{explanation.explanationText}</Text>
              </GoldExplanationCard>

              {/* Why correct */}
              <GoldExplanationCard
                title="Why This Is Correct"
                icon="checkmark-circle-outline"
                accentColor={COLORS.success}
                defaultExpanded
              >
                <Text style={styles.bodyText}>{explanation.whyCorrect}</Text>
              </GoldExplanationCard>

              {/* Why wrong (MCQ) */}
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

              {/* Exam tip */}
              <ExamTipCard tip={explanation.examTip} />

              {/* Memory trick */}
              <MemoryTrickCard trick={explanation.memoryTrick} />

              {/* Step-by-step */}
              <StepByStepCard steps={explanation.stepByStep} />

              {/* Final summary */}
              {explanation.finalSummary ? (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Summary</Text>
                  <Text style={styles.summaryText}>{explanation.finalSummary}</Text>
                </View>
              ) : null}

              {/* Feedback */}
              <ExplanationFeedbackButtons
                questionId={questionId}
                explanationId={explanation.id}
                userId={userId}
              />
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDark },
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
  aiBadge: {
    width: 36, alignItems: 'center',
  },
  aiText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  scroll: { flex: 1 },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  correctBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(78,205,196,0.12)',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.3)',
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
  bodyText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.7,
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
    backgroundColor: `${COLORS.primary}12`,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: `${COLORS.primary}25`,
  },
  summaryLabel: {
    color: COLORS.primary,
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
