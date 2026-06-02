import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MissionProgressBar } from './MissionProgressBar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../../theme';
import type { DailyMissionDef } from '../../../types/gamification';

interface Props {
  def: DailyMissionDef;
  progress: number;
  target: number;
  isCompleted: boolean;
  claimed: boolean;
  onClaim: () => void;
}

export function MissionCard({ def, progress, target, isCompleted, claimed, onClaim }: Props) {
  const percent = Math.min(100, Math.round((progress / target) * 100));
  const canClaim = isCompleted && !claimed;

  return (
    <View style={[styles.card, claimed && styles.cardClaimed]}>
      <View style={[styles.iconWrap, isCompleted && styles.iconDone]}>
        <Ionicons
          name={def.iconName as keyof typeof Ionicons.glyphMap}
          size={22}
          color={isCompleted ? COLORS.success : COLORS.textMuted}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, claimed && styles.titleClaimed]}>{def.title}</Text>
          {claimed && <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />}
        </View>
        <Text style={styles.desc}>{def.description}</Text>

        <MissionProgressBar
          progress={percent}
          color={isCompleted ? COLORS.success : COLORS.primary}
        />

        <View style={styles.footer}>
          <Text style={styles.progressText}>{progress} / {target}</Text>
          <View style={styles.rewards}>
            {def.xpReward > 0 && (
              <View style={styles.rewardChip}>
                <Text style={styles.rewardText}>+{def.xpReward} XP</Text>
              </View>
            )}
            <View style={styles.rewardChip}>
              <Text style={styles.rewardText}>🪙 {def.coinsReward}</Text>
            </View>
          </View>
        </View>
      </View>

      {canClaim && (
        <TouchableOpacity onPress={onClaim} activeOpacity={0.85} style={styles.claimBtn}>
          <LinearGradient colors={GRADIENTS.gold} style={styles.claimGrad}>
            <Text style={styles.claimText}>Claim</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cardClaimed: { opacity: 0.6 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgCardLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  iconDone: { backgroundColor: `${COLORS.success}15` },
  body: { flex: 1, gap: SPACING.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, flex: 1 },
  titleClaimed: { color: COLORS.textMuted },
  desc: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, lineHeight: TYPOGRAPHY.sizes.xs * 1.5 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  progressText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  rewards: { flexDirection: 'row', gap: 4 },
  rewardChip: {
    backgroundColor: 'rgba(123,111,242,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rewardText: { color: COLORS.primary, fontSize: 10, fontWeight: TYPOGRAPHY.weights.semibold },
  claimBtn: { flexShrink: 0, alignSelf: 'center' },
  claimGrad: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  claimText: { color: '#1A1A1A', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
});
