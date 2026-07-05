import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LeaderboardBoard } from '../../components/ui/gamification/LeaderboardBoard';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export function LeaderboardScreen() {
  const uid = useAuthStore((s) => s.user?.uid);

  return (
    <ScreenContainer padded={false}>
      <LinearGradient colors={['#1C2347', '#131936']} style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSub}>See how you compare with other students</Text>
      </LinearGradient>

      <LeaderboardBoard initialTab="weekly" currentUid={uid} />
    </ScreenContainer>
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
});
