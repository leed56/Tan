import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { QuestionOption } from '../../../types/quiz';

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

interface MCQOptionProps {
  option: QuestionOption;
  state: OptionState;
  label: string; // A, B, C, D
  onPress: (optionId: string) => void;
  disabled: boolean;
}

const STATE_STYLES: Record<OptionState, { border: string; bg: string; text: string; labelBg: string }> = {
  idle: {
    border: COLORS.glassBorder,
    bg: COLORS.bgCard,
    text: COLORS.textPrimary,
    labelBg: COLORS.bgCardLight,
  },
  selected: {
    border: COLORS.primary,
    bg: 'rgba(123,111,242,0.12)',
    text: COLORS.textPrimary,
    labelBg: COLORS.primary,
  },
  correct: {
    border: COLORS.success,
    bg: 'rgba(78,205,196,0.12)',
    text: COLORS.textPrimary,
    labelBg: COLORS.success,
  },
  wrong: {
    border: COLORS.error,
    bg: 'rgba(255,107,107,0.1)',
    text: COLORS.textPrimary,
    labelBg: COLORS.error,
  },
};

export function MCQOption({ option, state, label, onPress, disabled }: MCQOptionProps) {
  const s = STATE_STYLES[state];

  return (
    <TouchableOpacity
      onPress={() => onPress(option.id)}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.card, { borderColor: s.border, backgroundColor: s.bg }]}
    >
      <View style={[styles.label, { backgroundColor: s.labelBg }]}>
        <Text style={[styles.labelText, (state === 'correct' || state === 'wrong' || state === 'selected') && { color: '#fff' }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.text, { color: s.text }]}>{option.text}</Text>
      {state === 'correct' && (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      )}
      {state === 'wrong' && (
        <Ionicons name="close-circle" size={20} color={COLORS.error} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.base,
    gap: SPACING.md,
  },
  label: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  labelText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  text: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.4,
  },
});
