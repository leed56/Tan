import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
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
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { SUBJECT_COUNT, FORM_COUNT } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.screenPadding * 2;
const AUTO_ADVANCE_MS = 4200;

type Props = StackScreenProps<AuthStackParamList, 'Welcome'>;

const BENEFITS = [
  {
    icon: 'sparkles' as const,
    title: 'Clear explanations',
    description: 'Understand every answer step by step with simple, exam-ready guidance.',
    colors: ['#8B5CF6', '#6366F1', '#22D3EE'],
  },
  {
    icon: 'trophy' as const,
    title: 'Progress that motivates',
    description: 'Earn XP, unlock badges, build streaks, and keep improving every day.',
    colors: ['#FBBF24', '#F59E0B', '#FB7185'],
  },
  {
    icon: 'library' as const,
    title: 'NECTA-ready practice',
    description: `${SUBJECT_COUNT} subjects for Form 1–4 with MCQ, True/False, Fill-in-Blank, and higher-order questions.`,
    colors: ['#14B8A6', '#06B6D4', '#3B82F6'],
  },
];

const STATS = [
  { icon: 'book-outline' as const, value: String(SUBJECT_COUNT), label: 'Subjects' },
  { icon: 'layers-outline' as const, value: String(FORM_COUNT), label: 'Forms' },
  { icon: 'gift-outline' as const, value: 'Free', label: 'To start' },
];

