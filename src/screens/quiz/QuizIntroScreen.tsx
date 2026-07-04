import React, { useState } from 'react';
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
import { AppButton } from '../../components/ui/AppButton';
import { QuizCard } from '../../components/ui/quiz/QuizCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { useCurriculumStore } from '../../store/curriculumStore';
import { useQuizStore } from '../../store/quizStore';
import { useAuthStore } from '../../store/authStore';

type Props = StackScreenProps<HomeStackParamList, 'QuizIntro'>;

export function QuizIntroScreen({ navigation, route }: Props) {
  const { packId, packTitle, topicId, subjectColor, formId, subjectId, quizType } = route.params;
  const [starting, setStarting] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const { packsByTopic } = useCurriculumStore();
  const { initSession, loadingQuestions } = useQuizStore();
  const user = useAuthStore((s) => s.user);

  const packs = packsByTopic[topicId] ?? [];
  const pack = packs.find((p) => p.id === packId);

  const handleStart = async () => {
    setStarting(true);
    try {
      await initSession(packId, formId, subjectId, topicId, user?.uid ?? 'demo');
      // initSession reports "no questions" via store state rather than
      // throwing — bail here so an empty pack doesn't dump the user on an
      // error screen mid-quiz.
      if (useQuizStore.getState().error || !useQuizStore.getState().currentSession) {
        setLoadError(true);
        return;
      }
      setLoadError(false);
      const params = { packId, packTitle, topicId, subjectColor, formId, subjectId };
      if (quizType === 'mcq') navigation.navigate('MCQQuiz', params);
      else if (quizType === 'fib') navigation.navigate('FIBQuiz', params);
      else if (quizType === 'tf') navigation.navigate('TFQuiz', params);
      else navigation.navigate('HOQQuiz', params);
    } finally {
      setStarting(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient
        colors={[`${subjectColor}28`, COLORS.bgDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Quiz</Text>
        <Text style={styles.headerTitle} numberOfLines={2}>{packTitle}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Quiz card */}
        {pack && (
          <QuizCard
            quizType={quizType}
            questionCount={pack.questionCount}
            estimatedMinutes={pack.estimatedMinutes}
            completionXP={pack.completionXP}
            difficulty={pack.difficulty}
            subjectColor={subjectColor}
          />
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Before you start</Text>
          {TIPS[quizType].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={15} color={COLORS.success} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Empty-pack notice */}
        {loadError && (
          <View style={styles.limitBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.warning} />
            <Text style={styles.limitText}>
              No questions are available for this pack yet. Please try another pack.
            </Text>
          </View>
        )}

        {/* CTA */}
        <AppButton
          title={starting || loadingQuestions ? 'Loading...' : 'Start Quiz'}
          onPress={handleStart}
          loading={starting || loadingQuestions}
          variant="primary"
          icon={<Ionicons name="play" size={18} color={COLORS.textPrimary} />}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const TIPS: Record<string, string[]> = {
  mcq: [
    'Read each question carefully before selecting.',
    'Eliminate clearly wrong options first.',
    'You have 60 seconds per question.',
  ],
  fib: [
    'Type your answer exactly — spelling matters.',
    'Look for context clues in the sentence.',
    'Take your time, there is no timer.',
  ],
  tf: [
    'Every statement is based on your syllabus.',
    'If any part of the statement is false, it\'s false.',
    'Tap True or False confidently!',
  ],
  hoq: [
    'These questions require analysis, not just recall.',
    'Read the full scenario before choosing an answer.',
    'You have 90 seconds per question — think it through.',
  ],
};

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING['2xl'],
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.2,
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.base,
  },
  tipsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  tipsTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  tipText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,169,77,0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,169,77,0.3)',
  },
  limitText: {
    flex: 1,
    color: COLORS.warning,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
});
