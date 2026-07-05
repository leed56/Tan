import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import { MathRenderer } from './MathRenderer';

interface ExplanationCardProps {
  explanation: string;
  correctLabel?: string; // shown for wrong answers: "Correct answer: X"
}

export function ExplanationCard({ explanation, correctLabel }: ExplanationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="bulb-outline" size={16} color={COLORS.gold} />
        <Text style={styles.headerText}>Explanation</Text>
      </View>
      {correctLabel && (
        <View style={styles.correctRow}>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
          <Text style={styles.correctText}>{correctLabel}</Text>
        </View>
      )}
      <MathRenderer text={explanation} style={styles.body} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(247,197,46,0.07)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(247,197,46,0.22)',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: TYPOGRAPHY.families.extrabold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  correctRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  correctText: {
    flex: 1,
    color: COLORS.success,
    fontSize: TYPOGRAPHY.sizes.base,
    fontFamily: TYPOGRAPHY.families.bold,
  },
  body: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.65,
  },
});
