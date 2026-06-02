import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { SubjectProgressSummary } from '../../../types/curriculum';

interface CurriculumProgressCardProps {
  formName: string;
  subjectCount: number;
  totalTopics: number;
  summaries: SubjectProgressSummary[];
}

export function CurriculumProgressCard({
  formName,
  subjectCount,
  totalTopics,
  summaries,
}: CurriculumProgressCardProps) {
  const completedPacks = summaries.reduce((s, p) => s + p.completedPacks, 0);
  const totalPacks = summaries.reduce((s, p) => s + p.totalPacks, 0);
  const overallPct = totalPacks > 0 ? Math.round((completedPacks / totalPacks) * 100) : 0;
  const totalXp = summaries.reduce((s, p) => s + p.totalXpEarned, 0);

  return (
    <LinearGradient
      colors={['#2A1F6B', '#1C2347']}
      style={styles.card}
    >
      <View style={styles.top}>
        <View>
          <Text style={styles.formLabel}>{formName} Progress</Text>
          <Text style={styles.formSub}>{subjectCount} subjects · {totalTopics} topics</Text>
        </View>
        <View style={styles.xpBadge}>
          <Ionicons name="flash" size={14} color={COLORS.primary} />
          <Text style={styles.xpText}>{totalXp} XP</Text>
        </View>
      </View>

      {/* Overall bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Overall Completion</Text>
          <Text style={styles.progressPct}>{overallPct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${overallPct}%` }]}
          />
        </View>
      </View>

      {/* Mini stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedPacks}</Text>
          <Text style={styles.statLabel}>Packs Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{summaries.filter((s) => s.completedPacks > 0).length}</Text>
          <Text style={styles.statLabel}>Started</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{subjectCount - summaries.filter((s) => s.completedPacks > 0).length}</Text>
          <Text style={styles.statLabel}>Not Started</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(123,111,242,0.3)',
    gap: SPACING.md,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  formLabel: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  formSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(123,111,242,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  xpText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  progressSection: { gap: SPACING.xs },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs },
  progressPct: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  progressTrack: {
    height: 8, backgroundColor: COLORS.bgCardLight, borderRadius: RADIUS.full, overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: RADIUS.full, minWidth: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.glassBorder },
  statValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.extrabold },
  statLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
});
