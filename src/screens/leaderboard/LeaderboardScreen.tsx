import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LeaderboardCard } from '../../components/ui/LeaderboardCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { DEMO_LEADERBOARD, AVATARS } from '../../constants';
import { useProfileStore } from '../../store/profileStore';
import { useGamificationStore } from '../../store/gamificationStore';
import type { LeaderboardTab, LeaderboardEntry } from '../../types';

const TABS: { label: string; value: LeaderboardTab; icon: string }[] = [
  { label: 'National', value: 'national', icon: 'globe-outline' },
  { label: 'School', value: 'school', icon: 'school-outline' },
  { label: 'Friends', value: 'friends', icon: 'people-outline' },
];

// Demo current user entry
const CURRENT_USER_ENTRY: LeaderboardEntry = {
  uid: 'demo_user_001',
  name: 'You',
  avatarId: 'avatar_1',
  form: 2,
  school: 'Your School',
  xp: 1240,
  rank: 42,
  weeklyXp: 180,
};

export function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('national');
  const profile = useProfileStore((s) => s.profile);
  const { xp } = useGamificationStore();

  const currentEntry: LeaderboardEntry = {
    ...CURRENT_USER_ENTRY,
    name: profile?.name ?? 'You',
    form: profile?.form ?? 2,
    school: profile?.school ?? 'Your School',
    xp,
  };

  // TODO: Phase 2 — fetch real leaderboard from Firestore by tab type
  const getData = (): LeaderboardEntry[] => {
    if (activeTab === 'school') {
      return DEMO_LEADERBOARD.slice(0, 5).map((e, i) => ({ ...e, rank: i + 1 }));
    }
    if (activeTab === 'friends') {
      return []; // TODO: Phase 2 — friends leaderboard via contact sync
    }
    return DEMO_LEADERBOARD;
  };

  const data = getData();
  const userAvatar = AVATARS.find((a) => a.id === (profile?.avatarId ?? 'avatar_1'));

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient colors={['#1C2347', '#131936']} style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSub}>This week's top students</Text>

        {/* Tab selector */}
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            >
              <Ionicons
                name={tab.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={activeTab === tab.value ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Top 3 podium */}
      {activeTab !== 'friends' && data.length >= 3 && (
        <View style={styles.podium}>
          {/* 2nd place */}
          <PodiumItem entry={data[1]} position={2} />
          {/* 1st place */}
          <PodiumItem entry={data[0]} position={1} />
          {/* 3rd place */}
          <PodiumItem entry={data[2]} position={3} />
        </View>
      )}

      {/* Current user sticky row */}
      <View style={styles.myRankRow}>
        <Ionicons name="person-circle" size={16} color={COLORS.primary} />
        <Text style={styles.myRankText}>Your rank: <Text style={styles.myRankNum}>#{currentEntry.rank}</Text></Text>
        <Text style={styles.myXp}>{currentEntry.xp} XP</Text>
      </View>

      <FlatList
        data={data.slice(3)}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={activeTab === 'friends' ? 'No friends yet' : 'No data available'}
            description={
              activeTab === 'friends'
                ? 'Invite friends to see how you compare. Coming in Phase 2.'
                : 'Leaderboard data will appear here.'
            }
          />
        }
        renderItem={({ item }) => (
          <LeaderboardCard
            entry={item}
            isCurrentUser={item.uid === 'demo_user_001'}
          />
        )}
        ListFooterComponent={<View style={{ height: SPACING['2xl'] }} />}
      />
    </ScreenContainer>
  );
}

function PodiumItem({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) {
  const avatar = AVATARS.find((a) => a.id === entry.avatarId);
  const heights = { 1: 80, 2: 60, 3: 50 };
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const colors = { 1: COLORS.gold, 2: '#B0BAD3', 3: '#CD7F32' };

  return (
    <View style={styles.podiumItem}>
      <Text style={styles.podiumMedal}>{medals[position]}</Text>
      <View style={[styles.podiumAvatar, { borderColor: colors[position] }]}>
        <Text style={{ fontSize: 24 }}>{avatar?.emoji ?? '👤'}</Text>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{entry.name}</Text>
      <Text style={[styles.podiumXp, { color: colors[position] }]}>
        {(entry.xp / 1000).toFixed(1)}k XP
      </Text>
      <LinearGradient
        colors={[`${colors[position]}40`, `${colors[position]}15`]}
        style={[styles.podiumBar, { height: heights[position] }]}
      >
        <Text style={[styles.podiumRank, { color: colors[position] }]}>#{position}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING.base,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.base,
    gap: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  headerSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 4,
    gap: 4,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  tabActive: { backgroundColor: 'rgba(123, 111, 242, 0.2)' },
  tabText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  tabTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },
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
  myRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(123, 111, 242, 0.1)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  myRankText: { flex: 1, color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm },
  myRankNum: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },
  myXp: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  list: {
    paddingHorizontal: SPACING.screenPadding,
  },
});
