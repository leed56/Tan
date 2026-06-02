import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { MissionProgressBar } from '../../components/ui/gamification/MissionProgressBar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGamificationStore } from '../../store/gamificationStore';
import { SEED_BADGES } from '../../utils/seedBadges';
import { getLevelProgress } from '../../utils/xpUtils';
import { formatXp } from '../../utils';

type Props = StackScreenProps<HomeStackParamList, 'Achievements'>;

export function AchievementsScreen({ navigation }: Props) {
  const { xp, level, streak, coins, earnedBadgeIds } = useGamificationStore();
  const { percent } = getLevelProgress(xp);

  const ACHIEVEMENTS = [
    { id: 'xp_100', title: 'First Century', desc: 'Earn 100 XP', target: 100, current: Math.min(xp, 100), icon: 'flash' },
    { id: 'xp_500', title: 'Knowledge Seeker', desc: 'Earn 500 XP', target: 500, current: Math.min(xp, 500), icon: 'flash' },
    { id: 'xp_1000', title: 'XP Champion', desc: 'Earn 1,000 XP', target: 1000, current: Math.min(xp, 1000), icon: 'trophy' },
    { id: 'streak_3', title: '3-Day Habit', desc: '3-day study streak', target: 3, current: Math.min(streak, 3), icon: 'flame' },
    { id: 'streak_7', title: 'Weekly Warrior', desc: '7-day streak', target: 7, current: Math.min(streak, 7), icon: 'flame' },
    { id: 'coins_50', title: 'Coin Collector', desc: 'Earn 50 coins', target: 50, current: Math.min(coins, 50), icon: 'logo-bitcoin' },
    { id: 'badges_3', title: 'Badge Collector', desc: 'Earn 3 badges', target: 3, current: Math.min(earnedBadgeIds.length, 3), icon: 'medal' },
    { id: 'level_3', title: 'Level Up', desc: 'Reach Level 3', target: 3, current: Math.min(level, 3), icon: 'arrow-up-circle' },
    { id: 'level_5', title: 'Advanced Learner', desc: 'Reach Level 5', target: 5, current: Math.min(level, 5), icon: 'arrow-up-circle' },
    { id: 'xp_5000', title: 'NECTA Ready', desc: 'Earn 5,000 XP', target: 5000, current: Math.min(xp, 5000), icon: 'school' },
  ];

  return (
    <ScreenContainer padded={false}>
      <LinearGradient colors={[`${COLORS.primary}20`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Progress</Text>
        <Text style={styles.headerTitle}>Achievements</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {ACHIEVEMENTS.map((a) => {
          const done = a.current >= a.target;
          const percent = Math.min(100, Math.round((a.current / a.target) * 100));
          return (
            <View key={a.id} style={[styles.row, done && styles.rowDone]}>
              <View style={[styles.iconWrap, done && styles.iconDone]}>
                <Ionicons
                  name={a.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={done ? COLORS.success : COLORS.textMuted}
                />
              </View>
              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !done && styles.titleLocked]}>{a.title}</Text>
                  {done && <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />}
                </View>
                <Text style={styles.desc}>{a.desc}</Text>
                <MissionProgressBar progress={percent} color={done ? COLORS.success : COLORS.primary} height={4} />
                <Text style={styles.progressText}>
                  {a.current.toLocaleString()} / {a.target.toLocaleString()}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingHorizontal: SPACING.screenPadding, paddingBottom: SPACING.xl, gap: SPACING.sm },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold },
  body: { paddingHorizontal: SPACING.screenPadding, paddingTop: SPACING.base, paddingBottom: SPACING['3xl'], gap: SPACING.sm },
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg, padding: SPACING.base,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  rowDone: { borderColor: `${COLORS.success}30` },
  iconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgCardLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
  },
  iconDone: { backgroundColor: `${COLORS.success}15` },
  info: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, flex: 1 },
  titleLocked: { color: COLORS.textSecondary },
  desc: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  progressText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
});
