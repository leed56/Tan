import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { MissionCard } from '../../components/ui/gamification/MissionCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { DAILY_MISSIONS } from '../../utils/seedBadges';
import { useMissionStore } from '../../store/missionStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { useAuthStore } from '../../store/authStore';

type Props = StackScreenProps<HomeStackParamList, 'DailyMissions'>;

export function DailyMissionsScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const { missions, loading, fetchMissions, claim, completedCount } = useMissionStore();
  const { addXp, addCoins } = useGamificationStore();

  useEffect(() => {
    if (user?.uid) fetchMissions(user.uid);
  }, [user?.uid, fetchMissions]);

  const handleClaim = async (missionId: string) => {
    if (!user?.uid) return;
    const def = DAILY_MISSIONS.find((m) => m.id === missionId);
    if (!def) return;
    await claim(user.uid, missionId);
    if (def.xpReward > 0) addXp(def.xpReward);
    addCoins(def.coinsReward);
  };

  const completed = completedCount();
  const total = DAILY_MISSIONS.length;
  const allDone = completed === total;

  // Midnight reset countdown
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const hoursLeft = Math.floor((midnight.getTime() - now.getTime()) / 3600000);
  const minsLeft = Math.floor(((midnight.getTime() - now.getTime()) % 3600000) / 60000);

  return (
    <ScreenContainer padded={false}>
      <LinearGradient colors={[`${COLORS.primary}20`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Today's Missions</Text>
        <Text style={styles.headerTitle}>Daily Challenges</Text>
        <View style={styles.headerMeta}>
          <View style={styles.metaChip}>
            <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.success} />
            <Text style={styles.metaText}>{completed} / {total} complete</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>Resets in {hoursLeft}h {minsLeft}m</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {allDone && (
          <LinearGradient colors={[`${COLORS.success}20`, COLORS.bgDark]} style={styles.allDoneBanner}>
            <Text style={styles.allDoneText}>🎉 All missions complete! Come back tomorrow.</Text>
          </LinearGradient>
        )}

        {DAILY_MISSIONS.map((def) => {
          const mission = missions.find((m) => m.missionId === def.id);
          return (
            <MissionCard
              key={def.id}
              def={def}
              progress={mission?.progress ?? 0}
              target={def.targetCount}
              isCompleted={mission?.isCompleted ?? false}
              claimed={mission?.claimedAt !== null && mission?.claimedAt !== undefined}
              onClaim={() => handleClaim(def.id)}
            />
          );
        })}

        {/* Total rewards preview */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total daily rewards</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalChip}>
              <Text style={styles.totalChipText}>⚡ 150 XP</Text>
            </View>
            <View style={styles.totalChip}>
              <Text style={styles.totalChipText}>🪙 40 Coins</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingHorizontal: SPACING.screenPadding, paddingBottom: SPACING.xl, gap: SPACING.sm },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold },
  headerMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  metaText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  body: { paddingHorizontal: SPACING.screenPadding, paddingTop: SPACING.base, paddingBottom: SPACING['3xl'], gap: SPACING.md },
  allDoneBanner: {
    borderRadius: RADIUS.xl, padding: SPACING.base,
    alignItems: 'center',
    borderWidth: 1, borderColor: `${COLORS.success}30`,
  },
  allDoneText: { color: COLORS.success, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  totalCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  totalLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  totalRow: { flexDirection: 'row', gap: SPACING.sm },
  totalChip: {
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderWidth: 1, borderColor: `${COLORS.primary}30`,
  },
  totalChipText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
});
