import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { BadgeCard } from '../../components/ui/gamification/BadgeCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGamificationStore } from '../../store/gamificationStore';

type Props = StackScreenProps<HomeStackParamList, 'Badges'>;

export function BadgesScreen({ navigation }: Props) {
  const { badges, earnedBadgeIds } = useGamificationStore();
  const earned = badges.filter((b) => earnedBadgeIds.includes(b.id));
  const locked = badges.filter((b) => !earnedBadgeIds.includes(b.id));

  return (
    <ScreenContainer padded={false}>
      <LinearGradient colors={[`${COLORS.gold}18`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Achievements</Text>
        <Text style={styles.headerTitle}>Your Badges</Text>
        <View style={styles.progress}>
          <Text style={styles.progressText}>{earned.length} / {badges.length} earned</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(earned.length / Math.max(badges.length, 1)) * 100}%` as any }]} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {earned.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Earned ({earned.length})</Text>
            <View style={styles.grid}>
              {earned.map((b) => (
                <View key={b.id} style={styles.gridItem}>
                  <BadgeCard badge={b} earned />
                </View>
              ))}
            </View>
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Locked ({locked.length})</Text>
            <View style={styles.grid}>
              {locked.map((b) => (
                <View key={b.id} style={styles.gridItem}>
                  <BadgeCard badge={b} earned={false} />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingHorizontal: SPACING.screenPadding, paddingBottom: SPACING.xl, gap: SPACING.sm },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold },
  progress: { gap: 4 },
  progressText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.full, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: COLORS.gold, borderRadius: RADIUS.full, minWidth: 4 },
  body: { paddingHorizontal: SPACING.screenPadding, paddingTop: SPACING.base, paddingBottom: SPACING['3xl'], gap: SPACING.md },
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: SPACING.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  gridItem: { width: '47%' },
});
