import React, { useState, useCallback } from 'react';
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
import { TFButtons } from '../../components/ui/quiz/TFButtons';
import { FeedbackModal } from '../../components/ui/quiz/FeedbackModal';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useQuizStore } from '../../store/quizStore';
import { useGamificationStore } from '../../store/gamificationStore';

type Props = StackScreenProps<HomeStackParamList, 'TFQuiz'>;

export function TFScreen({ navigation, route }: Props) {
  const { packId, packTitle, topicId, subjectColor, formId, subjectId } = route.params;

  const { currentSession, currentQuestion, isLastQuestion, submitAnswer, advance, sessionResults } = useQuizStore();
  const { addXp, addCoins } = useGamificationStore();

  const [selected, setSelected] = useState<'true' | 'false' | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = currentQuestion();
  const session = currentSession;

  // Reset on question change
  const prevIdRef = React.useRef<string | undefined>(undefined);
  if (question?.id !== prevIdRef.current) {
    prevIdRef.current = question?.id;
    if (revealed) {
      setSelected(null);
      setRevealed(false);
      setShowFeedback(false);
    }
  }

  const handleSelect = useCallback((answer: 'true' | 'false') => {
    if (revealed || !question) return;
    const isCorrect = answer === question.correctAnswer;
    setSelected(answer);
    setRevealed(true);
    submitAnswer(question.id, answer, isCorrect, 0);

    if (isCorrect) {
      addXp(question.xpReward);
      addCoins(1);
    }

    setTimeout(() => setShowFeedback(true), 350);
  }, [revealed, question, submitAnswer, addXp, addCoins]);

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
        quizType: 'tf',
      });
    } else {
      setSelected(null);
      setRevealed(false);
      advance();
    }
  }, [isLastQuestion, sessionResults, navigation, advance, packTitle, packId, topicId, subjectColor, formId, subjectId]);

  if (!session || !question) {
    return <ScreenContainer><LoadingState /></ScreenContainer>;
  }

  const current = session.currentIndex + 1;
  const total = session.questions.length;
  const isCorrect = selected !== null && selected === question.correctAnswer;
  const correctAnswer = question.correctAnswer as 'true' | 'false';

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
        <QuizProgressBar current={current} total={total} color={subjectColor} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <QuestionRenderer question={question} questionNumber={current} />

        {/* True / False buttons */}
        <TFButtons
          selected={selected}
          revealed={revealed}
          correctAnswer={correctAnswer}
          onSelect={handleSelect}
          disabled={revealed}
        />
      </ScrollView>

      <FeedbackModal
        visible={showFeedback}
        isCorrect={isCorrect}
        xpEarned={question.xpReward}
        explanation={question.explanation}
        correctAnswerLabel={!isCorrect ? (correctAnswer === 'true' ? 'True' : 'False') : undefined}
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
});
