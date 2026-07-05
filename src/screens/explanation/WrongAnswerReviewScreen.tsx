import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { WrongAnswerReviewCard } from '../../components/ui/explanation/WrongAnswerReviewCard';
import { useQuizStore } from '../../store/quizStore';
import { useExplanationStore } from '../../store/explanationStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { useProfileStore } from '../../store/profileStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import type { Question } from '../../types/quiz';

type Props = StackScreenProps<HomeStackParamList, 'WrongAnswerReview'>;

const SUBJECT_NAMES: Record<string, string> = {
  mathematics: 'Mathematics', english: 'English', kiswahili: 'Kiswahili',
  biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics',
  geography: 'Geography', history: 'History', civics: 'Civics',
  commerce: 'Commerce', agriculture: 'Agriculture',
  computerStudies: 'Computer Studies', islamicKnowledge: 'Islamic Knowledge',
};

export function WrongAnswerReviewScreen({ navigation, route }: Props) {
  const { packTitle, subjectId, formId } = route.params;
  const session = useQuizStore((s) => s.currentSession);
  const { fetchExplanation, getExplanation, isLoading } = useExplanationStore();
  const { addXp } = useGamificationStore();
  const profile = useProfileStore((s) => s.profile);
  const userId = profile?.uid ?? 'anonymous';

  const [understood, setUnderstood] = useState<Set<string>>(new Set());

  const wrongQuestions: Array<{ question: Question; studentAnswer: string }> = [];
  if (session) {
    for (const q of session.questions) {
      const ans = session.answers[q.id];
      if (ans && !ans.isCorrect) {
        wrongQuestions.push({ question: q, studentAnswer: ans.answer });
      }
    }
  }

  // Fetch all explanations on mount
  useEffect(() => {
    for (const { question } of wrongQuestions) {
      fetchExplanation({
        questionId: question.id,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        options: question.options.map((o) => ({ id: o.id, text: o.text })),
        quizType: question.type,
        subjectId,
        subjectName: SUBJECT_NAMES[subjectId.replace(/^form_\d+_/, '')] ?? subjectId,
        formId,
        fallbackExplanation: question.explanation,
        userId,
      });
    }
  }, []);

  const allUnderstood = wrongQuestions.length > 0 && understood.size === wrongQuestions.length;

  const handleUnderstood = (questionId: string) => {
    if (understood.has(questionId)) return;
    addXp(5);
    setUnderstood((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  };

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Review Mistakes</Text>
        <View style={{ width: 36 }} />
      </View>

      {wrongQuestions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>No mistakes!</Text>
          <Text style={styles.emptySubtitle}>You got everything right.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            {wrongQuestions.length} question{wrongQuestions.length !== 1 ? 's' : ''} to review
            {allUnderstood ? ' — All done! 🎉' : ''}
          </Text>

          <FlatList
            data={wrongQuestions}
            keyExtractor={({ question }) => question.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: { question, studentAnswer } }) => (
              <WrongAnswerReviewCard
                question={question}
                studentAnswer={studentAnswer}
                explanation={getExplanation(question.id)}
                loading={isLoading(question.id)}
                understood={understood.has(question.id)}
                onUnderstood={() => handleUnderstood(question.id)}
              />
            )}
          />
        </>
      )}
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
  backBtn: {
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
  subtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  emptySubtitle: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
});
