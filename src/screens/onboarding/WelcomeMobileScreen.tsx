import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { COLORS, GRADIENTS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { SUBJECT_COUNT } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

type Props = StackScreenProps<AuthStackParamList, 'Welcome'>;
type IconName = keyof typeof Ionicons.glyphMap;

const FEATURES = [
  { icon: 'sparkles' as IconName, title: 'AI explains mistakes', text: 'Learn why, not just what.' },
  { icon: 'school' as IconName, title: 'Full Form 1–4 path', text: `${SUBJECT_COUNT} subjects, NECTA aligned.` },
  { icon: 'flame' as IconName, title: 'Rewards that motivate', text: 'XP, streaks, and badges.' },
];

export function WelcomeMobileScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const side = isSmall ? SPACING.base : SPACING.screenPadding;
  const { signInWithGoogle, error } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  // Google is the only real sign-in on this branch. New users continue to
  // Create Profile; returning users (profile hydrated by the hook) fall
  // through to the app via RootNavigator's isOnboarded check.
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

  return (
    <LinearGradient colors={['#070B22', '#10183A', '#0A0E27']} style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.glowTop} />
      <View style={styles.glowMid} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingHorizontal: side }]}>
          <View style={styles.shell}>
            <View style={styles.header}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.logo}>
                <Text style={styles.logoEmoji}>🧠</Text>
              </LinearGradient>
              <View style={styles.brandBox}>
                <Text style={styles.brand}>Soma AI</Text>
                <Text style={styles.brandSub}>O-Level learning, made addictive</Text>
              </View>
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={13} color={COLORS.gold} />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>

            <View style={styles.badge}>
              <Ionicons name="sparkles" size={15} color={COLORS.gold} />
              <Text style={styles.badgeText}>Tanzania O-Level AI Tutor</Text>
            </View>

            <Text style={[styles.title, isSmall && styles.titleSmall]}>Master exams one smart habit at a time.</Text>
            <Text style={styles.subtitle}>Personalized practice, instant explanations, and progress that feels rewarding every day.</Text>

            <View style={styles.heroShadow}>
              <LinearGradient colors={['rgba(55,61,130,0.98)', 'rgba(30,37,83,0.98)']} style={styles.heroCard}>
                <View style={styles.heroHeader}>
                  <View>
                    <Text style={styles.heroTitle}>Today’s AI Study Plan</Text>
                    <Text style={styles.heroSub}>Form 3 • Mathematics</Text>
                  </View>
                  <View style={styles.scorePill}><Text style={styles.scoreText}>82%</Text></View>
                </View>

                <View style={styles.heroCenter}>
                  <View style={[styles.floatChip, styles.floatLeftTop]}>
                    <Ionicons name="flash" size={14} color={COLORS.gold} />
                    <Text style={styles.floatText}>+XP</Text>
                  </View>
                  <View style={[styles.floatChip, styles.floatRightTop]}>
                    <Ionicons name="checkmark-circle" size={15} color={COLORS.successLight} />
                    <Text style={styles.floatText}>Correct</Text>
                  </View>
                  <LinearGradient colors={GRADIENTS.primary} style={styles.brainCore}>
                    <Text style={styles.brain}>🧠</Text>
                  </LinearGradient>
                  <View style={[styles.floatChip, styles.floatLeftBottom]}>
                    <Text style={styles.floatEmoji}>🔥</Text>
                    <Text style={styles.floatText}>7 day streak</Text>
                  </View>
                  <View style={[styles.floatChip, styles.floatRightBottom]}>
                    <Ionicons name="sparkles" size={14} color={COLORS.gold} />
                    <Text style={styles.floatText}>Explain</Text>
                  </View>
                </View>

                <View style={styles.trackWrap}>
                  <View style={styles.track}>
                    <LinearGradient colors={GRADIENTS.gold} style={styles.fill} />
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.featureSection}>
              <Text style={styles.featureHeading}>Everything students need</Text>
              {FEATURES.map((item) => (
                <View key={item.title} style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={item.icon} size={21} color={COLORS.primaryLight} />
                  </View>
                  <View style={styles.featureCopy}>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureDesc}>{item.text}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Pressable onPress={handleGoogle} disabled={signingIn} accessibilityRole="button" accessibilityLabel="Continue with Google" style={styles.primaryButton}>
              <LinearGradient colors={['#9B8CF9', '#7B6FF2', '#4A90D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryGradient}>
                <Text style={styles.primaryText}>{signingIn ? 'Signing in…' : 'Continue with Google'}</Text>
                <View style={styles.arrow}><Ionicons name="logo-google" size={20} color={COLORS.primaryDark} /></View>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleGoogle} disabled={signingIn} accessibilityRole="button" accessibilityLabel="Already have an account? Sign In" style={styles.secondaryButton}>
              <Text style={styles.secondaryMuted}>Already have an account?</Text>
              <Text style={styles.secondaryText}> Sign In →</Text>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100vh' as any, backgroundColor: COLORS.bgDark },
  safe: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', paddingBottom: SPACING['3xl'] },
  shell: { width: '100%', maxWidth: 430, paddingTop: SPACING.lg, paddingBottom: SPACING['2xl'] },
  glowTop: { position: 'absolute', top: -130, right: -120, width: 310, height: 310, borderRadius: 155, backgroundColor: 'rgba(123,111,242,0.22)' },
  glowMid: { position: 'absolute', top: 315, right: -110, width: 290, height: 290, borderRadius: 145, backgroundColor: 'rgba(78,205,196,0.10)' },
  glowBottom: { position: 'absolute', bottom: -125, left: -130, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(247,197,46,0.11)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  logo: { width: 58, height: 58, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10 },
  logoEmoji: { fontSize: 26 },
  brandBox: { flex: 1, minWidth: 0 },
  brand: { color: COLORS.textPrimary, fontSize: 29, lineHeight: 33, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: -0.5 },
  brandSub: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  ratingPill: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.08)' },
  ratingText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold },
  badge: { alignSelf: 'flex-start', minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(247,197,46,0.28)', backgroundColor: 'rgba(247,197,46,0.11)', marginBottom: SPACING.xl },
  badgeText: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: 0.45, textTransform: 'uppercase' },
  title: { color: COLORS.textPrimary, fontSize: 39, lineHeight: 44, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: -0.9 },
  titleSmall: { fontSize: 34, lineHeight: 39 },
  subtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.md, lineHeight: TYPOGRAPHY.sizes.md * 1.55, marginTop: SPACING.md, marginBottom: SPACING.xl },
  heroShadow: { borderRadius: 34, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 14, marginBottom: SPACING['2xl'] },
  heroCard: { minHeight: 258, borderRadius: 34, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', overflow: 'hidden' },
  heroHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: SPACING.md },
  heroTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.extrabold },
  heroSub: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 3 },
  scorePill: { minHeight: 34, minWidth: 68, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.gold },
  scoreText: { color: COLORS.bgDark, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  heroCenter: { minHeight: 166, alignItems: 'center', justifyContent: 'center' },
  brainCore: { width: 110, height: 110, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  brain: { fontSize: 50 },
  floatChip: { position: 'absolute', minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: 'rgba(10,14,39,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  floatText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold },
  floatEmoji: { fontSize: 14 },
  floatLeftTop: { top: 42, left: 4 },
  floatRightTop: { top: 44, right: 0 },
  floatLeftBottom: { bottom: 0, left: 10 },
  floatRightBottom: { bottom: 2, right: 6 },
  trackWrap: { paddingHorizontal: SPACING.xs },
  track: { height: 10, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  fill: { width: '82%', height: '100%' },
  featureSection: { gap: SPACING.sm, marginBottom: SPACING.lg },
  featureHeading: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.extrabold, marginBottom: SPACING.xs },
  featureCard: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: 'rgba(255,255,255,0.07)' },
  featureIcon: { width: 42, height: 42, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(123,111,242,0.14)' },
  featureCopy: { flex: 1, minWidth: 0 },
  featureTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  featureDesc: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: TYPOGRAPHY.sizes.sm * 1.45, marginTop: 2 },
  primaryButton: { minHeight: 62, borderRadius: RADIUS.xl, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.36, shadowRadius: 22, elevation: 12, marginBottom: SPACING.md },
  primaryGradient: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md, paddingHorizontal: SPACING.xl },
  primaryText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: 0.2 },
  arrow: { width: 34, height: 34, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { minHeight: 54, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(155,140,249,0.34)', backgroundColor: 'rgba(123,111,242,0.1)', paddingHorizontal: SPACING.lg },
  secondaryMuted: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.medium },
  secondaryText: { color: COLORS.primaryLight, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  errorText: { color: COLORS.error, textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.md, paddingHorizontal: SPACING.md },
});
