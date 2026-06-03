import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useExplanationStore } from '../../../store/explanationStore';
import { saveExplanationFeedback } from '../../../services/explanationService';
import type { ExplanationFeedbackRating } from '../../../types/explanation';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface Props {
  questionId: string;
  explanationId: string;
  userId: string;
}

const OPTIONS: Array<{ rating: ExplanationFeedbackRating; label: string; color: string; bg: string }> = [
  { rating: 'helpful',   label: '✓ Helpful',   color: COLORS.success, bg: 'rgba(78,205,196,0.15)' },
  { rating: 'confusing', label: '? Confusing',  color: COLORS.warning, bg: 'rgba(255,169,77,0.15)' },
  { rating: 'wrong',     label: '✗ Wrong',      color: COLORS.error,   bg: 'rgba(255,107,107,0.15)' },
];

export function ExplanationFeedbackButtons({ questionId, explanationId, userId }: Props) {
  const { feedbackByQuestionId, setFeedback } = useExplanationStore();
  const selected = feedbackByQuestionId[questionId] ?? null;

  const handleRate = (rating: ExplanationFeedbackRating) => {
    if (selected) return;
    setFeedback(questionId, rating);
    saveExplanationFeedback({ userId, questionId, explanationId, rating, comment: '' }).catch(() => {});
  };

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Was this helpful?</Text>
      <View style={styles.buttons}>
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.rating;
          return (
            <TouchableOpacity
              key={opt.rating}
              style={[
                styles.btn,
                { backgroundColor: opt.bg, borderColor: isSelected ? opt.color : 'transparent' },
              ]}
              onPress={() => handleRate(opt.rating)}
              disabled={selected !== null}
              activeOpacity={0.75}
            >
              <Text style={[styles.btnText, { color: opt.color }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: SPACING.sm },
  label: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  buttons: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  btn: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  btnText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
});
