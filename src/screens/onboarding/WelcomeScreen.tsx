import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { SUBJECT_COUNT, FORM_COUNT } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { useProfileStore } from '../../store/profileStore';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<AuthStackParamList, 'Welcome'>;

const BENEFITS = [
  {
    emoji: '🤖',
    title: 'AI-Powered Learning',
    description: 'Get instant AI explanations for every question. Understand the "why", not just the answer.',
    gradient: ['#7B6FF2', '#5A50CC'] as string[],
  },
  {
    emoji: '🏆',
    title: 'Gamified Progress',
    description: 'Earn XP, unlock badges, and climb the national leaderboard. Make studying addictive.',
    gradient: ['#F7C52E', '#D4A017'] as string[],
  },
  {
    emoji: '📚',
    title: 'Full NECTA Curriculum',
    description: `${SUBJECT_COUNT} subjects covering all Form 1–4 topics. MCQ, True/False, Fill-in-Blank, and Higher Order questions.`,
    gradient: ['#4ECDC4', '#2EAF9F'] as string[],
  },
];

export function WelcomeScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [signingIn, setSigningIn] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { enterTestMode, signInWithGoogle, error } = useAuth();
  const setProfile = useProfileStore((s) => s.setProfile);

  // Google is the real sign-in. New users continue to Create Profile; returning
  // users (profile already hydrated by the hook) fall through to the app via
  // RootNavigator's isOnboarded check.
  const handleGoogle = async () => {
    setSigningIn(true);
    try {
      const { isNewUser } = await signInWithGoogle();
      if (isNewUser) navigation.navigate('CreateProfile');
    } catch {
      // error surfaced via the auth store; popup-close is silently ignored.
    } finally {
      setSigningIn(false);
    }
  };

  // __DEV__-only: skip phone OTP and onboarding entirely — sets a complete
  // auth session + profile in one tap so RootNavigator's isOnboarded check
  // flips true immediately and lands straight in the main app, where the
  // floating flask button opens the Dev Test Menu (every screen, one tap).
  const handleEnterTestMode = async () => {
    await enterTestMode();
    const now = Date.now();
    setProfile({
      uid: 'demo_user_001',
      name: 'Test Student',
      form: 4,
      school: 'Dev Test School',
      avatarId: 'avatar_1',
      selectedSubjectIds: ['mathematics', 'biology', 'english'],
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleDotPress = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
    setActiveIndex(i);
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoMini}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.logoMiniGrad}>
              <Text style={styles.logoEmoji}>🧠</Text>
            </LinearGradient>
          </View>
          <Text style={styles.brand}>Soma</Text>
        </View>

        {/* Headline */}
        <View style={styles.headline}>
          <Text style={styles.headlineText}>Tanzania's Smartest{'\n'}O-Level Tutor</Text>
          <Text style={styles.subheadline}>Built for Form 1–4 students to pass NECTA</Text>
        </View>

        {/* Benefits Carousel */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.carousel}
        >
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={[styles.card, { width }]}>
              <LinearGradient
                colors={[...benefit.gradient, `${benefit.gradient[0]}80`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardInner}
              >
                <Text style={styles.cardEmoji}>{benefit.emoji}</Text>
                <Text style={styles.cardTitle}>{benefit.title}</Text>
                <Text style={styles.cardDesc}>{benefit.description}</Text>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dots}>
          {BENEFITS.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => handleDotPress(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { value: String(SUBJECT_COUNT), label: 'Subjects' },
            { value: String(FORM_COUNT), label: 'Forms' },
            { value: 'Free', label: 'To Start' },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctas}>
          <AppButton
            title={signingIn ? 'Signing in…' : 'Continue with Google'}
            onPress={handleGoogle}
            loading={signingIn}
            variant="primary"
            icon={<Ionicons name="logo-google" size={18} color={COLORS.textPrimary} />}
          />
          <Text style={styles.ctaHint}>
            Sign in with your Google account to start learning — it's free.
          </Text>
          {error ? <Text style={styles.ctaError}>{error}</Text> : null}
          {__DEV__ && (
            <TouchableOpacity onPress={handleEnterTestMode} style={styles.devTestBtn}>
              <Text style={styles.devTestBtnText}>🧪 Enter Test Mode (no login, dev only)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  logoMini: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  logoMiniGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: { fontSize: 20 },
  brand: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  headline: { marginBottom: SPACING.xl, gap: SPACING.sm },
  headlineText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['3xl'] * 1.2,
  },
  subheadline: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.5,
  },
  carousel: {
    marginHorizontal: -SPACING.screenPadding,
    flexGrow: 0,
  },
  card: {
    paddingHorizontal: SPACING.screenPadding,
  },
  cardInner: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    minHeight: 180,
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 44 },
  cardTitle: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.6,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.base,
    marginBottom: SPACING.base,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textDisabled,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    marginBottom: SPACING.xl,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.glassBorder },
  statValue: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  ctas: { gap: SPACING.sm },
  ctaHint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  ctaError: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  devTestBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  devTestBtnText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
