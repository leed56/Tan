import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { AVATARS } from '../../constants';
import type { LeaderboardEntry } from '../../types';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const RANK_COLORS: Record<number, { bg: string; text: string; gradient: string[] }> = {
  1: { bg: 'rgba(247, 197, 46, 0.15)', text: '#F7C52E', gradient: ['#F7C52E', '#D4A017'] },
  2: { bg: 'rgba(176, 186, 211, 0.15)', text: '#B0BAD3', gradient: ['#B0BAD3', '#8090A8'] },
  3: { bg: 'rgba(205, 127, 50, 0.15)', text: '#CD7F32', gradient: ['#CD7F32', '#A06020'] },
};

export function LeaderboardCard({ entry, isCurrentUser = false }: LeaderboardCardProps) {
  const rankStyle = RANK_COLORS[entry.rank];
  const avatar = AVATARS.find((a) => a.id === entry.avatarId);
  const isTop3 = entry.rank <= 3;

  return (
    <View style={[styles.card, isCurrentUser && styles.currentUser, isTop3 && { backgroundColor: rankStyle?.bg ?? COLORS.bgCard }]}>
      {/* Rank */}
      <View style={styles.rankContainer}>
        {isTop3 ? (
          <LinearGradient colors={rankStyle.gradient} style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{entry.rank}</Text>
          </LinearGradient>
        ) : (
          <Text style={[styles.rankText, isCurrentUser && styles.currentRankText]}>
            #{entry.rank}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[styles.avatar, isTop3 && { borderColor: rankStyle.text }]}>
        <Text style={styles.avatarEmoji}>{avatar?.emoji ?? '👤'}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{entry.name}</Text>
          {isCurrentUser && <Text style={styles.youTag}>You</Text>}
        </View>
        <Text style={styles.meta}>Form {entry.form} · {entry.school}</Text>
      </View>

      {/* XP */}
      <View style={styles.xpBlock}>
        <Text style={[styles.xp, isTop3 && { color: rankStyle.text }]}>
          {(entry.xp / 1000).toFixed(1)}k
        </Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
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
    padding: SPACING.md,
    gap: SPACING.md,
  },
  currentUser: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(123, 111, 242, 0.1)',
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  rankText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  currentRankText: {
    color: COLORS.primary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  info: { flex: 1, gap: 2 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flexShrink: 1,
  },
  youTag: {
    backgroundColor: COLORS.primary,
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  meta: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  xpBlock: { alignItems: 'flex-end' },
  xp: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  xpLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
