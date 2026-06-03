import React from 'react';
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
import { useQuizStore } from '../../store/quizStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

type Props = StackScreenProps<HomeStackParamList, 'LearningPackReview'>;

export function LearningPackReviewScreen({ navigation, route }: Props) {
  const { packTitle, subjectId, formId, subjectColor } = route.params;
  const session = useQuizStore((s) => s.currentSession);

  const questions = session?.questions ?? [];
  const answers = session?.answers ?? {};

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{packTitle}</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.subtitle}>All Questions</Text>

      <FlatList
        data={questions}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No questions found for this session.</Text>
        }
        renderItem={({ item: question, index }) => {
          const answer = answers[question.id];
          const isCorrect = answer?.isCorrect ?? false;
          const wasAnswered = answer !== undefined;

          return (
            <View style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={[styles.numBadge, { backgroundColor: subjectColor + '22' }]}>
                  <Text style={[styles.numText, { color: subjectColor }]}>{index + 1}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  wasAnswered
                    ? isCorrect ? styles.correctBadge : styles.wrongBadge
                    : styles.skippedBadge,
                ]}>
                  <Ionicons
                    name={wasAnswered ? (isCorrect ? 'checkmark' : 'close') : 'remove'}
                    size={12}
                    color={wasAnswered ? (isCorrect ? COLORS.success : COLORS.error) : COLORS.textMuted}
                  />
                  <Text style={[
                    styles.statusText,
                    { color: wasAnswered ? (isCorrect ? COLORS.success : COLORS.error) : COLORS.textMuted },
                  ]}>
                    {wasAnswered ? (isCorrect ? 'Correct' : 'Wrong') : 'Skipped'}
                  </Text>
                </View>
              </View>

              <Text style={styles.questionText} numberOfLines={2}>
                {question.questionText}
              </Text>

              <TouchableOpacity
                style={[styles.viewBtn, { borderColor: subjectColor + '50' }]}
                onPress={() => navigation.navigate('ExplanationScreen', {
                  questionId: question.id,
                  questionText: question.questionText,
                  quizType: question.type,
                  subjectId,
                  formId,
                  correctAnswer: question.correctAnswer,
                  options: question.options.map((o) => ({ id: o.id, text: o.text })),
                  packTitle,
                  subjectColor,
                  fallbackExplanation: question.explanation,
                })}
                activeOpacity={0.8}
              >
                <Ionicons name="bulb-outline" size={14} color={subjectColor} />
                <Text style={[styles.viewBtnText, { color: subjectColor }]}>View Explanation</Text>
              </TouchableOpacity>
            </View>
          );
        }}
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
    fontWeight: TYPOGRAPHY.weights.medium,
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.sm,
  },
  empty: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING['3xl'],
  },
  questionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numBadge: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  numText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
  },
  correctBadge: {
    backgroundColor: 'rgba(78,205,196,0.12)',
    borderColor: 'rgba(78,205,196,0.3)',
  },
  wrongBadge: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderColor: 'rgba(255,107,107,0.3)',
  },
  skippedBadge: {
    backgroundColor: COLORS.bgCardLight,
    borderColor: COLORS.glassBorder,
  },
  statusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  questionText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.55,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  viewBtnText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
});
