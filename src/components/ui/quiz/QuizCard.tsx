/**
 * QuizCard — shown in QuizIntroScreen for each pack type.
 * Displays pack type icon, title, stats (questions, minutes, XP).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { QuizType } from '../../../types/quiz';
import { FREE_DAILY_LIMITS } from '../../../types/quiz';

interface QuizCardProps {
  quizType: QuizType;
  questionCount: number;
  estimatedMinutes: number;
  completionXP: number;
  difficulty: 'easy' | 'medium' | 'hard';
  remainingUses: number;
  subjectColor: string;
}

const TYPE_META: Record<QuizType, { label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }> = {
  mcq: {
    label: 'Multiple Choice',
    icon: 'radio-button-on',
    desc: 'Select the correct answer from 4 options. Instant feedback after each question.',
  },
  fib: {
    label: 'Fill in the Blanks',
    icon: 'create',
    desc: 'Type the missing word or phrase. Builds active recall and memory.',
  },
  tf: {
    label: 'True or False',
    icon: 'swap-horizontal',
    desc: 'Decide if each statement is true or false. Fast and effective.',
  },
};

const DIFF_COLORS = { easy: '#10B981', medium: COLORS.warning, hard: COLORS.error };

export function QuizCard({
  quizType,
  questionCount,
  estimatedMinutes,
  completionXP,
  difficulty,
  remainingUses,
  subjectColor,
}: QuizCardProps) {
  const meta = TYPE_META[quizType];
  const diffColor = DIFF_COLORS[difficulty];
  const limit = FREE_DAILY_LIMITS[quizType];
  const used = limit - remainingUses;

  return (
    <LinearGradient
      colors={[`${subjectColor}20`, `${subjectColor}08`]}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: `${subjectColor}25` }]}>
          <Ionicons name={meta.icon} size={32} color={subjectColor} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.typeLabel}>{meta.label}</Text>
          <View style={[styles.diffBadge, { backgroundColor: `${diffColor}22` }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.desc}>{meta.desc}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatChip icon="help-circle-outline" label={`${questionCount} questions`} />
        <StatChip icon="time-outline" label={`${estimatedMinutes} min`} />
        <StatChip icon="flash-outline" label={`+${completionXP} XP`} color={COLORS.gold} />
      </View>

      {/* Daily usage indicator */}
      <View style={styles.usageRow}>
        <View style={styles.usageTrack}>
          {Array.from({ length: limit }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.usagePip,
                i < used
                  ? styles.usagePipUsed
                  : { backgroundColor: subjectColor },
              ]}
            />
          ))}
        </View>
        <Text style={styles.usageLabel}>
          {remainingUses}/{limit} free uses left today
        </Text>
      </View>
    </LinearGradient>
  );
}

function StatChip({ icon, label, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; color?: string }) {
  return (
    <View style={styles.statChip}>
      <Ionicons name={icon} size={13} color={color ?? COLORS.textMuted} />
      <Text style={[styles.statChipText, color ? { color } : {}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: { flex: 1, gap: 4 },
  typeLabel: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  diffText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  desc: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.55,
  },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  statChipText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  usageRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  usageTrack: { flexDirection: 'row', gap: 4 },
  usagePip: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  usagePipUsed: { backgroundColor: COLORS.bgCardLight },
  usageLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
});
