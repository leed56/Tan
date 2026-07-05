import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
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

type Props = StackScreenProps<AuthStackParamList, 'Welcome'>;

const BENEFITS = [
  {
    icon: 'sparkles' as keyof typeof Ionicons.glyphMap,
    title: 'AI-Powered Learning',
    description: 'Instant explanations help students understand every answer clearly, not just memorize it.',
    gradient: ['#7B6FF2', '#5A50CC'] as string[],
  },
  {
    icon: 'trophy' as keyof typeof Ionicons.glyphMap,
    title: 'Gamified Progress',
    description: 'Earn XP, unlock badges, build streaks, and stay motivated every day.',
    gradient: ['#F7C52E', '#D4A017'] as string[],
  },
  {
    icon: 'library' as keyof typeof Ionicons.glyphMap,
    title: 'Full NECTA Curriculum',
    description: `${SUBJECT_COUNT} subjects for Form 1–4 with MCQ, True/False, Fill-in-Blank, and Higher Order practice.`,
    gradient: ['#4ECDC4', '#2EAF9F'] as string[],
  },
];

export function WelcomeScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { width, height } = useWindowDimensions();

  const pageWidth = Math.min(width, 760);
  const horizontalPadding = width < 390 ? SPACING.base : SPACING.screenPadding;
  const cardWidth = Math.min(width - horizontalPadding * 2, 640);
  const carouselGap = SPACING.md;
  const snapInterval = cardWidth + carouselGap;
  const isShortScreen = height < 720;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
    setActiveIndex(Math.max(0, Math.min(index, BENEFITS.length - 1)));
  };

  const handleDotPress = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * snapInterval, animated: true });
    setActiveIndex(i);
  };

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, { maxWidth: pageWidth, paddingHorizontal: horizontalPadding }]}>
            {/* Header */}
            <View style={[styles.header, isShortScreen && styles.headerCompact]}>
              <View style={styles.logoMini}>
                <LinearGradient colors={GRADIENTS.primary} style={styles.logoMiniGrad}>
                  <Text style={styles.logoEmoji}>🧠</Text>
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.brand}>Soma AI</Text>
                <Text style={styles.brandSub}>Smart exam preparation</Text>
              </View>
            </View>

            {/* Headline */}
            <View style={[styles.headline, isShortScreen && styles.headlineCompact]}>
              <Text style={[styles.eyebrow, { color: COLORS.gold }]}>Built for Tanzania O-Level</Text>
              <Text style={[styles.headlineText, width < 390 && styles.headlineTextSmall]}>
                Tanzania's Smartest{width < 430 ? '\n' : ' '}O-Level Tutor
              </Text>
              <Text style={styles.subheadline}>Master Form 1–4 NECTA subjects with guided practice, rewards, and AI support.</Text>
            </View>

            {/* Benefits Carousel */}
            <View style={styles.carouselWrap}>
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                decelerationRate="fast"
                snapToInterval={snapInterval}
                snapToAlignment="start"
                style={[styles.carousel, { width: cardWidth }]}
                contentContainerStyle={styles.carouselContent}
              >
                {BENEFITS.map((benefit, index) => (
                  <View
                    key={benefit.title}
                    style={[
                      styles.card,
                      {
                        width: cardWidth,
                        marginRight: index === BENEFITS.length - 1 ? 0 : carouselGap,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[...benefit.gradient, `${benefit.gradient[0]}80`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.cardInner, isShortScreen && styles.cardInnerCompact]}
                    >
                      <View style={styles.cardIconCircle}>
                        <Ionicons name={benefit.icon} size={34} color="#fff" />
                      </View>
                      <View style={styles.cardCopy}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{benefit.title}</Text>
                        <Text style={styles.cardDesc}>{benefit.description}</Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Dots */}
            <View style={styles.dots}>
              {BENEFITS.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleDotPress(i)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Show welcome slide ${i + 1}`}
                  accessibilityState={{ selected: i === activeIndex }}
                >
                  <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {[
                { value: String(SUBJECT_COUNT), label: 'Subjects', icon: 'book-outline' as keyof typeof Ionicons.glyphMap },
                { value: String(FORM_COUNT), label: 'Forms', icon: 'layers-outline' as keyof typeof Ionicons.glyphMap },
                { value: 'Free', label: 'To Start', icon: 'gift-outline' as keyof typeof Ionicons.glyphMap },
              ].map((stat, i) => (
                <React.Fragment key={stat.label}>
                  {i > 0 && <View style={styles.statDivider} />}
                  <View style={styles.statItem}>
                    <Ionicons name={stat.icon} size={18} color={COLORS.gold} />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* CTAs */}
            <View style={styles.ctaPanel}>
              <AppButton
                title="Start Learning — It's Free"
                onPress={() => navigation.navigate('OTPLogin')}
                variant="primary"
              />
              <TouchableOpacity
                onPress={() => navigation.navigate('OTPLogin')}
                style={styles.secondaryCta}
                accessibilityRole="button"
                accessibilityLabel="I already have an account"
              >
                <Text style={styles.secondaryCtaText}>I already have an account</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primaryLight} />
              </TouchableOpacity>
              <Text style={styles.ctaHint}>No payment needed to start. Upgrade later only if you want premium packs.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: COLORS.bgDark,
  },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  container: {
    width: '100%',
    flexGrow: 1,
    alignSelf: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  headerCompact: { marginBottom: SPACING.base },
  logoMini: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  logoMiniGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: { fontSize: 26 },
  brand: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.1,
  },
  brandSub: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  headline: { marginBottom: SPACING.xl, gap: SPACING.sm },
  headlineCompact: { marginBottom: SPACING.base },
  eyebrow: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headlineText: {
    color: COLORS.textPrimary,
    fontSize: 42,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  headlineTextSmall: {
    fontSize: 36,
    lineHeight: 42,
  },
  subheadline: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.55,
    maxWidth: 620,
  },
  carouselWrap: {
    alignItems: 'center',
    overflow: 'visible',
  },
  carousel: {
    flexGrow: 0,
    overflow: 'visible',
  },
  carouselContent: {
    alignItems: 'stretch',
  },
  card: {
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
  },
  cardInner: {
    borderRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    minHeight: 218,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  cardInnerCompact: { minHeight: 198, padding: SPACING.lg },
  cardIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCopy: { gap: SPACING.sm },
  cardTitle: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.15,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.55,
    flexShrink: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 28,
    backgroundColor: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28,35,71,0.86)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.base,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 5 },
  statDivider: { width: 1, backgroundColor: COLORS.glassBorder, marginVertical: SPACING.sm },
  statValue: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.05,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  ctaPanel: {
    gap: SPACING.md,
    paddingTop: SPACING.base,
  },
  secondaryCta: {
    minHeight: 48,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}55`,
    backgroundColor: 'rgba(123,111,242,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  secondaryCtaText: {
    color: COLORS.primaryLight,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  ctaHint: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: TYPOGRAPHY.sizes.xs * 1.55,
  },
});