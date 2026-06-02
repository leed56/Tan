import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LoadingState } from '../../components/ui/LoadingState';
import { QuizProgressBar } from '../../components/ui/quiz/QuizProgressBar';
import { QuestionRenderer } from '../../components/ui/quiz/QuestionRenderer';
import { MCQOption } from '../../components/ui/quiz/MCQOption';
import { FeedbackModal } from '../../components/ui/quiz/FeedbackModal';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useQuizStore } from '../../store/quizStore';
import { useGamificationStore } from '../../store/gamificationStore';

type Props = StackScreenProps<HomeStackParamList, 'MCQQuiz'>;

const SECONDS_PER_QUESTION = 60;
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function MCQScreen({ navigation, route }: Props) {
  const { packId, packTitle, topicId, subjectColor, formId, subjectId } = route.params;

  const { currentSession, currentQuestion, isLastQuestion, submitAnswer, advance, sessionResults } = useQuizStore();
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
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          // Auto-submit as wrong when time runs out
          handleAnswer('__timeout__');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  const handleAnswer = useCallback((optionId: string) => {
    if (selectedOption !== null || !question) return;
    clearTimer();

    const isCorrect = question.correctAnswer === optionId && optionId !== '__timeout__';
    const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);

    setSelectedOption(optionId);
    submitAnswer(question.id, optionId, isCorrect, timeTaken);

    if (isCorrect) {
      addXp(question.xpReward);
      addCoins(1);
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
        quizType: 'mcq',
      });
    } else {
      advance();
    }
  }, [isLastQuestion, sessionResults, navigation, advance, packTitle, packId, topicId, subjectColor, formId, subjectId]);

  if (!session || !question) {
    return <ScreenContainer><LoadingState /></ScreenContainer>;
  }

  const current = session.currentIndex + 1;
  const total = session.questions.length;
  const isCorrect = selectedOption !== null && question.correctAnswer === selectedOption;
  const correctOption = question.options.find((o) => o.id === question.correctAnswer);

  return (
    <ScreenContainer padded={false}>
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
        correctAnswerLabel={!isCorrect && correctOption ? correctOption.text : undefined}
        onContinue={handleContinue}
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
  options: { gap: SPACING.sm },
});
