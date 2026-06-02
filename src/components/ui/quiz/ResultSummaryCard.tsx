import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface ResultSummaryCardProps {
  scorePercent: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  xpEarned: number;
}

function scoreColor(pct: number): string {
  if (pct >= 80) return COLORS.success;
  if (pct >= 50) return COLORS.warning;
  return COLORS.error;
}

function motivationalMessage(pct: number): string {
  if (pct >= 90) return 'Outstanding! You\'re exam-ready!';
  if (pct >= 70) return 'Great work! Keep pushing forward!';
  if (pct >= 50) return 'Good effort! Review the missed questions.';
  return 'Keep practicing — every attempt makes you stronger!';
}

const RADIUS_VAL = 56;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS_VAL;
const SIZE = (RADIUS_VAL + STROKE) * 2 + 4;

export function ResultSummaryCard({
  scorePercent,
  correctCount,
  wrongCount,
  totalQuestions,
  xpEarned,
}: ResultSummaryCardProps) {
  const color = scoreColor(scorePercent);
  const fillLength = CIRCUMFERENCE * (scorePercent / 100);
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <View style={styles.card}>
      {/* Donut chart */}
      <View style={styles.donutWrap}>
        <Svg width={SIZE} height={SIZE}>
          {/* Background track */}
          <Circle
            cx={cx} cy={cy}
            r={RADIUS_VAL}
            stroke={COLORS.bgCardLight}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Score fill */}
          <Circle
            cx={cx} cy={cy}
            r={RADIUS_VAL}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${fillLength} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            rotation={-90}
            origin={`${cx}, ${cy}`}
          />
        </Svg>
        {/* Center label */}
        <View style={styles.donutCenter}>
          <Text style={[styles.donutPct, { color }]}>{scorePercent}%</Text>
          <Text style={styles.donutLabel}>Score</Text>
        </View>
      </View>

      {/* Motivational message */}
      <Text style={[styles.message, { color }]}>{motivationalMessage(scorePercent)}</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{correctCount}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.error }]}>{wrongCount}</Text>
          <Text style={styles.statLabel}>Wrong</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalQuestions}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.gold }]}>+{xpEarned}</Text>
          <Text style={styles.statLabel}>XP Earned</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: SPACING.base,
  },
  donutWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: SIZE,
    height: SIZE,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutPct: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['3xl'] * 1.1,
  },
  donutLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
    paddingHorizontal: SPACING.base,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.md,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.glassBorder },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  statLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
});
