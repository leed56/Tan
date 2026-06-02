import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

type TFAnswer = 'true' | 'false' | null;

interface TFButtonsProps {
  selected: TFAnswer;
  revealed: boolean;     // true after submission
  correctAnswer: TFAnswer;
  onSelect: (answer: 'true' | 'false') => void;
  disabled: boolean;
}

export function TFButtons({ selected, revealed, correctAnswer, onSelect, disabled }: TFButtonsProps) {
  function stateFor(btn: 'true' | 'false'): 'idle' | 'selected' | 'correct' | 'wrong' {
    if (!revealed) return selected === btn ? 'selected' : 'idle';
    if (btn === correctAnswer) return 'correct';
    if (selected === btn && btn !== correctAnswer) return 'wrong';
    return 'idle';
  }

  return (
    <View style={styles.row}>
      <TFButton
        label="True"
        icon="checkmark-circle"
        state={stateFor('true')}
        onPress={() => onSelect('true')}
        disabled={disabled}
        trueVariant
      />
      <TFButton
        label="False"
        icon="close-circle"
        state={stateFor('false')}
        onPress={() => onSelect('false')}
        disabled={disabled}
        trueVariant={false}
      />
    </View>
  );
}

function TFButton({
  label,
  icon,
  state,
  onPress,
  disabled,
  trueVariant,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  state: 'idle' | 'selected' | 'correct' | 'wrong';
  onPress: () => void;
  disabled: boolean;
  trueVariant: boolean;
}) {
  const activeColor = trueVariant ? COLORS.success : COLORS.error;
  const isActive = state === 'selected' || state === 'correct' || state === 'wrong';
  const stateColor = state === 'correct' ? COLORS.success : state === 'wrong' ? COLORS.error : state === 'selected' ? activeColor : COLORS.bgCardLight;

  if (state === 'correct') {
    return (
      <LinearGradient
        colors={[`${COLORS.success}`, `${COLORS.success}BB`]}
        style={styles.btn}
      >
        <TouchableOpacity onPress={onPress} disabled={disabled} style={styles.btnInner} activeOpacity={0.8}>
          <Ionicons name={icon} size={44} color="#fff" />
          <Text style={styles.btnLabelActive}>{label}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.btn,
        {
          backgroundColor: isActive ? `${stateColor}18` : COLORS.bgCard,
          borderColor: isActive ? stateColor : COLORS.glassBorder,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={44}
        color={isActive ? stateColor : COLORS.textMuted}
      />
      <Text style={[styles.btnLabel, isActive && { color: stateColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACING.base },
  btn: {
    flex: 1,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
    overflow: 'hidden',
  },
  btnInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    flex: 1,
    width: '100%',
  },
  btnLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  btnLabelActive: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
