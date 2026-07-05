import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { COLORS, GRADIENTS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { FORM_COUNT, SUBJECT_COUNT } from '../../constants';

type Props = StackScreenProps<AuthStackParamList, 'Welcome'>;
type IconName = keyof typeof Ionicons.glyphMap;

const STATS = [
  { value: SUBJECT_COUNT, label: 'Subjects', icon: 'book-outline' as IconName },
  { value: FORM_COUNT, label: 'Forms', icon: 'layers-outline' as IconName },
  { value: 'Free', label: 'Start', icon: 'gift-outline' as IconName },
];

const FEATURES = [
  { icon: 'sparkles' as IconName, title: 'AI Tutor', text: 'Simple explanations after every answer.' },
  { icon: 'flame' as IconName, title: 'Daily Wins', text: 'XP, streaks, and badges for motivation.' },
  { icon: 'school' as IconName, title: 'Exam Ready', text: 'Form 1–4 NECTA practice in one place.' },
];

export function WelcomeMobileScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const side = isSmall ? SPACING.base : SPACING.screenPadding;

  return (
    <LinearGradient colors={['#070B22', '#10183A', '#0A0E27']} style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingHorizontal: side }]}>
          <View style={styles.shell}>
            <View style={styles.header}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.logo}><Text style={styles.logoEmoji}>🧠</Text></LinearGradient>
              <View style={styles.brandBox}><Text style={styles.brand}>Soma AI</Text><Text style={styles.brandSub}>Premium O-Level learning</Text></View>
            </View>

            <View style={styles.badge}><Ionicons name="sparkles" size={14} color={COLORS.gold} /><Text style={styles.badgeText}>Built for Tanzania O-Level</Text></View>

            <Text style={[styles.title, isSmall && styles.titleSmall]}>Study smarter. Feel ready.</Text>
            <Text style={styles.subtitle}>Guided NECTA practice, friendly AI explanations, daily rewards, and a calmer path to exam confidence.</Text>

            <LinearGradient colors={['rgba(123,111,242,0.42)', 'rgba(74,144,217,0.14)']} style={styles.heroCard}>
              <View style={styles.heroTop}><View style={styles.avatar}><Text style={styles.avatarText}>S</Text></View><View style={styles.xp}><Ionicons name="flash" size={13} color={COLORS.bgDark} /><Text style={styles.xpText}>XP</Text></View></View>
              <Text style={styles.brain}>🧠</Text>
              <View style={styles.focusRow}><Text style={styles.focusText}>Today’s focus</Text><Text style={styles.focusPercent}>82%</Text></View>
              <View style={styles.track}><LinearGradient colors={GRADIENTS.gold} style={styles.fill} /></View>
            </LinearGradient>

            <View style={styles.chips}><View style={styles.chip}><Ionicons name="flash-outline" size={16} color={COLORS.gold} /><Text style={styles.chipText}>Fast practice</Text></View><View style={styles.chip}><Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.successLight} /><Text style={styles.chipText}>Clear answers</Text></View></View>

            <View style={styles.stats}>{STATS.map((stat) => <View key={stat.label} style={styles.stat}><Ionicons name={stat.icon} size={20} color={COLORS.gold} /><Text style={styles.statValue}>{stat.value}</Text><Text style={styles.statLabel}>{stat.label}</Text></View>)}</View>

            <View style={styles.featureList}>{FEATURES.map((item) => <View key={item.title} style={styles.feature}><View style={styles.featureIcon}><Ionicons name={item.icon} size={22} color={COLORS.primaryLight} /></View><View style={styles.featureText}><Text style={styles.featureTitle}>{item.title}</Text><Text style={styles.featureDesc}>{item.text}</Text></View></View>)}</View>

            <Pressable onPress={() => navigation.navigate('OTPLogin')} accessibilityRole="button" accessibilityLabel="Start Learning Free" style={styles.primaryButton}>
              <LinearGradient colors={['#9B8CF9', '#7B6FF2', '#4A90D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryGradient}><Text style={styles.primaryText}>Start Learning Free</Text><View style={styles.arrow}><Ionicons name="arrow-forward" size={20} color={COLORS.primaryDark} /></View></LinearGradient>
            </Pressable>

            <Pressable onPress={() => navigation.navigate('OTPLogin')} accessibilityRole="button" accessibilityLabel="Already have an account? Sign In" style={styles.secondaryButton}><Text style={styles.secondaryMuted}>Already have an account?</Text><Text style={styles.secondaryText}> Sign In →</Text></Pressable>
            <Text style={styles.hint}>No payment needed to start. Upgrade later only when premium packs are useful.</Text>
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
  glowOne: { position: 'absolute', top: -110, right: -90, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(123,111,242,0.2)' },
  glowTwo: { position: 'absolute', bottom: -100, left: -90, width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(247,197,46,0.1)' },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  logo: { width: 56, height: 56, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 26 },
  brandBox: { flex: 1 },
  brand: { color: COLORS.textPrimary, fontSize: 28, lineHeight: 32, fontWeight: TYPOGRAPHY.weights.extrabold },
  brandSub: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  badge: { alignSelf: 'flex-start', minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(247,197,46,0.26)', backgroundColor: 'rgba(247,197,46,0.1)', marginBottom: SPACING.lg },
  badgeText: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, textTransform: 'uppercase' },
  title: { color: COLORS.textPrimary, fontSize: 42, lineHeight: 46, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: -0.8 },
  titleSmall: { fontSize: 36, lineHeight: 40 },
  subtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.md, lineHeight: TYPOGRAPHY.sizes.md * 1.5, marginTop: SPACING.md, marginBottom: SPACING.xl },
  heroCard: { alignSelf: 'center', width: '82%', minHeight: 230, borderRadius: 32, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', marginBottom: SPACING.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.extrabold },
  xp: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.gold },
  xpText: { color: COLORS.bgDark, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold },
  brain: { textAlign: 'center', fontSize: 56, marginVertical: SPACING.xl },
  focusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  focusText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  focusPercent: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.extrabold },
  track: { height: 10, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  fill: { width: '82%', height: '100%' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  chip: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  chipText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  stats: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.sm, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.07)', marginBottom: SPACING.lg },
  stat: { flex: 1, minHeight: 94, alignItems: 'center', justifyContent: 'center', padding: SPACING.sm, borderRadius: RADIUS.xl, backgroundColor: 'rgba(10,14,39,0.34)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statValue: { color: COLORS.textPrimary, fontSize: 26, lineHeight: 30, fontWeight: TYPOGRAPHY.weights.extrabold, marginTop: SPACING.xs },
  statLabel: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  featureList: { gap: SPACING.sm, marginBottom: SPACING.lg },
  feature: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glassBg },
  featureIcon: { width: 44, height: 44, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(123,111,242,0.12)' },
  featureText: { flex: 1 },
  featureTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  featureDesc: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: TYPOGRAPHY.sizes.sm * 1.45, marginTop: 2 },
  primaryButton: { minHeight: 60, borderRadius: RADIUS.xl, overflow: 'hidden', elevation: 10, marginBottom: SPACING.md },
  primaryGradient: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md, paddingHorizontal: SPACING.xl },
  primaryText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.extrabold },
  arrow: { width: 32, height: 32, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { minHeight: 54, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(155,140,249,0.34)', backgroundColor: 'rgba(123,111,242,0.1)', paddingHorizontal: SPACING.lg },
  secondaryMuted: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.medium },
  secondaryText: { color: COLORS.primaryLight, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  hint: { color: COLORS.textMuted, textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xs, lineHeight: TYPOGRAPHY.sizes.xs * 1.55, paddingHorizontal: SPACING.md, marginTop: SPACING.md },
});
