import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList, LearningPack } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LearningPackCard } from '../../components/ui/LearningPackCard';
import { PremiumLockCard } from '../../components/ui/PremiumLockCard';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

type Props = StackScreenProps<HomeStackParamList, 'LearningPackDetail'>;

function buildDemoPacks(topicId: string, subjectColor: string): LearningPack[] {
  return [
    {
      id: `${topicId}_summary`,
      topicId,
      subjectId: 'demo',
      title: 'AI Topic Summary',
      description: 'A concise AI-generated overview of all key concepts in this topic.',
      type: 'summary',
      questionCount: 0,
      xpReward: 20,
      isPremium: true,
      isCompleted: false,
      completionPercent: 0,
      estimatedMinutes: 5,
    },
    {
      id: `${topicId}_mcq`,
      topicId,
      subjectId: 'demo',
      title: 'Multiple Choice Quiz',
      description: 'Test your understanding with 10 carefully crafted MCQ questions.',
      type: 'mcq',
      questionCount: 10,
      xpReward: 50,
      isPremium: false,
      isCompleted: true,
      completionPercent: 100,
      estimatedMinutes: 15,
    },
    {
      id: `${topicId}_fib`,
      topicId,
      subjectId: 'demo',
      title: 'Fill in the Blanks',
      description: 'Complete the sentences by filling in the correct terms from this topic.',
      type: 'fib',
      questionCount: 8,
      xpReward: 40,
      isPremium: false,
      isCompleted: false,
      completionPercent: 37,
      estimatedMinutes: 12,
    },
    {
      id: `${topicId}_tf`,
      topicId,
      subjectId: 'demo',
      title: 'True or False Challenge',
      description: 'Quickly identify correct statements about this topic.',
      type: 'tf',
      questionCount: 12,
      xpReward: 35,
      isPremium: false,
      isCompleted: false,
      completionPercent: 0,
      estimatedMinutes: 10,
    },
    {
      id: `${topicId}_hoq`,
      topicId,
      subjectId: 'demo',
      title: 'Higher Order Questions',
      description: 'NECTA-style essay and structured questions requiring deep analysis.',
      type: 'hoq',
      questionCount: 5,
      xpReward: 100,
      isPremium: true,
      isCompleted: false,
      completionPercent: 0,
      estimatedMinutes: 30,
    },
  ];
}

export function LearningPackDetailScreen({ navigation, route }: Props) {
  const { packId: _packId, packTitle, topicId, subjectColor } = route.params;
  const [launching, setLaunching] = useState(false);

  const packs = buildDemoPacks(topicId, subjectColor);
  const freePacks = packs.filter((p) => !p.isPremium);
  const premiumPacks = packs.filter((p) => p.isPremium);
  const completedCount = packs.filter((p) => p.isCompleted).length;

  const handlePackPress = async (pack: LearningPack) => {
    if (pack.isPremium) return; // PremiumLockCard handles upgrade CTA
    // TODO: Phase 2 — launch actual quiz session via quizEngineService
    setLaunching(true);
    await new Promise((r) => setTimeout(r, 600));
    setLaunching(false);
    navigation.navigate('PackCompletion', {
      xpEarned: pack.xpReward,
      packTitle: pack.title,
      streakDays: 6,
    });
  };

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient
        colors={[`${subjectColor}25`, COLORS.bgDark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.topicLabel}>Learning Packs</Text>
        <Text style={styles.topicTitle}>{packTitle}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="layers-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{packs.length} packs</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.success} />
            <Text style={styles.metaText}>{completedCount} completed</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Free packs */}
        <Text style={styles.sectionLabel}>Free Content</Text>
        {freePacks.map((pack) => (
          <LearningPackCard
            key={pack.id}
            pack={pack}
            subjectColor={subjectColor}
            onPress={handlePackPress}
          />
        ))}

        {/* Premium packs */}
        <Text style={styles.sectionLabel}>Premium Content</Text>
        <PremiumLockCard
          title="Premium Pack Locked"
          description="Upgrade to access AI summaries and Higher Order Questions — NECTA's most tested format."
        />
        {premiumPacks.map((pack) => (
          <View key={pack.id} style={styles.lockedCard}>
            <LearningPackCard
              pack={pack}
              subjectColor={subjectColor}
              onPress={() => {}}
            />
            <View style={styles.lockedOverlay}>
              <Ionicons name="lock-closed" size={20} color={COLORS.gold} />
            </View>
          </View>
        ))}

        {/* Start next free pack CTA */}
        <View style={styles.ctaSection}>
          <AppButton
            title={launching ? 'Preparing quiz...' : 'Start Next Pack'}
            onPress={() => handlePackPress(freePacks[1])}
            loading={launching}
            variant="primary"
          />
          <Text style={styles.ctaHint}>
            {/* TODO: Phase 2 — show actual next uncompleted pack */}
            Continuing: Fill in the Blanks
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING['2xl'],
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  topicLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  topicTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * 1.2,
  },
  metaRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.bgCard, paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  metaText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    gap: SPACING.sm,
    paddingBottom: SPACING['3xl'],
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.sm,
  },
  lockedCard: { position: 'relative' },
  lockedOverlay: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: 'rgba(10,14,39,0.5)',
    borderRadius: RADIUS.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  ctaSection: {
    gap: SPACING.sm,
    marginTop: SPACING.base,
    paddingTop: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  ctaHint: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
});