export function WelcomeScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [signingIn, setSigningIn] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { signInWithGoogle, error } = useAuth();

  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(110, [
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 620,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 620,
        useNativeDriver: true,
      }),
      Animated.timing(ctaAnim, {
        toValue: 1,
        duration: 620,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [heroAnim, cardAnim, ctaAnim, floatAnim, glowAnim]);

  const restartAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);

    autoAdvanceTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % BENEFITS.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);
  }, []);

  useEffect(() => {
    restartAutoAdvance();

    return () => {
      if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);
    };
  }, [restartAutoAdvance]);

  const handleGoogle = async () => {
    setSigningIn(true);

    try {
      const { isNewUser } = await signInWithGoogle();
      if (isNewUser) navigation.navigate('CreateProfile');
    } finally {
      setSigningIn(false);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
    restartAutoAdvance();
  };

  const handleDotPress = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
    restartAutoAdvance();
  };

  const floatingY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.14],
  });

  return (
    <LinearGradient
      colors={['#030712', '#07111F', '#10163A', '#071B36']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <StatusBar style="light" />

      <View style={styles.auroraOne} />
      <View style={styles.auroraTwo} />
      <View style={styles.auroraThree} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <Animated.View style={[styles.header, fadeUp(heroAnim)]}>
            <View style={styles.logoWrap}>
              <LinearGradient
                colors={['#A78BFA', '#6366F1', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <Text style={styles.logoText}>S</Text>
              </LinearGradient>
            </View>

            <Text style={styles.brand}>Soma</Text>

            <View style={styles.headerBadge}>
              <Ionicons name="star" size={12} color="#FDE68A" />
              <Text style={styles.headerBadgeText}>Premium learning</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.hero, fadeUp(heroAnim)]}>
            <Animated.View
              style={[
                styles.heroGlow,
                {
                  transform: [{ scale: glowScale }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.heroIllustration,
                {
                  transform: [{ translateY: floatingY }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.08)']}
                style={styles.heroGlass}
              >
                <View style={styles.bookCard}>
                  <Ionicons name="school" size={34} color="#FFFFFF" />
                </View>

                <View style={styles.miniCardTop}>
                  <Ionicons name="checkmark-circle" size={18} color="#86EFAC" />
                  <Text style={styles.miniCardText}>Exam ready</Text>
                </View>

                <View style={styles.miniCardBottom}>
                  <Text style={styles.scoreText}>98%</Text>
                  <Text style={styles.scoreLabel}>Progress</Text>
                </View>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.headline}>
              Master O-Level{'\n'}with confidence
            </Text>

            <Text style={styles.subheadline}>
              A clean, focused learning app built for Tanzania Form 1–4 students preparing for NECTA.
            </Text>
          </Animated.View>

          <Animated.View style={[styles.statsRow, fadeUp(cardAnim)]}>
            {STATS.map((stat, index) => (
              <React.Fragment key={stat.label}>
                {index > 0 && <View style={styles.statDivider} />}

                <View style={styles.statItem}>
                  <Ionicons name={stat.icon} size={16} color="#FDE68A" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </Animated.View>

          <Animated.View style={fadeUp(cardAnim)}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              style={styles.carousel}
            >
              {BENEFITS.map((benefit, index) => (
                <View key={benefit.title} style={styles.slide}>
                  <LinearGradient
                    colors={benefit.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    <View style={styles.cardOverlay} />

                    <View style={styles.cardIcon}>
                      <Ionicons name={benefit.icon} size={28} color="#FFFFFF" />
                    </View>

                    <View style={styles.cardTextWrap}>
                      <Text style={styles.cardEyebrow}>Feature {index + 1}</Text>
                      <Text style={styles.cardTitle}>{benefit.title}</Text>
                      <Text style={styles.cardDesc}>{benefit.description}</Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </ScrollView>

            <View style={styles.dots}>
              {BENEFITS.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDotPress(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={[styles.dot, activeIndex === index && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View style={[styles.ctas, fadeUp(ctaAnim)]}>
            <AppButton
              title={signingIn ? 'Signing in…' : 'Continue with Google'}
              onPress={handleGoogle}
              loading={signingIn}
              variant="primary"
              icon={<Ionicons name="logo-google" size={18} color={COLORS.textPrimary} />}
            />

            <Text style={styles.ctaHint}>
              Start free. Your progress stays safely connected to your account.
            </Text>

            {error ? <Text style={styles.ctaError}>{error}</Text> : null}
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function fadeUp(anim: Animated.Value) {
  return {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },

  auroraOne: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    backgroundColor: 'rgba(99,102,241,0.24)',
    top: -width * 0.55,
    left: -width * 0.38,
  },

  auroraTwo: {
    position: 'absolute',
    width: width * 0.95,
    height: width * 0.95,
    borderRadius: width,
    backgroundColor: 'rgba(6,182,212,0.16)',
    top: height * 0.18,
    right: -width * 0.45,
  },

  auroraThree: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width,
    backgroundColor: 'rgba(251,191,36,0.1)',
    bottom: -width * 0.45,
    left: -width * 0.35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  logoWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    padding: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  logo: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },

  brand: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  headerBadgeText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
  },

  hero: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  heroGlow: {
    position: 'absolute',
    top: 10,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(124,58,237,0.28)',
  },

  heroIllustration: {
    width: 168,
    height: 168,
    marginBottom: SPACING.lg,
  },

  heroGlass: {
    flex: 1,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 18,
  },

  bookCard: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  miniCardTop: {
    position: 'absolute',
    top: 18,
    right: -18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  miniCardText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  miniCardBottom: {
    position: 'absolute',
    left: -16,
    bottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  scoreText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  scoreLabel: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 10,
    fontWeight: '700',
  },

  headline: {
    color: '#FFFFFF',
    fontSize: width < 380 ? 36 : 42,
    lineHeight: width < 380 ? 42 : 48,
    fontWeight: '900',
    letterSpacing: -1.8,
    textAlign: 'center',
  },

  subheadline: {
    marginTop: SPACING.sm,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 330,
  },

  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },

  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  statLabel: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 11,
    fontWeight: '700',
  },

  carousel: {
    marginHorizontal: -SPACING.screenPadding,
    flexGrow: 0,
  },

  slide: {
    width,
    paddingHorizontal: SPACING.screenPadding,
  },

  card: {
    width: CARD_WIDTH,
    minHeight: 178,
    borderRadius: 32,
    padding: SPACING.lg,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.26,
    shadowRadius: 24,
    elevation: 14,
  },

  cardOverlay: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: SPACING.md,
  },

  cardTextWrap: {
    gap: 6,
  },

  cardEyebrow: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  cardDesc: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },

  dotActive: {
    width: 28,
    backgroundColor: '#FFFFFF',
  },

  ctas: {
    marginTop: 'auto',
    gap: SPACING.sm,
  },

  ctaHint: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
  },

  ctaError: {
    color: COLORS.error,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },

});
