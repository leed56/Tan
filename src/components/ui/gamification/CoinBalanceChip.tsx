import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface Props {
  coins: number;
  onPress?: () => void;
}

export function CoinBalanceChip({ coins, onPress }: Props) {
  const chip = (
    <View style={styles.chip}>
      <Text style={styles.coinEmoji}>🪙</Text>
      <Text style={styles.coins}>{coins.toLocaleString()}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {chip}
      </TouchableOpacity>
    );
  }
  return chip;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(247,197,46,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(247,197,46,0.3)',
  },
  coinEmoji: { fontSize: 14 },
  coins: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
});
