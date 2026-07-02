import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { RewardBoxCard } from '../../components/ui/gamification/RewardBoxCard';
import { CoinBalanceChip } from '../../components/ui/gamification/CoinBalanceChip';
import { useRewardsStore } from '../../store/rewardsStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { useGamificationStore } from '../../store/gamificationStore';
import type { RewardBox } from '../../types/gamification';

type Props = StackScreenProps<HomeStackParamList, 'Rewards'>;

const WEEKLY_STREAK_REQUIREMENT = 7;
const EPIC_STREAK_REQUIREMENT = 30;

function buildRewardBoxes(streak: number): RewardBox[] {
  return [
    { id: 'daily_box', label: 'Daily Box', coinsMin: 5, coinsMax: 15, xpBonus: 10, rarity: 'common', isAvailable: true },
    {
      id: 'weekly_box', label: 'Weekly Box', coinsMin: 20, coinsMax: 50, xpBonus: 50, rarity: 'rare',
      isAvailable: streak >= WEEKLY_STREAK_REQUIREMENT,
      unlockHint: `Unlocks at a ${WEEKLY_STREAK_REQUIREMENT}-day streak`,
    },
    {
      id: 'epic_box', label: 'Epic Box', coinsMin: 80, coinsMax: 150, xpBonus: 100, rarity: 'epic',
      isAvailable: streak >= EPIC_STREAK_REQUIREMENT,
      unlockHint: `Unlocks at a ${EPIC_STREAK_REQUIREMENT}-day streak`,
    },
  ];
}

const SHOP_ITEMS = [
  { id: 'xp_boost', label: 'XP Boost 2×', desc: '2× XP for 30 minutes', cost: 50, icon: 'flash' },
  { id: 'streak_shield', label: 'Streak Shield', desc: 'Protect your streak for 1 day', cost: 30, icon: 'shield' },
  { id: 'hint_pack', label: 'Hint Pack ×5', desc: '5 hints for FIB questions', cost: 20, icon: 'bulb' },
];

export function RewardsScreen({ navigation }: Props) {
  const { coins, streak, addCoins, addXp } = useGamificationStore();
  // Claims persist across mounts and are keyed per box cooldown period
  // (daily box per day, weekly/epic per week) — see rewardsStore.
  const isClaimed = useRewardsStore((s) => s.isClaimed);
  const markClaimed = useRewardsStore((s) => s.markClaimed);
  const claimed = useRewardsStore((s) => s.claimed); // subscribe for re-render
  void claimed;
  const rewardBoxes = buildRewardBoxes(streak);

  const handleOpen = (box: RewardBox) => {
    if (isClaimed(box.id)) return;
    markClaimed(box.id);
    const earnedCoins = box.coinsMin + Math.floor(Math.random() * (box.coinsMax - box.coinsMin));
    addCoins(earnedCoins);
    if (box.xpBonus > 0) addXp(box.xpBonus);
    Alert.alert('🎉 Reward Opened!', `You earned ${earnedCoins} coins${box.xpBonus > 0 ? ` and +${box.xpBonus} XP` : ''}!`);
  };

  return (
    <ScreenContainer padded={false}>
      <LinearGradient colors={[`${COLORS.gold}20`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>Gamification</Text>
            <Text style={styles.headerTitle}>Rewards</Text>
          </View>
          <CoinBalanceChip coins={coins} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Reward Boxes */}
        <Text style={styles.sectionLabel}>Reward Boxes</Text>
        <View style={styles.boxGrid}>
          {rewardBoxes.map((box) => (
            <View key={box.id} style={styles.boxItem}>
              <RewardBoxCard
                box={{ ...box, isAvailable: box.isAvailable && !isClaimed(box.id) }}
                onOpen={() => handleOpen(box)}
              />
            </View>
          ))}
        </View>

        {/* Coming soon shop */}
        <Text style={styles.sectionLabel}>Coin Shop</Text>
        <View style={styles.comingSoon}>
          <Ionicons name="construct-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.comingSoonTitle}>Shop Coming Soon</Text>
          <Text style={styles.comingSoonDesc}>
            Spend your coins on XP boosts, streak shields, and more. Save up!
          </Text>
          <View style={styles.previewGrid}>
            {SHOP_ITEMS.map((item) => (
              <View key={item.id} style={styles.shopPreview}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={COLORS.textMuted} />
                <Text style={styles.shopPreviewLabel}>{item.label}</Text>
                <Text style={styles.shopPreviewCost}>🪙 {item.cost}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: SPACING['2xl'], paddingHorizontal: SPACING.screenPadding, paddingBottom: SPACING.xl, gap: SPACING.sm },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold },
  body: { paddingHorizontal: SPACING.screenPadding, paddingTop: SPACING.base, paddingBottom: SPACING['3xl'], gap: SPACING.md },
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: SPACING.sm,
  },
  boxGrid: { flexDirection: 'row', gap: SPACING.sm },
  boxItem: { flex: 1 },
  comingSoon: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  comingSoonTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  comingSoonDesc: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center', lineHeight: TYPOGRAPHY.sizes.sm * 1.5 },
  previewGrid: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  shopPreview: {
    alignItems: 'center', gap: 4,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '30%',
    opacity: 0.5,
  },
  shopPreviewLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, textAlign: 'center' },
  shopPreviewCost: { color: COLORS.textMuted, fontSize: 10 },
});
