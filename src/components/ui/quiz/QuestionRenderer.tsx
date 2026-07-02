/**
 * QuestionRenderer — renders the question text with LaTeX support.
 * Wraps MathRenderer with question-specific styling.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MathRenderer } from './MathRenderer';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { Question } from '../../../types/quiz';

interface QuestionRendererProps {
  question: Question;
  questionNumber?: number;
}

export function QuestionRenderer({ question, questionNumber }: QuestionRendererProps) {
  return (
    <View style={styles.container}>
      {questionNumber !== undefined && (
        <Text style={styles.qNum}>Question {questionNumber}</Text>
      )}
      <MathRenderer
        text={question.questionText}
        style={styles.questionText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  qNum: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: TYPOGRAPHY.families.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  questionText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    lineHeight: TYPOGRAPHY.sizes.xl * 1.4,
    fontFamily: TYPOGRAPHY.families.bold,
    letterSpacing: -0.4,
  },
});
