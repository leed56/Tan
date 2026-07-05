import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { SUBJECT_COUNT, FORM_COUNT } from '../../constants';

type Props = StackScreenProps<AuthStackParamList, 'Welcome'>;
type IconName = keyof typeof Ionicons.glyphMap;

type Benefit = {
  icon: IconName;
  title: string;
  description: string;
  badge: string;
  gradient: string[];
};

const BENEFITS: Benefit[] = [
  {
    icon: 'sparkles',
    title: 'AI explanations that make every answer clear',
    description: 'Students learn why an answer is right, fix mistakes faster, and build real exam confidence.',
    badge: 'AI tutor',
    gradient: ['rgba(155,140,249,0.96)', 'rgba(74,144,217,0.9)', 'rgba(10,14,39,0.98)'],
  },
  {
    icon: 'flame',
    title: 'Daily practice that feels motivating, not heavy',
    description: 'XP, streaks, badges, and small wins keep revision moving without overwhelming students.',
    badge: 'Daily wins',
    gradient: ['rgba(247,197,46,0.96)', 'rgba(255,140,66,0.9)', 'rgba(28,35,71,0.98)'],
  },
  {
    icon: 'school',
    title: 'Complete Form 1–4 NECTA revision flow',
    description: `${SUBJECT_COUNT} subjects with MCQ, True/False, Fill-in-Blank, and Higher Order practice.`,
    badge: 'Exam ready',
    gradient: ['rgba(78,205,196,0.95)', 'rgba(46,175,159,0.9)', 'rgba(10,14,39,0.98)'],
  },
];

const STATS = [
  { value: String(SUBJECT_COUNT), label: 'Subjects', helper: 'Full O-Level coverage', icon: 'book-outline' as IconName },
  { value: String(FORM_COUNT), label: 'Forms', helper: 'Form 1 to Form 4', icon: 'layers-outline' as IconName },
  { value: 'Free', label: 'Start', helper: 'No payment to begin', icon: 'gift-outline' as IconName },
];

function useFadeUp(delay = 0) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(value, {
      toValue: 1,
      delay,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, value]);

  return {
    opacity: value,
    transform: [
      {
        translateY: value.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }),
      },
    ],
  };
}

function useFloat(delay = 0) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          delay,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, value]);

  return value;
}

const AmbientBlob = memo(function AmbientBlob({ style, colors, delay }: { style: object; colors: string[]; delay: number }) {
  const value = useFloat(delay);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        style,
        {
          opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.78] }),
          transform: [
            { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
            { scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
          ],
        },
      ]}
    >
      <LinearGradient colors={colors} style={StyleSheet.absoluteFillObject} />
    </Animated.View>
  );
});

const HeroArt = memo(function HeroArt({ compact }: { compact: boolean }) {
  const value = useFloat(250);
  return (
    <Animated.View
      accessible
      accessibilityLabel="Soma AI learning dashboard illustration"
      style={[
        styles.heroArt,
        compact && styles.heroArtCompact,
        { transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }] },
      ]}
    >
      <View style={styles.heroGlow} />
      <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.06)']} style={styles.deviceBorder}>
        <LinearGradient colors={['rgba(10,14,39,0.96)', 'rgba(28,35,71,0.96)']} style={styles.device}>
          <View style={styles.deviceHeader}>
            <View style={styles.deviceLogo}><Text style={styles.deviceLogoText}>S</Text></View>
            <View style={styles.deviceLines}><View style={styles.lineLong} /><View style={styles.lineShort} /></View>
            <View style={styles.xpPill}><Ionicons name="flash" size={13} color={COLORS.bgDark} /><Text style={styles.xpText}>XP</Text></View>
          </View>
          <View style={styles.brainWrap}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.brainCore}><Text style={styles.brain}>🧠</Text></LinearGradient>
            <View style={[styles.floatChip, styles.floatChipTop]}><Ionicons name="checkmark-circle" size={17} color={COLORS.successLight} /><Text style={styles.floatChipText}>Correct</Text></View>
            <View style={[styles.floatChip, styles.floatChipBottom]}><Ionicons name="sparkles" size={17} color={COLORS.gold} /><Text style={styles.floatChipText}>Explain</Text></View>
          </View>
          <View style={styles.progressCard}>
            <View style={styles.progressHead}><Text style={styles.progressTitle}>Today’s focus</Text><Text style={styles.progressValue}>82%</Text></View>
            <View style={styles.progressTrack}><LinearGradient colors={GRADIENTS.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.progressFill} /></View>
          </View>
        </LinearGradient>
      </LinearGradient>
      <View style={[styles.miniCard, styles.miniLeft]}><Ionicons name="trophy" size={17} color={COLORS.gold} /><Text style={styles.miniText}>7 day streak</Text></View>
      <View style={[styles.miniCard, styles.miniRight]}><Ionicons name="school" size={17} color={COLORS.successLight} /><Text style={styles.miniText}>Exam ready</Text></View>
    </Animated.View>
  );
});

