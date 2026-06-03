import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LoadingState } from '../../components/ui/LoadingState';
import { QuizProgressBar } from '../../components/ui/quiz/QuizProgressBar';
import { QuestionRenderer } from '../../components/ui/quiz/QuestionRenderer';
import { FIBInput } from '../../components/ui/quiz/FIBInput';
import { FeedbackModal } from '../../components/ui/quiz/FeedbackModal';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useQuizStore } from '../../store/quizStore';
import { useGamificationStore } from '../../store/gamificationStore';

type Props = StackScreenProps<HomeStackParamList, 'FIBQuiz'>;

function normalise(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function FIBScreen({ navigation, route }: Props) {
  const { packId, packTitle, topicId, subjectColor, formId, subjectId } = route.params;

  const { currentSession, currentQuestion, isLastQuestion, submitAnswer, advance, sessionResults } = useQuizStore();
  const { addXp, addCoins } = useGamificationStore();

  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = currentQuestion();
  const session = currentSession;

  // Reset state on new question
  const prevQuestionId = React.useRef<string | undefined>(undefined);
  if (question?.id !== prevQuestionId.current) {
    prevQuestionId.current = question?.id;
    if (submitted) {
      setInputValue('');
      setSubmitted(false);
      setIsCorrect(null);
      setShowFeedback(false);
    }
  }

  const handleSubmit = useCallback(() => {
    if (!question || submitted || inputValue.trim().length === 0) return;

    const correct = normalise(inputValue) === normalise(question.correctAnswer);
    const timeTaken = 0; // no timer for FIB

    setIsCorrect(correct);
    setSubmitted(true);
    submitAnswer(question.id, inputValue.trim(), correct, timeTaken);

    if (correct) {
      addXp(question.xpReward);
      addCoins(1);
    }

    setShowFeedback(true);
  }, [question, submitted, inputValue, submitAnswer, addXp, addCoins]);

  const handleContinue = useCallback(() => {
    setShowFeedback(false);
    if (isLastQuestion()) {
      const results = sessionResults();
      navigation.replace('QuizResult', {
        xpEarned: results.xpEarned,
        scorePercent: results.scorePercent,
        correctCount: results.correctCount,
        wrongCount: results.wrongCount,
        totalQuestions: results.totalQuestions,
        packTitle,
        packId,
        topicId,
        subjectColor,
        formId,
        subjectId,
        quizType: 'fib',
      });
    } else {
      setInputValue('');
      setSubmitted(false);
      setIsCorrect(null);
      advance();
    }
  }, [isLastQuestion, sessionResults, navigation, advance, packTitle, packId, topicId, subjectColor, formId, subjectId]);

  const handleViewExplanation = useCallback(() => {
    if (!question) return;
    setShowFeedback(false);
    navigation.navigate('ExplanationScreen', {
      questionId: question.id,
      questionText: question.questionText,
      quizType: 'fib',
      subjectId,
      formId,
      correctAnswer: question.correctAnswer,
      options: [],
      packTitle,
      subjectColor,
      fallbackExplanation: question.explanation,
    });
  }, [question, navigation, subjectId, formId, packTitle, subjectColor]);

  useFocusEffect(
    useCallback(() => {
      if (submitted && !showFeedback) {
        setShowFeedback(true);
      }
    }, [submitted]),
  );

  if (!session || !question) {
    return <ScreenContainer><LoadingState /></ScreenContainer>;
  }

  const current = session.currentIndex + 1;
  const total = session.questions.length;

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.packTitle} numberOfLines={1}>{packTitle}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressWrap}>
          <QuizProgressBar current={current} total={total} color={subjectColor} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Question */}
          <QuestionRenderer question={question} questionNumber={current} />

          {/* Input */}
          <FIBInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            disabled={submitted}
            isCorrect={isCorrect}
          />

          {/* Correct answer reveal after wrong */}
          {submitted && isCorrect === false && (
            <View style={styles.answerReveal}>
              <Text style={styles.answerLabel}>Correct answer:</Text>
              <Text style={styles.answerValue}>{question.correctAnswer}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <FeedbackModal
        visible={showFeedback}
        isCorrect={isCorrect ?? false}
        xpEarned={question.xpReward}
        explanation={question.explanation}
        correctAnswerLabel={isCorrect === false ? question.correctAnswer : undefined}
        onContinue={handleContinue}
        onViewExplanation={handleViewExplanation}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.md,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packTitle: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  progressWrap: {
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.base,
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.xl,
  },
  answerReveal: {
    backgroundColor: 'rgba(78,205,196,0.08)',
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.success}40`,
    gap: 4,
  },
  answerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  answerValue: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
