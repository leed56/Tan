import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Question } from '../../../types/quiz';
import type { AIExplanation } from '../../../types/explanation';
import { ExplanationSkeleton } from './ExplanationSkeleton';
import { GoldExplanationCard } from './GoldExplanationCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface Props {
  question: Question;
  studentAnswer: string;
  explanation: AIExplanation | null;
  loading: boolean;
  onUnderstood: () => void;
  understood: boolean;
}

export function WrongAnswerReviewCard({
  question,
  studentAnswer,
  explanation,
  loading,
  onUnderstood,
  understood,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const displayAnswer = (val: string) => {
    if (val === 'true') return 'True';
    if (val === 'false') return 'False';
    if (val === '__timeout__') return '(timed out)';
    const opt = question.options.find((o) => o.id === val);
    return opt ? opt.text : val;
  };

  const displayCorrect = () => {
    const opt = question.options.find((o) => o.id === question.correctAnswer);
    if (opt) return opt.text;
    if (question.correctAnswer === 'true') return 'True';
    if (question.correctAnswer === 'false') return 'False';
    return question.correctAnswer;
  };

  return (
    <View style={styles.card}>
      {/* Question text */}
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} activeOpacity={0.8}>
        <Text style={styles.questionText} numberOfLines={expanded ? undefined : 2}>
          {question.questionText}
        </Text>
        {!expanded && <Text style={styles.tapMore}>tap to expand</Text>}
      </TouchableOpacity>

      {/* Answer comparison */}
      <View style={styles.answerRow}>
        <View style={[styles.answerBadge, styles.wrongBadge]}>
          <Ionicons name="close-circle" size={14} color={COLORS.error} />
          <Text style={[styles.answerText, { color: COLORS.error }]} numberOfLines={1}>
            {displayAnswer(studentAnswer)}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={14} color={COLORS.textMuted} />
        <View style={[styles.answerBadge, styles.correctBadge]}>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
          <Text style={[styles.answerText, { color: COLORS.success }]} numberOfLines={1}>
            {displayCorrect()}
          </Text>
        </View>
      </View>

      {/* Explanation */}
      {loading ? (
        <ExplanationSkeleton />
      ) : explanation ? (
        <View style={styles.explanationSection}>
          <Text style={styles.explanationText}>{explanation.explanationText}</Text>

          {explanation.whyCorrect ? (
            <GoldExplanationCard
              title="Why This Is Correct"
              icon="checkmark-circle-outline"
              accentColor={COLORS.success}
              defaultExpanded={false}
            >
              <Text style={styles.sectionText}>{explanation.whyCorrect}</Text>
            </GoldExplanationCard>
          ) : null}
        </View>
      ) : null}

      {/* Understood button */}
      <TouchableOpacity
        style={[styles.understoodBtn, understood && styles.understoodBtnDone]}
        onPress={onUnderstood}
        disabled={understood}
        activeOpacity={0.8}
      >
        <Ionicons
          name={understood ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={18}
          color={understood ? COLORS.success : COLORS.textMuted}
        />
        <Text style={[styles.understoodText, understood && { color: COLORS.success }]}>
          {understood ? 'Understood! +5 XP' : 'I understand this now'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
  },
  questionText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.55,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tapMore: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  answerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    maxWidth: '45%',
    borderWidth: 1,
  },
  wrongBadge: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderColor: 'rgba(255,107,107,0.3)',
  },
  correctBadge: {
    backgroundColor: 'rgba(78,205,196,0.12)',
    borderColor: 'rgba(78,205,196,0.3)',
  },
  answerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flexShrink: 1,
  },
  explanationSection: { gap: SPACING.sm },
  explanationText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.7,
  },
  sectionText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.7,
  },
  understoodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  understoodBtnDone: {
    borderColor: 'rgba(78,205,196,0.4)',
    backgroundColor: 'rgba(78,205,196,0.08)',
  },
  understoodText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
