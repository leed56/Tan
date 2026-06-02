import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DifficultyBadge } from './DifficultyBadge';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { CurriculumTopic, TopicProgressSummary } from '../../../types/curriculum';

interface TopicCardProps {
  topic: CurriculumTopic;
  subjectColor: string;
  progress?: TopicProgressSummary;
  packCount?: number;
  onPress: (topic: CurriculumTopic) => void;
}

export function TopicCard({
  topic,
  subjectColor,
  progress,
  packCount = 0,
  onPress,
}: TopicCardProps) {
  const pct = progress?.progressPercent ?? 0;
  const completed = progress?.completedPacks ?? 0;
  const total = progress?.totalPacks ?? packCount;
  const isDone = pct === 100;
  const isStarted = pct > 0 && !isDone;

  return (
    <TouchableOpacity
      onPress={() => onPress(topic)}
      activeOpacity={0.8}
      style={[styles.card, isDone && styles.doneCard]}
    >
      {/* Status icon */}
      <View style={[styles.statusIcon, isDone && { backgroundColor: `${subjectColor}25` }]}>
        {isDone ? (
          <Ionicons name="checkmark-circle" size={24} color={subjectColor} />
        ) : isStarted ? (
          <Ionicons name="play-circle" size={24} color={subjectColor} />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color={COLORS.textMuted} />
        )}
      </View>

      <View style={styles.content}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{topic.name}</Text>
          <DifficultyBadge difficulty={topic.difficulty} />
        </View>

        <Text style={styles.desc} numberOfLines={2}>{topic.description}</Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="layers-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{total} packs</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{topic.estimatedMinutes} min</Text>
          </View>
          {total > 0 && (
            <Text style={[styles.progressText, { color: isDone ? subjectColor : COLORS.textMuted }]}>
              {completed}/{total} done
            </Text>
          )}
        </View>

        {/* Progress bar */}
        {pct > 0 && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%`, backgroundColor: subjectColor },
              ]}
            />
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.md,
  },
  doneCard: {
    borderColor: `${COLORS.success}40`,
    backgroundColor: 'rgba(78,205,196,0.04)',
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, gap: SPACING.xs },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  title: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  desc: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: 2,
  },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  progressText: { marginLeft: 'auto', fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  progressFill: { height: 4, borderRadius: RADIUS.full, minWidth: 4 },
});
