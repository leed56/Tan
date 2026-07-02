import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { QuizProgressBar } from '../../components/ui/quiz/QuizProgressBar';
import { QuestionRenderer } from '../../components/ui/quiz/QuestionRenderer';
import { MCQOption } from '../../components/ui/quiz/MCQOption';
import { FeedbackModal } from '../../components/ui/quiz/FeedbackModal';
import { stripMathMarkup } from '../../components/ui/quiz/MathRenderer';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useQuizStore } from '../../store/quizStore';
import { confirmAction } from '../../utils/confirm';
import { useGamificationStore } from '../../store/gamificationStore';

type Props = StackScreenProps<HomeStackParamList, 'HOQQuiz'>;

// HOQ items are longer analytical scenarios (NECTA-style), so allow more time
// per question than a plain MCQ recall question.
const SECONDS_PER_QUESTION = 90;
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function HOQScreen({ navigation, route }: Props) {
  const { packId, packTitle, topicId, subjectColor, formId, subjectId } = route.params;

  const { currentSession, currentQuestion, isLastQuestion, submitAnswer, advance, sessionResults, loadingQuestions } = useQuizStore();
  const { addXp, addCoins } = useGamificationStore();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const questionStartRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = currentQuestion();
  const session = currentSession;

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset state on new question
  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
    setTimeLeft(SECONDS_PER_QUESTION);
    questionStartRef.current = Date.now();
    clearTimer();
    // The interval only decrements; the timeout auto-submit lives in its own
    // effect below — calling handleAnswer inside a setState updater is a side
    // effect in what React expects to be pure (double-invoked in StrictMode).
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  // Auto-submit as wrong when time runs out
  useEffect(() => {
    if (timeLeft === 0 && selectedOption === null && question) {
      clearTimer();
      handleAnswer('__timeout__');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleAnswer = useCallback((optionId: string) => {
    if (selectedOption !== null || !question) return;
    clearTimer();

    const isCorrect = question.correctAnswer === optionId && optionId !== '__timeout__';
    const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);

    setSelectedOption(optionId);
    submitAnswer(question.id, optionId, isCorrect, timeTaken);

    if (isCorrect) {
      addXp(question.xpReward);
      addCoins(2);
    }

    setShowFeedback(true);
  }, [selectedOption, question, submitAnswer, addXp]);

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
        quizType: 'hoq',
      });
    } else {
      advance();
    }
  }, [isLastQuestion, sessionResults, navigation, advance, packTitle, packId, topicId, subjectColor, formId, subjectId]);

  const handleViewExplanation = useCallback(() => {
    if (!question) return;
    setShowFeedback(false);
    navigation.navigate('ExplanationScreen', {
      questionId: question.id,
      questionText: question.questionText,
      quizType: 'hoq',
      subjectId,
      formId,
      correctAnswer: question.correctAnswer,
      options: question.options.map((o) => ({ id: o.id, text: o.text })),
      packTitle,
      subjectColor,
      fallbackExplanation: question.explanation,
    });
  }, [question, navigation, subjectId, formId, packTitle, subjectColor]);

  // Restore feedback modal when returning from ExplanationScreen
  useFocusEffect(
    useCallback(() => {
      if (selectedOption !== null && !showFeedback) {
        setShowFeedback(true);
      }
    }, [selectedOption, showFeedback]),
  );

  // Quitting mid-quiz abandons a session that already consumed a daily
  // attempt — confirm first, and reset the store so nothing stale leaks
  // into the next quiz.
  const handleQuit = () => {
    confirmAction('Quit quiz?', 'Your progress in this quiz will be lost.', 'Quit', () => {
      useQuizStore.getState().resetSession();
      navigation.goBack();
    });
  };

  if (loadingQuestions) {
    return <ScreenContainer><LoadingState /></ScreenContainer>;
  }
  if (!session || !question) {
    return (
      <ScreenContainer>
        <ErrorState
          message="No questions are available for this pack yet. Please try another pack."
          onRetry={() => navigation.goBack()}
          retryLabel="Go Back"
          fullScreen
        />
      </ScreenContainer>
    );
  }

  const current = session.currentIndex + 1;
  const total = session.questions.length;
  const isCorrect = selectedOption !== null && question.correctAnswer === selectedOption;
  const correctOption = question.options.find((o) => o.id === question.correctAnswer);

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.packTitle} numberOfLines={1}>{packTitle}</Text>
          <View style={styles.hoqBadge}>
            <Ionicons name="bulb" size={11} color={COLORS.gold} />
            <Text style={styles.hoqBadgeText}>Higher Order</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <QuizProgressBar
          current={current}
          total={total}
          color={subjectColor}
          timeLeft={timeLeft}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Question */}
        <QuestionRenderer question={question} questionNumber={current} />

        {/* Options */}
        <View style={styles.options}>
          {question.options.map((opt, i) => {
            let state: 'idle' | 'selected' | 'correct' | 'wrong' = 'idle';
            if (selectedOption !== null) {
              if (opt.id === question.correctAnswer) state = 'correct';
              else if (opt.id === selectedOption) state = 'wrong';
            }
            return (
              <MCQOption
                key={opt.id}
                option={opt}
                label={OPTION_LABELS[i]}
                state={state}
                disabled={selectedOption !== null}
                onPress={handleAnswer}
              />
            );
          })}
        </View>
      </ScrollView>

      <FeedbackModal
        visible={showFeedback}
        isCorrect={isCorrect}
        xpEarned={question.xpReward}
        explanation={question.explanation}
        correctAnswerLabel={!isCorrect && correctOption ? stripMathMarkup(correctOption.text) : undefined}
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
  headerTitleBlock: { flex: 1, alignItems: 'center', gap: 4, marginHorizontal: SPACING.sm },
  packTitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.families.semibold,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  hoqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(247,197,46,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  hoqBadgeText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
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
  options: { gap: SPACING.sm },
});
