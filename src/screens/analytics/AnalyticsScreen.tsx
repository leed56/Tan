import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-gifted-charts';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LoadingState } from '../../components/ui/LoadingState';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { getUserAnalytics, DEMO_ANALYTICS, type AnalyticsPeriod } from '../../services/analyticsService';
import { useAuthStore } from '../../store/authStore';
import type { AnalyticsSummary, SubjectMastery } from '../../types';

type Period = AnalyticsPeriod;
const BAR_MAX_HEIGHT = 80;

// Bar labels — real weekday letters ending today for the 7-day view; the
// longer views just mark the two ends of the window to avoid a cluttered axis.
function getBarLabels(period: Period, count: number): string[] {
  if (period === '7d') {
    const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return Array.from({ length: count }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (count - 1 - i));
      return letters[d.getDay()];
    });
  }
  const spanLabel = period === '30d' ? '30d ago' : '90d ago';
  return Array.from({ length: count }, (_, i) => {
    if (i === 0) return spanLabel;
    if (i === count - 1) return 'Today';
    return '';
  });
}

export function AnalyticsScreen() {
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<AnalyticsSummary>(DEMO_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  // True when the service fell back to DEMO_ANALYTICS (offline/unconfigured/
  // query failure) — shown as a banner so sample stats aren't mistaken for real ones.
  const [isDemoData, setIsDemoData] = useState(false);
  const uid = useAuthStore((s) => s.user?.uid);

  const load = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getUserAnalytics(uid, period);
    setData(result);
    setIsDemoData(result === DEMO_ANALYTICS);
    setLoading(false);
    setHasLoadedOnce(true);
  }, [uid, period]);

  useEffect(() => {
    load();
  }, [load]);

  const maxActivity = Math.max(...data.weeklyActivity, 1);
  const barLabels = getBarLabels(period, data.weeklyActivity.length);
  const barData = data.weeklyActivity.map((val, i) => ({
    value: val,
    label: barLabels[i],
    frontColor: i === data.weeklyActivity.length - 1 ? COLORS.primary : `${COLORS.primary}50`,
  }));

  const periods: { label: string; value: Period }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '3 Months', value: '3m' },
  ];

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient colors={['#1C2347', '#131936']} style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Your learning insights</Text>
      </LinearGradient>

      {loading && !hasLoadedOnce ? (
        <LoadingState />
      ) : (
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {isDemoData && (
          <View style={styles.demoBanner}>
            <Ionicons name="cloud-offline-outline" size={14} color={COLORS.warning} />
            <Text style={styles.demoBannerText}>
              Sample data — your real stats will appear when you're back online.
            </Text>
            <TouchableOpacity onPress={load}>
              <Text style={styles.demoRetry}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Summary stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="checkmark-circle"
            iconColor={COLORS.success}
            label="Accuracy"
            value={`${data.accuracyPercent}%`}
          />
          <StatCard
            icon="flash"
            iconColor={COLORS.primary}
            label="Total XP"
            value={`${(data.totalXp / 1000).toFixed(1)}k`}
          />
          <StatCard
            icon="flame"
            iconColor="#FF8C42"
            label="Streak"
            value={`${data.studyStreakDays}d`}
          />
          <StatCard
            icon="refresh-circle"
            iconColor={COLORS.secondary}
            label="Consistency"
            value={`${data.consistencyPercent}%`}
          />
        </View>

        {/* Accuracy breakdown */}
        <View style={styles.accuracyCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Accuracy Breakdown</Text>
          </View>
          <View style={styles.accuracyBody}>
            <View style={styles.accuracyRing}>
              <View style={styles.accuracyRingOuter}>
                <LinearGradient colors={GRADIENTS.success} style={styles.accuracyRingFill}>
                  <Text style={styles.accuracyNum}>{data.accuracyPercent}%</Text>
                  <Text style={styles.accuracyLabel}>correct</Text>
                </LinearGradient>
              </View>
            </View>
            <View style={styles.accuracyDetails}>
              <View style={styles.accuracyRow}>
                <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.accuracyText}>Correct: {data.correctAnswers}</Text>
              </View>
              <View style={styles.accuracyRow}>
                <View style={[styles.dot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.accuracyText}>
                  Wrong: {data.totalQuestions - data.correctAnswers}
                </Text>
              </View>
              <View style={styles.accuracyRow}>
                <View style={[styles.dot, { backgroundColor: COLORS.textMuted }]} />
                <Text style={styles.accuracyText}>Total: {data.totalQuestions}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Activity chart */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.periodPills}>
              {periods.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setPeriod(p.value)}
                  style={[styles.periodPill, period === p.value && styles.periodPillActive]}
                >
                  <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chart}>
            <BarChart
              data={barData}
              barWidth={period === '7d' ? 22 : 14}
              spacing={period === '7d' ? 16 : 8}
              roundedTop
              roundedBottom
              hideRules
              hideYAxisText
              yAxisThickness={0}
              xAxisThickness={0}
              xAxisLabelTextStyle={styles.chartLabel}
              noOfSections={3}
              maxValue={maxActivity}
              height={BAR_MAX_HEIGHT}
              initialSpacing={8}
              endSpacing={8}
              disablePress
            />
          </View>
        </View>

        {/* Strong subjects */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Strengths 💪</Text>
          </View>
          {data.strongSubjects.map((s) => (
            <MasteryRow key={s.subjectId} mastery={s} isStrength />
          ))}
        </View>

        {/* Weak subjects */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Needs Work 📚</Text>
          </View>
          {data.weakSubjects.map((s) => (
            <MasteryRow key={s.subjectId} mastery={s} isStrength={false} />
          ))}
        </View>

        {/* AI insight placeholder — not wired to Gemini yet, so this stays an
            honest "coming soon" rather than a fabricated personalized insight. */}
        <LinearGradient
          colors={['rgba(123,111,242,0.15)', 'rgba(123,111,242,0.05)']}
          style={styles.aiCard}
        >
          <View style={styles.aiHeader}>
            <Text style={styles.aiIcon}>🤖</Text>
            <Text style={styles.aiTitle}>AI Learning Insight</Text>
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
          <Text style={styles.aiBody}>
            Personalized study tips based on your accuracy and subject mastery will appear
            here once AI insights are enabled.
          </Text>
        </LinearGradient>
      </ScrollView>
      )}
    </ScreenContainer>
  );
}

function StatCard({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MasteryRow({ mastery, isStrength }: { mastery: SubjectMastery; isStrength: boolean }) {
  return (
    <View style={styles.masteryRow}>
      <Text style={styles.masteryName}>{mastery.subjectName}</Text>
      <View style={styles.masteryBarWrapper}>
        <View style={styles.masteryTrack}>
          <View
            style={[
              styles.masteryFill,
              {
                width: `${mastery.masteryPercent}%`,
                backgroundColor: isStrength ? COLORS.success : COLORS.warning,
              },
            ]}
          />
        </View>
        <Text style={[styles.masteryPercent, { color: isStrength ? COLORS.success : COLORS.warning }]}>
          {mastery.masteryPercent}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  demoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,169,77,0.1)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,169,77,0.3)',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  demoBannerText: { flex: 1, color: COLORS.warning, fontSize: TYPOGRAPHY.sizes.xs },
  demoRetry: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  header: {
    paddingTop: SPACING.base,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.base,
    gap: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  subtitle: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  body: {
    padding: SPACING.screenPadding,
    gap: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.xs,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  statLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  accuracyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.base,
  },
  accuracyBody: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl },
  accuracyRing: { alignItems: 'center' },
  accuracyRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  accuracyRingFill: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyNum: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  accuracyLabel: { color: 'rgba(255,255,255,0.8)', fontSize: TYPOGRAPHY.sizes.xs },
  accuracyDetails: { flex: 1, gap: SPACING.sm },
  accuracyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  accuracyText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm },
  chart: { gap: SPACING.sm },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xs,
  },
  chartLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.medium },
  periodPills: { flexDirection: 'row', gap: 4 },
  periodPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCardLight,
  },
  periodPillActive: { backgroundColor: 'rgba(123,111,242,0.25)' },
  periodText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  periodTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },
  masteryRow: { gap: SPACING.xs },
  masteryName: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  masteryBarWrapper: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  masteryTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  masteryFill: { height: 8, borderRadius: RADIUS.full, minWidth: 4 },
  masteryPercent: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, minWidth: 36, textAlign: 'right' },
  aiCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(123,111,242,0.3)',
    gap: SPACING.sm,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  aiIcon: { fontSize: 22 },
  aiTitle: { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold },
  comingSoon: {
    backgroundColor: 'rgba(123,111,242,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  comingSoonText: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  aiBody: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: TYPOGRAPHY.sizes.sm * 1.6 },
  aiDisclaimer: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, fontStyle: 'italic' },
});
