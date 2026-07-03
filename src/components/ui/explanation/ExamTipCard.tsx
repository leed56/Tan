import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import { MathRenderer } from '../quiz/MathRenderer';

interface Props { tip: string }

export function ExamTipCard({ tip }: Props) {
  if (!tip) return null;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="school-outline" size={16} color={COLORS.warning} />
        <Text style={styles.headerText}>NECTA Exam Tip</Text>
      </View>
      <MathRenderer text={tip} style={styles.body} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,169,77,0.10)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,169,77,0.28)',
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerText: {
    color: COLORS.warning,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.7,
  },
});
