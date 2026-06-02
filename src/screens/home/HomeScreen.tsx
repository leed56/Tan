import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SubjectCard } from '../../components/ui/SubjectCard';
import { StreakFireCard } from '../../components/ui/gamification/StreakFireCard';
import { CoinBalanceChip } from '../../components/ui/gamification/CoinBalanceChip';
import { PremiumLockCard } from '../../components/ui/PremiumLockCard';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGamificationStore } from '../../store/gamificationStore';
import { useProfileStore } from '../../store/profileStore';
import { SUBJECTS, DEMO_LEADERBOARD, AVATARS } from '../../constants';
import { getGreeting, formatXp, getXpProgressPercent } from '../../utils';

const { width } = Dimensions.get('window');
const RING_SIZE = 120;
const RING_STROKE = 12;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

type Props = StackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const { xp, level, streak, coins } = useGamificationStore();
  const profile = useProfileStore((s) => s.profile);

  const progressPercent = getXpProgressPercent(xp);
  const strokeDash = RING_CIRCUMFERENCE * (1 - progressPercent / 100);

  const greeting = getGreeting();
  const name = profile?.name ?? 'Student';
  const recommended = SUBJECTS.filter((s) => !s.isPremium).slice(0, 4);
  const topPlayers = DEMO_LEADERBOARD.slice(0, 3);

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Phase 2 — re-fetch user data from Firestore
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <ScreenContainer scrollable padded={false} onRefresh={handleRefresh} refreshing={refreshing}>
      {/* Header */}
      <LinearGradient
        colors={['#1C2347', '#131936']}
        style={styles.topBar}
      >
        <View style={styles.topBarContent}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{name} 👋</Text>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <CoinBalanceChip
              coins={coins}
              onPress={() => navigation.navigate('GamificationProfile')}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Hero card — XP ring + streak */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('GamificationProfile')}
        >
        <LinearGradient
          colors={['#2A1F6B', '#1C2347']}
          style={styles.heroCard}
        >
          <View style={styles.heroLeft}>
            {/* Circular XP ring */}
            <View style={styles.ringWrapper}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_R}
                  stroke={COLORS.bgCardLight}
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_R}
                  stroke={COLORS.primary}
                  strokeWidth={RING_STROKE}
                  fill="none"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={strokeDash}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={styles.ringLevel}>Lvl</Text>
                <Text style={styles.ringLevelNum}>{level}</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroRight}>
            <Text style={styles.heroXpLabel}>Total XP</Text>
            <Text style={styles.heroXp}>{formatXp(xp)}</Text>
            <Text style={styles.heroXpSub}>{progressPercent}% to Level {level + 1}</Text>

            <View style={styles.heroDivider} />

            <View style={styles.heroMission}>
              <Ionicons name="flag" size={14} color={COLORS.gold} />
              <Text style={styles.heroMissionText}>Daily Mission: 3/5 packs</Text>
            </View>
          </View>
        </LinearGradient>
        </TouchableOpacity>

        {/* Streak card */}
        <StreakFireCard streak={streak} />

        {/* Continue Learning */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Topics', { subjectId: 'mathematics', subjectName: 'Mathematics', color: COLORS.subjects.mathematics })}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.continueCard}
            onPress={() =>
              navigation.navigate('LearningPackDetail', {
                packId: 'pack_001',
                packTitle: 'Quadratic Equations',
                topicId: 'topic_001',
                subjectColor: COLORS.subjects.mathematics,
              })
            }
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.subjects.mathematics + '30', COLORS.bgCard]}
              style={styles.continueCardGrad}
            >
              <View style={[styles.continueIcon, { backgroundColor: COLORS.subjects.mathematics + '20' }]}>
                <Ionicons name="calculator" size={24} color={COLORS.subjects.mathematics} />
              </View>
              <View style={styles.continueInfo}>
                <Text style={styles.continueSubject}>Mathematics</Text>
                <Text style={styles.continueTopic}>Quadratic Equations</Text>
                <View style={styles.continueProgress}>
                  <View style={styles.continueTrack}>
                    <View style={[styles.continueFill, { width: '60%', backgroundColor: COLORS.subjects.mathematics }]} />
                  </View>
                  <Text style={styles.continuePercent}>60%</Text>
                </View>
              </View>
              <Ionicons name="play-circle" size={36} color={COLORS.subjects.mathematics} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Daily Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Mission</Text>
          <LinearGradient
            colors={['rgba(247,197,46,0.12)', 'rgba(247,197,46,0.04)']}
            style={styles.missionCard}
          >
            <View style={styles.missionHeader}>
              <Text style={styles.missionEmoji}>⚡</Text>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>Complete 5 learning packs</Text>
                <Text style={styles.missionReward}>+150 XP reward</Text>
              </View>
              <View style={styles.missionProgress}>
                <Text style={styles.missionCount}>3/5</Text>
              </View>
            </View>
            <View style={styles.missionTrack}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[styles.missionStep, i < 3 && styles.missionStepDone]}
                />
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Recommended Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.subjectList}>
            {recommended.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onPress={(s) =>
                  navigation.navigate('Topics', {
                    subjectId: s.id,
                    subjectName: s.name,
                    color: s.color,
                  })
                }
              />
            ))}
          </View>
        </View>

        {/* Leaderboard Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Students</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Full rankings</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.leaderPreview}>
            {topPlayers.map((player, idx) => {
              const avatar = AVATARS.find((a) => a.id === player.avatarId);
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <View key={player.uid} style={styles.leaderRow}>
                  <Text style={styles.leaderMedal}>{medals[idx]}</Text>
                  <View style={styles.leaderAvatar}>
                    <Text style={{ fontSize: 20 }}>{avatar?.emoji ?? '👤'}</Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={styles.leaderName}>{player.name}</Text>
                    <Text style={styles.leaderForm}>Form {player.form}</Text>
                  </View>
                  <Text style={styles.leaderXp}>{formatXp(player.xp)} XP</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Premium Banner */}
        <PremiumLockCard
          title="Unlock Everything"
          description="Get unlimited AI explanations, all 13 subjects, HOQ practice, and priority support."
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingTop: SPACING.base,
    paddingBottom: SPACING.base,
    paddingHorizontal: SPACING.screenPadding,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  userName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.extrabold, marginTop: 2 },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconBtn: { position: 'relative' },
  notifDot: {
    position: 'absolute', top: 0, right: 0,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.bgMid,
  },
  body: { paddingHorizontal: SPACING.screenPadding, paddingTop: SPACING.base, gap: SPACING.sectionGap, paddingBottom: SPACING['2xl'] },
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(123,111,242,0.3)',
  },
  heroLeft: {},
  ringWrapper: { position: 'relative', width: RING_SIZE, height: RING_SIZE, justifyContent: 'center', alignItems: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringLevel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium },
  ringLevelNum: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold, lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.1 },
  heroRight: { flex: 1, gap: 4 },
  heroXpLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium },
  heroXp: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.extrabold, lineHeight: TYPOGRAPHY.sizes['3xl'] * 1.1 },
  heroXpSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  heroDivider: { height: 1, backgroundColor: COLORS.glassBorder, marginVertical: SPACING.sm },
  heroMission: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroMissionText: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium, flexShrink: 1 },
  section: { gap: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  seeAll: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  continueCard: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  continueCardGrad: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.base, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  continueIcon: { width: 48, height: 48, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  continueInfo: { flex: 1, gap: 4 },
  continueSubject: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium },
  continueTopic: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  continueProgress: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  continueTrack: { flex: 1, height: 4, backgroundColor: COLORS.bgCardLight, borderRadius: RADIUS.full, overflow: 'hidden' },
  continueFill: { height: 4, borderRadius: RADIUS.full },
  continuePercent: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, minWidth: 30, textAlign: 'right' },
  missionCard: { borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: 'rgba(247,197,46,0.2)', gap: SPACING.md },
  missionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  missionEmoji: { fontSize: 28 },
  missionInfo: { flex: 1 },
  missionTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  missionReward: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium, marginTop: 2 },
  missionProgress: {},
  missionCount: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.extrabold },
  missionTrack: { flexDirection: 'row', gap: SPACING.sm },
  missionStep: { flex: 1, height: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCardLight },
  missionStepDone: { backgroundColor: COLORS.gold },
  subjectList: { gap: SPACING.sm },
  leaderPreview: { gap: SPACING.sm },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  leaderMedal: { fontSize: 22, minWidth: 28 },
  leaderAvatar: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCardLight, justifyContent: 'center', alignItems: 'center',
  },
  leaderInfo: { flex: 1 },
  leaderName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  leaderForm: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  leaderXp: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
});
