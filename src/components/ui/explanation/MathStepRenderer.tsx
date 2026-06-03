import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MathRenderer } from '../quiz/MathRenderer';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface Props {
  steps: string[];
}

export function MathStepRenderer({ steps }: Props) {
  if (!steps || steps.length === 0) return null;

  return (
    <View style={styles.container}>
      {steps.map((step, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{i + 1}</Text>
          </View>
          <View style={styles.stepContent}>
            <MathRenderer text={step} style={styles.stepText} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  stepContent: { flex: 1 },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.7,
  },
});
