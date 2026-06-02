import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ProfileStackParamList } from '../../types';
import { AchievementBadge } from '../../components/ui/AchievementBadge';
import { XPProgressBar } from '../../components/ui/XPProgressBar';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { AVATARS, DEMO_BADGES } from '../../constants';
import { formatXp } from '../../utils';

type Props = StackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const profile = useProfileStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const { xp, level, streak, coins } = useGamificationStore();

  const avatar = AVATARS.find((a) => a.id === (profile?.avatarId ?? 'avatar_1'));
  const earnedBadges = DEMO_BADGES.filter((b) => b.isEarned);
  const totalBadges = DEMO_BADGES.length;

  // TODO: Phase 2 — fetch real subscription status
  const subscriptionTier = 'free';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero banner */}
      <LinearGradient colors={['#1C2347', '#131936']} style={styles.heroBanner}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.avatarBg}>
            <Text style={styles.avatarEmoji}>{avatar?.emoji ?? '👤'}</Text>
          </LinearGradient>
          <TouchableOpacity style={styles.editAvatarBtn}>
            {/* TODO: Phase 2 — avatar editor */}
            <Ionicons name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Name & info */}
        <Text style={styles.profileName}>{profile?.name ?? 'Student'}</Text>
        <View style={styles.profileMeta}>
          <View style={styles.metaChip}>
            <Ionicons name="school-outline" size={12} color={COLORS.primary} />
            <Text style={styles.metaText}>Form {profile?.form ?? 1}</Text>
          </View>
          {profile?.school && (
            <View style={styles.metaChip}>
              <Ionicons name="business-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{profile.school}</Text>
            </View>
          )}
          <View style={styles.metaChip}>
            <Ionicons name="call-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{user?.phoneNumber ?? 'Unknown'}</Text>
          </View>
        </View>

        {/* Subscription badge */}
        <View style={styles.subBadge}>
          <Ionicons
            name={subscriptionTier === 'free' ? 'ribbon-outline' : 'star'}
            size={14}
            color={subscriptionTier === 'free' ? COLORS.textMuted : COLORS.gold}
          />
          <Text style={[styles.subText, subscriptionTier !== 'free' && { color: COLORS.gold }]}>
            {subscriptionTier === 'free' ? 'Free Plan' : '⭐ Premium'}
          </Text>
        </View>

        {/* Edit button */}
        <TouchableOpacity style={styles.editBtn}>
          {/* TODO: Phase 2 — edit profile screen */}
          <Ionicons name="create-outline" size={16} color={COLORS.primary} />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* XP & Level card */}
      <View style={styles.section}>
        <View style={styles.xpCard}>
          <View style={styles.xpRow}>
            <View style={styles.xpItem}>
              <Text style={styles.xpValue}>{formatXp(xp)}</Text>
              <Text style={styles.xpLabel}>Total XP</Text>
            </View>
            <View style={styles.xpDivider} />
            <View style={styles.xpItem}>
              <Text style={styles.xpValue}>{level}</Text>
              <Text style={styles.xpLabel}>Level</Text>
            </View>
            <View style={styles.xpDivider} />
            <View style={styles.xpItem}>
              <Text style={[styles.xpValue, { color: '#FF8C42' }]}>{streak}</Text>
              <Text style={styles.xpLabel}>Day Streak</Text>
            </View>
            <View style={styles.xpDivider} />
            <View style={styles.xpItem}>
              <Text style={[styles.xpValue, { color: COLORS.gold }]}>{coins}</Text>
              <Text style={styles.xpLabel}>Coins 🪙</Text>
            </View>
          </View>

          <XPProgressBar xp={xp} level={level} />
        </View>
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.sectionSub}>
            {earnedBadges.length} / {totalBadges} earned
          </Text>
        </View>
        <View style={styles.badgesGrid}>
          {DEMO_BADGES.map((badge) => (
            <AchievementBadge
              key={badge.id}
              badge={badge}
              size="md"
              onPress={(b) => {
                // TODO: Phase 2 — show badge detail modal
              }}
            />
          ))}
        </View>
      </View>

      {/* Stats overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.quickStats}>
          {[
            { icon: 'layers-outline', label: 'Packs Done', value: '14', color: COLORS.primary },
            { icon: 'checkmark-circle-outline', label: 'Questions', value: '87', color: COLORS.success },
            { icon: 'trophy-outline', label: 'National Rank', value: '#42', color: COLORS.gold },
            { icon: 'book-outline', label: 'Subjects', value: '3', color: COLORS.secondary },
          ].map((stat) => (
            <View key={stat.label} style={styles.quickStatCard}>
              <Ionicons
                name={stat.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={stat.color}
              />
              <Text style={[styles.quickStatValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.quickStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Premium CTA */}
      {subscriptionTier === 'free' && (
        <LinearGradient
          colors={['rgba(247,197,46,0.15)', 'rgba(247,197,46,0.05)']}
          style={styles.premiumCta}
        >
          <View style={styles.premiumCtaLeft}>
            <Text style={styles.premiumCtaTitle}>Unlock Premium</Text>
            <Text style={styles.premiumCtaDesc}>
              All 13 subjects · AI explanations · HOQ · Priority support
            </Text>
          </View>
          <TouchableOpacity style={styles.premiumCtaBtn}>
            {/* TODO: Phase 2 — navigate to subscription screen */}
            <LinearGradient colors={GRADIENTS.gold} style={styles.premiumCtaBtnGrad}>
              <Text style={styles.premiumCtaBtnText}>Upgrade</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      )}

      <View style={{ height: SPACING['2xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { flexGrow: 1 },
  heroBanner: {
    paddingTop: SPACING['3xl'],
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    position: 'relative',
  },
  settingsBtn: {
    position: 'absolute',
    top: SPACING['2xl'],
    right: SPACING.screenPadding,
    padding: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  avatarWrapper: { position: 'relative', marginBottom: SPACING.sm },
  avatarBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  avatarEmoji: { fontSize: 46 },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgMid,
  },
  profileName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  profileMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  metaText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs },
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  subText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(123,111,242,0.1)',
  },
  editBtnText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  section: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    gap: SPACING.md,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  sectionSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  xpCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.base,
  },
  xpRow: { flexDirection: 'row', alignItems: 'center' },
  xpItem: { flex: 1, alignItems: 'center', gap: 4 },
  xpDivider: { width: 1, height: 40, backgroundColor: COLORS.glassBorder },
  xpValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  xpLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  quickStatValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  quickStatLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  premiumCta: {
    margin: SPACING.screenPadding,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(247,197,46,0.3)',
  },
  premiumCtaLeft: { flex: 1, gap: 4 },
  premiumCtaTitle: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold },
  premiumCtaDesc: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, lineHeight: TYPOGRAPHY.sizes.xs * 1.6 },
  premiumCtaBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  premiumCtaBtnGrad: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm },
  premiumCtaBtnText: { color: '#fff', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
});
