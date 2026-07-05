import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LeaderboardBoard } from '../../components/ui/gamification/LeaderboardBoard';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useAuthStore } from '../../store/authStore';

type Props = StackScreenProps<HomeStackParamList, 'WeeklyLeaderboard'>;

export function WeeklyLeaderboardScreen({ navigation, route }: Props) {
  const uid = useAuthStore((s) => s.user?.uid);
  // MonthlyLeaderboard delegates straight to this screen (see
  // MonthlyLeaderboardScreen) — its route name tells us which tab to open on.
  const initialTab = (route.name as string) === 'MonthlyLeaderboard' ? 'monthly' : 'weekly';

  return (
    <ScreenContainer padded={false}>
      <LinearGradient colors={[`${COLORS.gold}18`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Rankings</Text>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </LinearGradient>

      <LeaderboardBoard initialTab={initialTab} currentUid={uid} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingHorizontal: SPACING.screenPadding, paddingBottom: SPACING.xl, gap: SPACING.sm },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold },
});
