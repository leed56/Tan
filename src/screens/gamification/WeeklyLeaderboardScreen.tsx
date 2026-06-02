import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LeaderboardRow } from '../../components/ui/gamification/LeaderboardRow';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { useProfileStore } from '../../store/profileStore';
import type { LeaderboardTab } from '../../services/leaderboardService';

type Props = StackScreenProps<HomeStackParamList, 'WeeklyLeaderboard'>;

const TABS: { label: string; value: LeaderboardTab }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'All-Time', value: 'national' },
  { label: 'School', value: 'school' },
];

export function WeeklyLeaderboardScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('weekly');
  const { data, loading, fetchLeaderboard } = useLeaderboardStore();
  const { xp } = useGamificationStore();
  const profile = useProfileStore((s) => s.profile);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const entries = data[activeTab];
  const xpField: 'weeklyXp' | 'monthlyXp' | 'totalXp' =
    activeTab === 'weekly' ? 'weeklyXp' : activeTab === 'monthly' ? 'monthlyXp' : 'totalXp';

  return (
    <ScreenContainer padded={false}>
      <LinearGradient colors={[`${COLORS.gold}18`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Rankings</Text>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </LinearGradient>

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

      <FlatList
        data={entries}
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
            isCurrentUser={item.name === (profile?.name ?? 'You')}
            xpField={xpField}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingHorizontal: SPACING.screenPadding, paddingBottom: SPACING.xl, gap: SPACING.sm },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold },
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  tabTextActive: { color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.semibold },
  list: { paddingHorizontal: SPACING.screenPadding, paddingTop: SPACING.base, paddingBottom: SPACING['3xl'] },
  loading: { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl },
  empty: { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl },
});
