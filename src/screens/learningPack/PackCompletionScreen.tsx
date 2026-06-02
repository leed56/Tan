import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGamificationStore } from '../../store/gamificationStore';
import { getXpProgressPercent, getRandomMotivation } from '../../utils';
import { MOTIVATIONAL_MESSAGES } from '../../constants';

type Props = StackScreenProps<HomeStackParamList, 'PackCompletion'>;

export function PackCompletionScreen({ navigation, route }: Props) {
  const { xpEarned, packTitle, streakDays } = route.params;
  const { xp, level, streak, addXp } = useGamificationStore();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const message = getRandomMotivation(MOTIVATIONAL_MESSAGES);
  const levelProgress = getXpProgressPercent(xp + xpEarned);

  useEffect(() => {
    // Award XP on mount
    addXp(xpEarned);

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(confettiAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [addXp, xpEarned, scaleAnim, fadeAnim, confettiAnim]);

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.root}>
      {/* Close button */}
      <TouchableOpacity
        onPress={() => navigation.popToTop()}
        style={styles.closeBtn}
      >
        <Ionicons name="close" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Trophy */}
        <Animated.View style={[styles.trophyContainer, { transform: [{ scale: scaleAnim }] }]}>
          {/* TODO: Phase 2 — replace with Lottie confetti animation */}
          <LinearGradient
            colors={GRADIENTS.gold}
            style={styles.trophyCircle}
          >
            <Text style={styles.trophyEmoji}>🏆</Text>
          </LinearGradient>

          {/* Decorative stars */}
          <Animated.View style={[styles.star, styles.star1, { opacity: confettiAnim }]}>
            <Text style={{ fontSize: 20 }}>⭐</Text>
          </Animated.View>
          <Animated.View style={[styles.star, styles.star2, { opacity: confettiAnim }]}>
            <Text style={{ fontSize: 16 }}>✨</Text>
          </Animated.View>
          <Animated.View style={[styles.star, styles.star3, { opacity: confettiAnim }]}>
            <Text style={{ fontSize: 18 }}>🌟</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.textBlock, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Pack Complete!</Text>
          <Text style={styles.packName}>{packTitle}</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>

        {/* Stats cards */}
        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
          {/* XP earned */}
          <LinearGradient colors={GRADIENTS.primary} style={styles.statCard}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statValue}>+{xpEarned}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </LinearGradient>

          {/* Streak */}
          <LinearGradient
            colors={['rgba(255,140,66,0.3)', 'rgba(255,140,66,0.1)']}
            style={styles.statCard}
          >
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statValue, { color: '#FF8C42' }]}>{streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </LinearGradient>

          {/* Level progress */}
          <LinearGradient
            colors={['rgba(247,197,46,0.3)', 'rgba(247,197,46,0.1)']}
            style={styles.statCard}
          >
            <Text style={styles.statEmoji}>📈</Text>
            <Text style={[styles.statValue, { color: COLORS.gold }]}>Lvl {level}</Text>
            <Text style={styles.statLabel}>{levelProgress}% full</Text>
          </LinearGradient>
        </Animated.View>

        {/* Level progress bar */}
        <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Level Progress</Text>
            <Text style={styles.progressValue}>{levelProgress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${levelProgress}%` }]}
            />
          </View>
        </Animated.View>

        {/* CTAs */}
        <Animated.View style={[styles.ctaBlock, { opacity: fadeAnim }]}>
          <AppButton
            title="Continue Learning"
            onPress={() => navigation.popToTop()}
            variant="primary"
          />
          <AppButton
            title="Share my achievement"
            onPress={() => {
              // TODO: Phase 2 — implement share sheet
            }}
            variant="secondary"
            icon={<Ionicons name="share-social-outline" size={18} color={COLORS.primary} />}
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: SPACING['3xl'],
    right: SPACING.screenPadding,
    zIndex: 10,
    padding: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING['5xl'],
    alignItems: 'center',
    gap: SPACING.xl,
    paddingBottom: SPACING['2xl'],
  },
  trophyContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  trophyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  trophyEmoji: { fontSize: 64 },
  star: { position: 'absolute' },
  star1: { top: -20, right: -10 },
  star2: { bottom: -10, right: -20 },
  star3: { top: 0, left: -30 },
  textBlock: { alignItems: 'center', gap: SPACING.sm },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  packName: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
  },
  message: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  statEmoji: { fontSize: 24 },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  statLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, textAlign: 'center' },
  progressSection: { width: '100%', gap: SPACING.sm },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  progressValue: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  progressTrack: {
    height: 10, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  progressFill: { height: 10, borderRadius: RADIUS.full, minWidth: 10 },
  ctaBlock: { width: '100%', gap: SPACING.sm, marginTop: 'auto' },
});
