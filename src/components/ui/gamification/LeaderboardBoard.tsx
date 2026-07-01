/**
 * LeaderboardBoard — the single leaderboard experience shared by the
 * Leaderboard tab (root, no back button) and the pushed Weekly/Monthly
 * Leaderboard screens reached from the gamification profile. Backed by real
 * `useLeaderboardStore` data; no demo/hardcoded entries.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import { AVATARS } from '../../../constants';
import { useLeaderboardStore } from '../../../store/leaderboardStore';
import type { LeaderboardTab } from '../../../services/leaderboardService';
import type { LeaderboardScore } from '../../../types/gamification';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardBoardProps {
  initialTab?: LeaderboardTab;
  currentUid?: string;
}

const TABS: { label: string; value: LeaderboardTab }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'All-Time', value: 'national' },
  { label: 'School', value: 'school' },
];

const XP_FIELD: Record<LeaderboardTab, 'weeklyXp' | 'monthlyXp' | 'totalXp'> = {
  weekly: 'weeklyXp',
  monthly: 'monthlyXp',
  national: 'totalXp',
  school: 'totalXp',
  friends: 'totalXp',
};

const PODIUM_HEIGHTS = { 1: 80, 2: 60, 3: 50 } as const;
const PODIUM_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' } as const;
const PODIUM_COLORS = { 1: COLORS.gold, 2: '#B0BAD3', 3: '#CD7F32' } as const;

export function LeaderboardBoard({ initialTab = 'weekly', currentUid }: LeaderboardBoardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>(initialTab);
  const { data, loading, fetchLeaderboard } = useLeaderboardStore();

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const entries = data[activeTab] ?? [];
  const xpField = XP_FIELD[activeTab];
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <View style={styles.root}>
      {/* Tabs */}
      <View style={styles.tabsWrap}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => setActiveTab(tab.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top 3 podium */}
      {podium.length >= 3 && (
        <View style={styles.podium}>
          <PodiumItem entry={podium[1]} position={2} xpField={xpField} />
          <PodiumItem entry={podium[0]} position={1} xpField={xpField} />
          <PodiumItem entry={podium[2]} position={3} xpField={xpField} />
        </View>
      )}

      <FlatList
        data={podium.length >= 3 ? rest : entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.loading}>Loading rankings...</Text>
          ) : (
            <Text style={styles.empty}>No data available yet.</Text>
          )
        }
        renderItem={({ item }) => (
          <LeaderboardRow
            entry={item}
            isCurrentUser={!!currentUid && item.userId === currentUid}
            xpField={xpField}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />
    </View>
  );
}

function PodiumItem({
  entry,
  position,
  xpField,
}: {
  entry: LeaderboardScore;
  position: 1 | 2 | 3;
  xpField: 'weeklyXp' | 'monthlyXp' | 'totalXp';
}) {
  const avatar = AVATARS.find((a) => a.id === entry.avatarId);
  const color = PODIUM_COLORS[position];
  const xpValue = entry[xpField];

  return (
    <View style={styles.podiumItem}>
      <Text style={styles.podiumMedal}>{PODIUM_MEDALS[position]}</Text>
      <View style={[styles.podiumAvatar, { borderColor: color }]}>
        <Text style={{ fontSize: 24 }}>{avatar?.emoji ?? '👤'}</Text>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{entry.name}</Text>
      <Text style={[styles.podiumXp, { color }]}>{(xpValue / 1000).toFixed(1)}k XP</Text>
      <LinearGradient
        colors={[`${color}40`, `${color}15`]}
        style={[styles.podiumBar, { height: PODIUM_HEIGHTS[position] }]}
      >
        <Text style={[styles.podiumRank, { color }]}>#{position}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabsWrap: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgMid,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  tabTextActive: { color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.semibold },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.base,
    gap: SPACING.sm,
  },
  podiumItem: { flex: 1, alignItems: 'center', gap: SPACING.xs },
  podiumMedal: { fontSize: 24 },
  podiumAvatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  podiumName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
  podiumXp: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  podiumBar: {
    width: '100%',
    borderRadius: RADIUS.md,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  podiumRank: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.extrabold },
  list: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },
  loading: { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl },
  empty: { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl },
});
