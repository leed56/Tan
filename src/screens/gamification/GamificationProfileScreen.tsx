import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LevelRing } from '../../components/ui/gamification/LevelRing';
import { StreakFireCard } from '../../components/ui/gamification/StreakFireCard';
import { CoinBalanceChip } from '../../components/ui/gamification/CoinBalanceChip';
import { BadgeCard } from '../../components/ui/gamification/BadgeCard';
import { MissionProgressBar } from '../../components/ui/gamification/MissionProgressBar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { useResponsiveScale, moderateScale } from '../../theme/responsive';
import { useGamificationStore } from '../../store/gamificationStore';
import { useAuthStore } from '../../store/authStore';
import { getLevelProgress } from '../../utils/xpUtils';
import { formatXp } from '../../utils';

type Props = StackScreenProps<HomeStackParamList, 'GamificationProfile'>;

export function GamificationProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const { xp, level, streak, coins, badges, earnedBadgeIds, fetchProfile } = useGamificationStore();
  const scale = useResponsiveScale();
  const ringSize = moderateScale(110, scale);

  useEffect(() => {
    if (user?.uid) fetchProfile(user.uid);
  }, [user?.uid, fetchProfile]);

  const { current, total, percent } = getLevelProgress(xp);
  const earnedBadges = badges.filter((b) => earnedBadgeIds.includes(b.id));

  return (
    <ScreenContainer padded={false}>
      <LinearGradient colors={[`${COLORS.primary}25`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Your Profile</Text>

        {/* Hero row */}
        <View style={styles.heroRow}>
          <LevelRing xp={xp} level={level} size={ringSize} color={COLORS.primary} />
          <View style={styles.heroStats}>
            <Text style={styles.xpValue}>{formatXp(xp)} XP</Text>
            <Text style={styles.xpSub}>Level {level} · {getLevelProgress(xp).percent}% to next</Text>
            <View style={styles.chipRow}>
              <CoinBalanceChip coins={coins} />
              <View style={styles.streakChip}>
                <Text style={styles.streakText}>🔥 {streak} days</Text>
              </View>
            </View>
          </View>
        </View>

        {/* XP Progress bar */}
        <View style={styles.xpBarWrap}>
          <View style={styles.xpBarTrack}>
            <View style={[styles.xpBarFill, { width: `${percent}%` as any }]} />
          </View>
          <Text style={styles.xpBarLabel}>{current} / {total} XP</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total XP', value: formatXp(xp), icon: 'flash', color: COLORS.gold },
            { label: 'Level', value: String(level), icon: 'trophy', color: COLORS.primary },
            { label: 'Streak', value: `${streak}d`, icon: 'flame', color: '#FF8C42' },
            { label: 'Coins', value: String(coins), icon: 'logo-bitcoin', color: COLORS.gold },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={18} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Streak card */}
        <Text style={styles.sectionLabel}>Current Streak</Text>
        <StreakFireCard streak={streak} />

        {/* Badges */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Badges ({earnedBadges.length}/{badges.length})</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Badges')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.badgesGrid}>
          {badges.slice(0, 6).map((b) => (
            <View key={b.id} style={styles.badgeItem}>
              <BadgeCard badge={b} earned={earnedBadgeIds.includes(b.id)} size="sm" />
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'calendar-outline', label: 'Daily Missions', screen: 'DailyMissions' },
            { icon: 'gift-outline', label: 'Rewards', screen: 'Rewards' },
            { icon: 'trophy-outline', label: 'Leaderboard', screen: 'WeeklyLeaderboard' },
            { icon: 'medal-outline', label: 'Achievements', screen: 'Achievements' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen as any)}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={22} color={COLORS.primary} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingHorizontal: SPACING.screenPadding, paddingBottom: SPACING.xl, gap: SPACING.sm },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.base },
  heroStats: { flex: 1, gap: SPACING.sm },
  xpValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold },
  xpSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  chipRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  streakChip: {
    backgroundColor: 'rgba(255,140,66,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,140,66,0.3)',
  },
  streakText: { color: '#FF8C42', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  xpBarWrap: { gap: 4 },
  xpBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    minWidth: 4,
  },
  xpBarLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, textAlign: 'right' },
  body: { paddingHorizontal: SPACING.screenPadding, paddingTop: SPACING.base, paddingBottom: SPACING['3xl'], gap: SPACING.md },
  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  statValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.extrabold },
  statLabel: { color: COLORS.textMuted, fontSize: 10 },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  badgeItem: { width: '30%' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  actionLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center' },
});
