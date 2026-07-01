import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../AppButton';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

type Variant = 'subjects' | 'topics' | 'packs' | 'progress';

interface EmptyCurriculumStateProps {
  variant: Variant;
  formName?: string;
  onAction?: () => void;
  /** Forces a fresh fetch instead of navigating away — surfaced separately
   * from onAction so an empty result (as opposed to a thrown error, which
   * already has its own "Try Again" via ErrorState) is still recoverable
   * without a full app reload. */
  onRetry?: () => void;
}

const CONFIG: Record<Variant, { icon: string; title: string; desc: string; action: string }> = {
  subjects: {
    icon: 'book-outline',
    title: 'No subjects found',
    desc: 'No subjects are available for this form yet. Check back soon.',
    action: 'Refresh',
  },
  topics: {
    icon: 'layers-outline',
    title: 'No topics yet',
    desc: 'Topics for this subject are being prepared. They will appear here soon.',
    action: 'Go back',
  },
  packs: {
    icon: 'document-outline',
    title: 'No learning packs',
    desc: 'Learning packs for this topic are being prepared by our curriculum team.',
    action: 'Go back',
  },
  progress: {
    icon: 'trophy-outline',
    title: 'No progress yet',
    desc: 'Start learning to track your progress here.',
    action: 'Start learning',
  },
};

export function EmptyCurriculumState({
  variant,
  formName,
  onAction,
  onRetry,
}: EmptyCurriculumStateProps) {
  const c = CONFIG[variant];
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name={c.icon as keyof typeof Ionicons.glyphMap} size={44} color={COLORS.textMuted} />
      </View>
      <Text style={styles.title}>{c.title}</Text>
      <Text style={styles.desc}>
        {formName ? `${formName}: ${c.desc}` : c.desc}
      </Text>
      <View style={styles.actionRow}>
        {onRetry && (
          <AppButton title="Retry" onPress={onRetry} fullWidth={false} size="md" variant="primary" />
        )}
        {onAction && (
          <AppButton title={c.action} onPress={onAction} fullWidth={false} size="md" variant="secondary" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * 1.6,
  },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
});
