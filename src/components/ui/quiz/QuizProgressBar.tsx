import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface QuizProgressBarProps {
  current: number;   // 1-based
  total: number;
  color?: string;
  showLabel?: boolean;
  timeLeft?: number; // seconds; show timer if provided
}

export function QuizProgressBar({
  current,
  total,
  color = COLORS.primary,
  showLabel = true,
  timeLeft,
}: QuizProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  const isLow = timeLeft !== undefined && timeLeft <= 10;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showLabel && (
          <Text style={styles.label}>
            Question {current} of {total}
          </Text>
        )}
        <View style={styles.rightRow}>
          {timeLeft !== undefined && (
            <View style={[styles.timerBadge, isLow && styles.timerBadgeLow]}>
              <Text style={[styles.timerText, isLow && styles.timerTextLow]}>
                {timeLeft}s
              </Text>
            </View>
          )}
          {showLabel && (
            <Text style={[styles.pctText, { color }]}>{Math.round(pct)}%</Text>
          )}
        </View>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
      {/* Question dots */}
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < current - 1 && styles.dotDone,
              i === current - 1 && { backgroundColor: color },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.xs },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.families.medium,
    letterSpacing: 0.1,
  },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  timerBadge: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  timerBadgeLow: { backgroundColor: 'rgba(255,107,107,0.15)', borderColor: COLORS.error },
  timerText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: TYPOGRAPHY.families.bold,
  },
  timerTextLow: { color: COLORS.error },
  pctText: { fontSize: TYPOGRAPHY.sizes.xs, fontFamily: TYPOGRAPHY.families.bold },
  track: {
    height: 5,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: { height: 5, borderRadius: RADIUS.full, minWidth: 5 },
  dots: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.bgCardLight,
  },
  dotDone: { backgroundColor: COLORS.success },
});
