import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import type { LearningPack, PackType } from '../../types';

interface LearningPackCardProps {
  pack: LearningPack;
  subjectColor: string;
  onPress: (pack: LearningPack) => void;
}

const PACK_TYPE_META: Record<PackType, { label: string; icon: string; color: string }> = {
  mcq: { label: 'Multiple Choice', icon: 'radio-button-on', color: '#4A90D9' },
  fib: { label: 'Fill in Blank', icon: 'create', color: '#10B981' },
  tf: { label: 'True / False', icon: 'swap-horizontal', color: '#F59E0B' },
  hoq: { label: 'Higher Order', icon: 'bulb', color: '#EC4899' },
  summary: { label: 'AI Summary', icon: 'sparkles', color: '#F7C52E' },
};

export function LearningPackCard({ pack, subjectColor, onPress }: LearningPackCardProps) {
  const meta = PACK_TYPE_META[pack.type];
  const isLocked = pack.isPremium;

  return (
    <TouchableOpacity
      onPress={() => onPress(pack)}
      activeOpacity={0.8}
      style={[styles.card, pack.isCompleted && styles.completedCard]}
    >
      <View style={[styles.typeTag, { backgroundColor: `${meta.color}20` }]}>
        <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={16} color={meta.color} />
        <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{pack.title}</Text>
          {isLocked && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={12} color={COLORS.gold} />
            </View>
          )}
          {pack.isCompleted && (
            <View style={styles.doneBadge}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>{pack.description}</Text>

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Ionicons name="help-circle-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{pack.questionCount} questions</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{pack.estimatedMinutes} min</Text>
          </View>
          <View style={[styles.xpBadge, { backgroundColor: `${subjectColor}20` }]}>
            <Text style={[styles.xpText, { color: subjectColor }]}>+{pack.xpReward} XP</Text>
          </View>
        </View>
      </View>

      {pack.completionPercent > 0 && !pack.isCompleted && (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[subjectColor, `${subjectColor}99`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${pack.completionPercent}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>{pack.completionPercent}%</Text>
        </View>
      )}
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
    backgroundColor: 'rgba(78, 205, 196, 0.05)',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
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
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(247, 197, 46, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBadge: {},
  description: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  xpBadge: {
    marginLeft: 'auto',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  xpText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: RADIUS.full,
    minWidth: 4,
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    minWidth: 30,
    textAlign: 'right',
  },
});
