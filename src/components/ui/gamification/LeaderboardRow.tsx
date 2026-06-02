import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../../theme';
import { AVATARS } from '../../../constants';
import type { LeaderboardScore } from '../../../types/gamification';
import { formatXp } from '../../../utils';

interface Props {
  entry: LeaderboardScore;
  isCurrentUser?: boolean;
  xpField?: 'totalXp' | 'weeklyXp' | 'monthlyXp';
}

function getRankColors(rank: number): string[] {
  if (rank === 1) return ['#F7C52E', '#D4A017'];
  if (rank === 2) return ['#B0BAD3', '#8A95AF'];
  if (rank === 3) return ['#CD7F32', '#A0612A'];
  return [COLORS.bgCard, COLORS.bgCard];
}

export function LeaderboardRow({ entry, isCurrentUser, xpField = 'totalXp' }: Props) {
  const avatar = AVATARS.find((a) => a.id === entry.avatarId);
  const isPodium = entry.rank <= 3;
  const xpValue = entry[xpField];

  return (
    <View style={[styles.row, isCurrentUser && styles.rowSelf]}>
      {/* Rank */}
      {isPodium ? (
        <LinearGradient colors={getRankColors(entry.rank)} style={styles.rankBadge}>
          <Text style={styles.rankBadgeText}>{entry.rank}</Text>
        </LinearGradient>
      ) : (
        <Text style={[styles.rankNum, isCurrentUser && styles.rankNumSelf]}>{entry.rank}</Text>
      )}

      {/* Avatar */}
      <View style={[styles.avatarCircle, isCurrentUser && styles.avatarSelf]}>
        <Text style={styles.avatarEmoji}>{avatar?.emoji ?? '🧑'}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, isCurrentUser && styles.nameSelf]} numberOfLines={1}>
          {entry.name}
        </Text>
        <View style={styles.meta}>
          <View style={styles.formBadge}>
            <Text style={styles.formText}>F{entry.form}</Text>
          </View>
          <Text style={styles.school} numberOfLines={1}>{entry.school}</Text>
        </View>
      </View>

      {/* XP + rank change */}
      <View style={styles.right}>
        <Text style={[styles.xp, isCurrentUser && styles.xpSelf]}>{formatXp(xpValue)} XP</Text>
        {entry.rankChange !== 0 && (
          <View style={styles.rankChange}>
            <Ionicons
              name={entry.rankChange > 0 ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={entry.rankChange > 0 ? COLORS.success : COLORS.error}
            />
            <Text style={[styles.rankChangeText, { color: entry.rankChange > 0 ? COLORS.success : COLORS.error }]}>
              {Math.abs(entry.rankChange)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  rowSelf: {
    borderColor: `${COLORS.primary}60`,
    backgroundColor: `${COLORS.primary}10`,
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rankBadgeText: { color: '#1A1A1A', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  rankNum: { width: 28, color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center', flexShrink: 0 },
  rankNumSelf: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgCardLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarSelf: { backgroundColor: `${COLORS.primary}25`, borderWidth: 1.5, borderColor: COLORS.primary },
  avatarEmoji: { fontSize: 18 },
  info: { flex: 1, minWidth: 0 },
  name: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  nameSelf: { color: COLORS.primary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  formBadge: {
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  formText: { color: COLORS.textMuted, fontSize: 9, fontWeight: TYPOGRAPHY.weights.bold },
  school: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, flex: 1 },
  right: { alignItems: 'flex-end', flexShrink: 0 },
  xp: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.extrabold },
  xpSelf: { color: COLORS.primary },
  rankChange: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  rankChangeText: { fontSize: 9, fontWeight: TYPOGRAPHY.weights.bold },
});
