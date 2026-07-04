import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DifficultyBadge } from './DifficultyBadge';
import { PremiumBadge } from './PremiumBadge';
import { XPBadge } from './XPBadge';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { CurriculumLearningPack, CurriculumPackType } from '../../../types/curriculum';

interface LearningPackListItemProps {
  pack: CurriculumLearningPack;
  subjectColor: string;
  progressPercent: number;
  isCompleted: boolean;
  onPress: (pack: CurriculumLearningPack) => void;
}

const PACK_TYPE_META: Record<CurriculumPackType, { label: string; icon: string; color: string }> = {
  mcq:     { label: 'Multiple Choice',   icon: 'radio-button-on', color: '#4A90D9' },
  tf:      { label: 'True / False',       icon: 'swap-horizontal',  color: '#F59E0B' },
  fib:     { label: 'Fill in Blank',      icon: 'create',            color: '#10B981' },
  summary: { label: 'Summary',             icon: 'sparkles',          color: '#F7C52E' },
  hoq:     { label: 'Higher Order',       icon: 'bulb',              color: '#EC4899' },
};

export function LearningPackListItem({
  pack,
  subjectColor,
  progressPercent,
  isCompleted,
  onPress,
}: LearningPackListItemProps) {
  const meta = PACK_TYPE_META[pack.type];

  return (
    <TouchableOpacity
      onPress={() => onPress(pack)}
      activeOpacity={0.8}
      style={[styles.card, isCompleted && styles.completedCard, pack.isPremium && styles.premiumCard]}
    >
      {/* Type tag */}
      <View style={[styles.typeTag, { backgroundColor: `${meta.color}20` }]}>
        <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={14} color={meta.color} />
        <Text style={[styles.typeText, { color: meta.color }]}>{meta.label}</Text>
      </View>

      <View style={styles.body}>
        {/* Title + completion status */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{pack.title}</Text>
          {isCompleted && (
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          )}
        </View>

        <Text style={styles.desc} numberOfLines={2}>{pack.description}</Text>

        {/* Badges row */}
        <View style={styles.badgesRow}>
          <DifficultyBadge difficulty={pack.difficulty} />
          {pack.isPremium && <PremiumBadge />}
          <View style={styles.spacer} />
          <XPBadge xp={pack.completionXP} />
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          {pack.questionCount > 0 && (
            <View style={styles.metaChip}>
              <Ionicons name="help-circle-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{pack.questionCount} questions</Text>
            </View>
          )}
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{pack.estimatedMinutes} min</Text>
          </View>
        </View>

        {/* Progress bar */}
        {progressPercent > 0 && !isCompleted && (
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[subjectColor, `${subjectColor}99`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={styles.progressLabel}>{progressPercent}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  completedCard: {
    borderColor: `${COLORS.success}40`,
    backgroundColor: 'rgba(78,205,196,0.05)',
  },
  premiumCard: {
    borderColor: 'rgba(247,197,46,0.25)',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  typeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  body: { gap: SPACING.xs },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  spacer: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  progressTrack: {
    flex: 1, height: 4, backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: RADIUS.full, minWidth: 4 },
  progressLabel: {
    color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs,
    minWidth: 32, textAlign: 'right',
  },
});