const BenefitCard = memo(function BenefitCard({ item, width, marginRight, compact }: { item: Benefit; width: number; marginRight: number; compact: boolean }) {
  return (
    <View style={[styles.cardShadow, { width, marginRight }]}>
      <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}><Ionicons name={item.icon} size={30} color="#fff" /></View>
          <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>{item.badge}</Text></View>
        </View>
        <View style={styles.cardCopy}>
          <Text style={[styles.cardTitle, compact && styles.cardTitleCompact]}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

function PrimaryCTA({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = (toValue: number) => Animated.spring(scale, { toValue, useNativeDriver: true, speed: 24, bounciness: 5 }).start();

  return (
    <Animated.View style={[styles.primaryShadow, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => press(0.975)}
        onPressOut={() => press(1)}
        android_ripple={{ color: 'rgba(255,255,255,0.22)' }}
        accessibilityRole="button"
        accessibilityLabel="Start Learning Free"
        accessibilityHint="Opens sign in to begin learning"
        style={styles.primaryPressable}
      >
        <LinearGradient colors={['#9B8CF9', '#7B6FF2', '#4A90D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryCta}>
          <Text style={styles.primaryText}>Start Learning Free</Text>
          <View style={styles.primaryIcon}><Ionicons name="arrow-forward" size={20} color={COLORS.primaryDark} /></View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export function WelcomeScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 900;
  const isTablet = width >= 700 && width < 900;
  const isCompact = width < 390;
  const isShort = height < 720;
  const sidePadding = isDesktop ? SPACING['3xl'] : isCompact ? SPACING.base : SPACING.screenPadding;
  const maxContent = isDesktop ? 1120 : isTablet ? 760 : 680;
  const usableWidth = Math.min(width - sidePadding * 2, maxContent);
  const gap = isDesktop ? SPACING.lg : SPACING.md;
  const cardWidth = Math.min(usableWidth, isDesktop ? 540 : 640);
  const snap = cardWidth + gap;

  const headerAnim = useFadeUp(50);
  const heroAnim = useFadeUp(150);
  const carouselAnim = useFadeUp(250);
  const ctaAnim = useFadeUp(350);

  const headlineSize = useMemo(() => {
    if (isDesktop) return 64;
    if (isTablet) return 54;
    if (isCompact) return 38;
    return 46;
  }, [isCompact, isDesktop, isTablet]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % BENEFITS.length;
        scrollRef.current?.scrollTo({ x: next * snap, animated: true });
        return next;
      });
    }, 5200);
    return () => clearInterval(timer);
  }, [snap]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.max(0, Math.min(Math.round(event.nativeEvent.contentOffset.x / snap), BENEFITS.length - 1));
    if (next !== activeIndex) setActiveIndex(next);
  };

  const showSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * snap, animated: true });
    setActiveIndex(index);
  };

  const goToLogin = () => navigation.navigate('OTPLogin');

  return (
    <LinearGradient colors={['#070B22', '#10183A', '#0A0E27', '#1A2040']} style={styles.root}>
      <StatusBar style="light" />
      <AmbientBlob colors={['rgba(123,111,242,0.42)', 'rgba(74,144,217,0.02)']} delay={0} style={styles.blobOne} />
      <AmbientBlob colors={['rgba(247,197,46,0.26)', 'rgba(255,140,66,0.02)']} delay={400} style={styles.blobTwo} />
      <AmbientBlob colors={['rgba(78,205,196,0.22)', 'rgba(78,205,196,0.01)']} delay={850} style={styles.blobThree} />

      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingHorizontal: sidePadding }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.container, { maxWidth: maxContent }]}>
            <Animated.View style={[styles.header, isShort && styles.headerShort, headerAnim]}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.logo}><Text style={styles.logoText}>🧠</Text></LinearGradient>
              <View style={styles.brandWrap}><Text style={styles.brand}>Soma AI</Text><Text style={styles.brandSub}>Premium O-Level learning</Text></View>
              <View style={styles.headerPill}><Ionicons name="shield-checkmark" size={14} color={COLORS.successLight} /><Text style={styles.headerPillText}>Exam focused</Text></View>
            </Animated.View>

            <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
              <Animated.View style={[styles.heroCopy, isDesktop && styles.heroCopyDesktop, heroAnim]}>
                <View style={styles.eyebrowPill}><Ionicons name="sparkles" size={14} color={COLORS.gold} /><Text style={styles.eyebrow}>Built for Tanzania O-Level</Text></View>
                <Text style={[styles.headline, { fontSize: headlineSize, lineHeight: headlineSize * 1.05 }]}>Study smarter. Feel ready. Win every day.</Text>
                <Text style={[styles.subtitle, isDesktop && styles.subtitleDesktop]}>Soma AI turns NECTA revision into a beautiful daily habit with guided practice, friendly AI explanations, and motivating progress.</Text>
                <View style={styles.trustRow} accessibilityLabel="Fast practice and clear answers">
                  <View style={styles.trustChip}><Ionicons name="flash-outline" size={16} color={COLORS.gold} /><Text style={styles.trustText}>Fast practice</Text></View>
                  <View style={styles.trustChip}><Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.successLight} /><Text style={styles.trustText}>Clear answers</Text></View>
                </View>
              </Animated.View>
              <Animated.View style={[styles.heroArtWrap, isDesktop && styles.heroArtWrapDesktop, heroAnim]}><HeroArt compact={isCompact || isShort} /></Animated.View>
            </View>

            <Animated.View style={[styles.carouselBlock, carouselAnim]}>
              <View style={styles.sectionHeader}>
                <View><Text style={styles.sectionKicker}>Why students keep going</Text><Text style={styles.sectionTitle}>Premium learning flow</Text></View>
                <View style={styles.counter} accessibilityLabel={`Slide ${activeIndex + 1} of ${BENEFITS.length}`}><Text style={styles.counterText}>{activeIndex + 1}/{BENEFITS.length}</Text></View>
              </View>
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={snap}
                snapToAlignment="start"
                style={[styles.carousel, { width: cardWidth }]}
                contentContainerStyle={styles.carouselContent}
                accessibilityLabel="Welcome feature carousel"
              >
                {BENEFITS.map((item, index) => (
                  <BenefitCard key={item.title} item={item} width={cardWidth} marginRight={index === BENEFITS.length - 1 ? 0 : gap} compact={isCompact || isShort} />
                ))}
              </ScrollView>
              <View style={styles.dots}>
                {BENEFITS.map((item, index) => (
                  <Pressable key={item.title} onPress={() => showSlide(index)} hitSlop={12} accessibilityRole="button" accessibilityLabel={`Show slide ${index + 1}: ${item.badge}`} accessibilityState={{ selected: index === activeIndex }} style={styles.dotTouch}>
                    <View style={[styles.dot, index === activeIndex && styles.dotActive]} />
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            <Animated.View style={[styles.stats, isDesktop && styles.statsDesktop, carouselAnim]} accessibilityLabel="Soma AI overview statistics">
              {STATS.map((stat) => (
                <View key={stat.label} style={styles.statCard} accessibilityLabel={`${stat.value} ${stat.label}. ${stat.helper}`}>
                  <View style={styles.statIcon}><Ionicons name={stat.icon} size={18} color={COLORS.gold} /></View>
                  <View style={styles.statCopy}><Text style={styles.statValue}>{stat.value}</Text><Text style={styles.statLabel}>{stat.label}</Text><Text style={styles.statHelper} numberOfLines={1}>{stat.helper}</Text></View>
                </View>
              ))}
            </Animated.View>

            <Animated.View style={[styles.ctaPanel, ctaAnim]}>
              <PrimaryCTA onPress={goToLogin} />
              <Pressable onPress={goToLogin} accessibilityRole="button" accessibilityLabel="Already have an account? Sign In" accessibilityHint="Opens sign in" style={({ pressed }) => [styles.secondaryCta, pressed && styles.secondaryPressed]}>
                <Text style={styles.secondaryMuted}>Already have an account?</Text><View style={styles.signIn}><Text style={styles.secondaryText}>Sign In</Text><Ionicons name="arrow-forward" size={16} color={COLORS.primaryLight} /></View>
              </Pressable>
              <Text style={styles.ctaHint}>No payment needed to start. Upgrade later only when premium packs are useful.</Text>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const glassBorder = 'rgba(255,255,255,0.14)';
const glassBg = 'rgba(255,255,255,0.08)';

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100vh' as any, backgroundColor: COLORS.bgDark },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', paddingBottom: SPACING['3xl'] },
  container: { width: '100%', flexGrow: 1, alignSelf: 'center', paddingTop: SPACING.lg, paddingBottom: SPACING['2xl'] },
  blob: { position: 'absolute', borderRadius: RADIUS.full, overflow: 'hidden' },
  blobOne: { top: -120, right: -110, width: 330, height: 330 },
  blobTwo: { bottom: -130, left: -110, width: 300, height: 300 },
  blobThree: { top: '34%', left: '44%', width: 210, height: 210 },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING['2xl'] },
  headerShort: { marginBottom: SPACING.lg },
  logo: { width: 54, height: 54, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.34, shadowRadius: 26, elevation: 12 },
  logoText: { fontSize: 26 },
  brandWrap: { flex: 1 },
  brand: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold, lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.08, letterSpacing: -0.3 },
  brandSub: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 3 },
  headerPill: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(126,221,215,0.22)', backgroundColor: 'rgba(78,205,196,0.1)', paddingHorizontal: SPACING.md },
  headerPillText: { color: COLORS.successLight, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  hero: { gap: SPACING.xl, marginBottom: SPACING['2xl'] },
  heroDesktop: { flexDirection: 'row', alignItems: 'center', gap: SPACING['4xl'], marginBottom: SPACING['3xl'] },
  heroCopy: { gap: SPACING.base },
  heroCopyDesktop: { flex: 1.02 },
  eyebrowPill: { alignSelf: 'flex-start', minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(247,197,46,0.26)', backgroundColor: 'rgba(247,197,46,0.1)' },
  eyebrow: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: 0.8, textTransform: 'uppercase' },
  headline: { color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: -1.3, maxWidth: 760 },
  subtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.md, lineHeight: TYPOGRAPHY.sizes.md * 1.58, maxWidth: 640 },
  subtitleDesktop: { fontSize: TYPOGRAPHY.sizes.lg, lineHeight: TYPOGRAPHY.sizes.lg * 1.52 },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingTop: SPACING.xs },
  trustChip: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  trustText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  heroArtWrap: { alignItems: 'center', justifyContent: 'center' },
  heroArtWrapDesktop: { flex: 0.86 },
  heroArt: { width: '100%', maxWidth: 420, minHeight: 360, alignItems: 'center', justifyContent: 'center' },
  heroArtCompact: { minHeight: 310, maxWidth: 360 },
  heroGlow: { position: 'absolute', width: '82%', height: '82%', borderRadius: RADIUS.full, backgroundColor: 'rgba(123,111,242,0.18)', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 54 },
  deviceBorder: { width: '76%', maxWidth: 326, minHeight: 286, borderRadius: 34, padding: 1, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 28 }, shadowOpacity: 0.28, shadowRadius: 36, elevation: 14 },
  device: { flex: 1, borderRadius: 33, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  deviceHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  deviceLogo: { width: 38, height: 38, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  deviceLogoText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.extrabold },
  deviceLines: { flex: 1, gap: 7 },
  lineLong: { width: '78%', height: 9, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.2)' },
  lineShort: { width: '52%', height: 7, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.12)' },
  xpPill: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, backgroundColor: COLORS.gold },
  xpText: { color: COLORS.bgDark, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold },
  brainWrap: { minHeight: 150, alignItems: 'center', justifyContent: 'center', marginVertical: SPACING.md },
  brainCore: { width: 112, height: 112, borderRadius: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  brain: { fontSize: 48 },
  floatChip: { position: 'absolute', minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  floatChipTop: { top: 0, right: 4 },
  floatChipBottom: { bottom: 0, left: 6 },
  floatChipText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  progressCard: { borderRadius: RADIUS.xl, backgroundColor: glassBg, borderWidth: 1, borderColor: COLORS.glassBorder, padding: SPACING.md },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  progressTitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  progressValue: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.extrabold },
  progressTrack: { height: 9, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  progressFill: { width: '82%', height: '100%', borderRadius: RADIUS.full },
  miniCard: { position: 'absolute', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: 'rgba(18,24,54,0.92)', borderWidth: 1, borderColor: glassBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.28, shadowRadius: 22, elevation: 9 },
  miniLeft: { left: 0, top: '22%' },
  miniRight: { right: 0, bottom: '20%' },
  miniText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  carouselBlock: { alignItems: 'center', marginBottom: SPACING.xl },
  sectionHeader: { width: '100%', maxWidth: 640, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: SPACING.md, gap: SPACING.md },
  sectionKicker: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.7 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xl, lineHeight: TYPOGRAPHY.sizes.xl * 1.2, fontWeight: TYPOGRAPHY.weights.extrabold, marginTop: 3 },
  counter: { minHeight: 34, justifyContent: 'center', paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  counterText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  carousel: { flexGrow: 0, overflow: 'visible' },
  carouselContent: { alignItems: 'stretch', paddingVertical: SPACING.xs },
  cardShadow: { borderRadius: 30, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.2, shadowRadius: 28, elevation: 10 },
  card: { minHeight: 232, borderRadius: 30, overflow: 'hidden', padding: SPACING.xl, justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  cardCompact: { minHeight: 214, padding: SPACING.lg },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md },
  cardIcon: { width: 68, height: 68, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  cardBadge: { minHeight: 34, justifyContent: 'center', paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: 'rgba(10,14,39,0.26)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  cardBadgeText: { color: '#fff', fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: 0.4, textTransform: 'uppercase' },
  cardCopy: { gap: SPACING.sm },
  cardTitle: { color: '#fff', fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold, lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.12, letterSpacing: -0.45 },
  cardTitleCompact: { fontSize: TYPOGRAPHY.sizes.xl, lineHeight: TYPOGRAPHY.sizes.xl * 1.16 },
  cardDescription: { color: 'rgba(255,255,255,0.9)', fontSize: TYPOGRAPHY.sizes.base, lineHeight: TYPOGRAPHY.sizes.base * 1.55, flexShrink: 1 },
  dots: { minHeight: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  dotTouch: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.textDisabled },
  dotActive: { width: 30, backgroundColor: COLORS.primaryLight },
  stats: { width: '100%', flexDirection: 'column', gap: SPACING.sm, padding: SPACING.sm, borderRadius: 28, borderWidth: 1, borderColor: glassBorder, backgroundColor: 'rgba(255,255,255,0.07)', marginBottom: SPACING.lg },
  statsDesktop: { flexDirection: 'row', alignSelf: 'center', maxWidth: 900 },
  statCard: { flex: 1, minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderRadius: RADIUS.xl, padding: SPACING.md, backgroundColor: 'rgba(10,14,39,0.34)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statIcon: { width: 42, height: 42, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(247,197,46,0.12)', borderWidth: 1, borderColor: 'rgba(247,197,46,0.2)' },
  statCopy: { flex: 1 },
  statValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.extrabold, lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.05 },
  statLabel: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, marginTop: 2 },
  statHelper: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium, marginTop: 2 },
  ctaPanel: { width: '100%', alignSelf: 'center', maxWidth: 560, gap: SPACING.md, paddingTop: SPACING.xs },
  primaryShadow: { width: '100%', borderRadius: RADIUS.xl, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.38, shadowRadius: 24, elevation: 12 },
  primaryPressable: { minHeight: 60, borderRadius: RADIUS.xl, overflow: 'hidden' },
  primaryCta: { minHeight: 60, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.xl },
  primaryText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: 0.2 },
  primaryIcon: { width: 32, height: 32, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  secondaryCta: { minHeight: 54, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(155,140,249,0.34)', backgroundColor: 'rgba(123,111,242,0.1)', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  secondaryPressed: { backgroundColor: 'rgba(123,111,242,0.16)', transform: [{ scale: 0.99 }] },
  secondaryMuted: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.medium },
  signIn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  secondaryText: { color: COLORS.primaryLight, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  ctaHint: { color: COLORS.textMuted, textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xs, lineHeight: TYPOGRAPHY.sizes.xs * 1.55, paddingHorizontal: SPACING.md },
});
