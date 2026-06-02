import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface FIBInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  isCorrect?: boolean | null; // null = not yet revealed
}

export function FIBInput({ value, onChange, onSubmit, disabled, isCorrect }: FIBInputProps) {
  const ref = useRef<TextInput>(null);

  const borderColor =
    isCorrect === true ? COLORS.success :
    isCorrect === false ? COLORS.error :
    value.length > 0 ? COLORS.primary :
    COLORS.glassBorder;

  const bgColor =
    isCorrect === true ? 'rgba(78,205,196,0.1)' :
    isCorrect === false ? 'rgba(255,107,107,0.08)' :
    COLORS.bgCard;

  return (
    <View style={styles.container}>
      <View style={[styles.inputRow, { borderColor, backgroundColor: bgColor }]}>
        <Ionicons
          name={isCorrect === true ? 'checkmark-circle' : isCorrect === false ? 'close-circle' : 'create-outline'}
          size={22}
          color={isCorrect === true ? COLORS.success : isCorrect === false ? COLORS.error : COLORS.textMuted}
        />
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="Type your answer here..."
          placeholderTextColor={COLORS.textMuted}
          editable={!disabled}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          selectionColor={COLORS.primary}
        />
        {value.length > 0 && !disabled && (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={disabled || value.trim().length === 0}
        activeOpacity={0.8}
        style={[
          styles.submitBtn,
          (disabled || value.trim().length === 0) && styles.submitBtnDisabled,
        ]}
      >
        <Text style={styles.submitText}>Submit Answer</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.base,
    height: 54,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
