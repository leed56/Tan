import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { ErrorState } from '../../components/ui/ErrorState';
import { QuizProgressBar } from '../../components/ui/quiz/QuizProgressBar';
import { QuestionRenderer } from '../../components/ui/quiz/QuestionRenderer';
import { MCQOption } from '../../components/ui/quiz/MCQOption';
import { FIBInput } from '../../components/ui/quiz/FIBInput';
import { FeedbackModal } from '../../components/ui/quiz/FeedbackModal';
import { stripMathMarkup } from '../../components/ui/quiz/MathRenderer';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useQuizStore } from '../../store/quizStore';
import { confirmAction } from '../../utils/confirm';
import { useGamificationStore } from '../../store/gamificationStore';

type Props = StackScreenProps<HomeStackParamList, 'FIBQuiz'>;

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// Free-text FIB answers are matched leniently: case/whitespace-insensitive,
// and numerically when both sides parse as numbers ("180" == "180.0").
const normalizeAnswer = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const answersMatch = (given: string, expected: string) => {
  const a = normalizeAnswer(given);
  const b = normalizeAnswer(expected);
  if (a === b) return true;
  const na = Number(a.replace(/,/g, ''));
  const nb = Number(b.replace(/,/g, ''));
  return Number.isFinite(na) && Number.isFinite(nb) && na === nb;
};

export function FIBScreen({ navigation, route }: Props) {
  const { packId, packTitle, topicId, subjectColor, formId, subjectId } = route.params;

  const { currentSession, currentQuestion, isLastQuestion, submitAnswer, advance, sessionResults, loadingQuestions } = useQuizStore();
  const { addXp, addCoins } = useGamificationStore();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const question = currentQuestion();
  const session = currentSession;
  // Nearly all FIB content is free-text (correctAnswer holds the expected
  // answer, options is empty); option-based fill-ins remain supported.
  const isFreeText = (question?.options?.length ?? 0) === 0;

  // Reset state on new question
  const prevQuestionId = React.useRef<string | undefined>(undefined);
  if (question?.id !== prevQuestionId.current) {
    prevQuestionId.current = question?.id;
    if (selectedOption !== null) {
      setSelectedOption(null);
      setTypedAnswer('');
      setShowFeedback(false);
    }
  }

  const handleAnswer = useCallback((answer: string) => {
    if (selectedOption !== null || !question) return;

    const freeText = (question.options?.length ?? 0) === 0;
    const correct = freeText
      ? answersMatch(answer, question.correctAnswer)
      : question.correctAnswer === answer;
    const timeTaken = 0; // no timer for FIB

    setSelectedOption(answer);
    submitAnswer(question.id, answer, correct, timeTaken);

    if (correct) {
      addXp(question.xpReward);
      addCoins(1);
    }

    setShowFeedback(true);
  }, [selectedOption, question, submitAnswer, addXp, addCoins]);

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
      setSelectedOption(null);
      advance();
    }
  }, [isLastQuestion, sessionResults, navigation, advance, packTitle, packId, topicId, subjectColor, formId, subjectId]);

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
  const isCorrect =
    selectedOption !== null &&
    (isFreeText
      ? answersMatch(selectedOption, question.correctAnswer)
      : question.correctAnswer === selectedOption);
  const correctOption = question.options.find((o) => o.id === question.correctAnswer);
  const correctAnswerText = correctOption ? correctOption.text : question.correctAnswer;

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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

        {isFreeText ? (
          /* Free-text answer — the standard FIB shape in the question bank */
          <View style={styles.options}>
            <FIBInput
              value={typedAnswer}
              onChange={setTypedAnswer}
              onSubmit={() => handleAnswer(typedAnswer)}
              disabled={selectedOption !== null}
              isCorrect={selectedOption === null ? null : isCorrect}
            />
          </View>
        ) : (
          /* Options — choose the term that fills the blank */
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
        )}
      </ScrollView>

      <FeedbackModal
        visible={showFeedback}
        isCorrect={isCorrect}
        xpEarned={question.xpReward}
        explanation={question.explanation}
        correctAnswerLabel={!isCorrect && correctAnswerText ? stripMathMarkup(correctAnswerText) : undefined}
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
    fontFamily: TYPOGRAPHY.families.semibold,
    letterSpacing: 0.1,
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
