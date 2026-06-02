import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList, Topic } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

type Props = StackScreenProps<HomeStackParamList, 'Topics'>;

// Demo topics data
function buildDemoTopics(subjectId: string): Topic[] {
  const base: Omit<Topic, 'id' | 'subjectId'>[] = [
    { title: 'Introduction & Basics', description: 'Foundation concepts and terminology', packCount: 4, completedPacks: 4, progressPercent: 100, estimatedMinutes: 45, form: 1 },
    { title: 'Core Principles', description: 'Key principles and methods', packCount: 5, completedPacks: 3, progressPercent: 60, estimatedMinutes: 60, form: 1 },
    { title: 'Applied Problems', description: 'Practical problem solving', packCount: 6, completedPacks: 0, progressPercent: 0, estimatedMinutes: 75, form: 2 },
    { title: 'Advanced Concepts', description: 'Complex topics and relationships', packCount: 5, completedPacks: 0, progressPercent: 0, estimatedMinutes: 70, form: 2 },
    { title: 'NECTA Revision', description: 'Past paper questions & exam tips', packCount: 8, completedPacks: 0, progressPercent: 0, estimatedMinutes: 90, form: 3 },
    { title: 'Mock Examinations', description: 'Full length practice examinations', packCount: 4, completedPacks: 0, progressPercent: 0, estimatedMinutes: 120, form: 4 },
  ];
  return base.map((t, i) => ({ ...t, id: `${subjectId}_topic_${i + 1}`, subjectId }));
}

export function TopicsScreen({ navigation, route }: Props) {
  const { subjectId, subjectName, color } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const topics = buildDemoTopics(subjectId);
  const completedCount = topics.filter((t) => t.progressPercent === 100).length;
  const overallProgress = Math.round((completedCount / topics.length) * 100);

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Phase 2 — fetch topics from Firestore
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <ScreenContainer padded={false} onRefresh={handleRefresh} refreshing={refreshing} scrollable>
      {/* Subject header */}
      <LinearGradient
        colors={[`${color}30`, COLORS.bgDark]}
        style={styles.subjectHeader}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.subjectMeta}>
          <Text style={styles.subjectName}>{subjectName}</Text>
          <Text style={styles.subjectSub}>
            {completedCount} / {topics.length} topics completed
          </Text>

          <View style={styles.overallProgress}>
            <View style={styles.overallTrack}>
              <View style={[styles.overallFill, { width: `${overallProgress}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.overallPercent, { color }]}>{overallProgress}%</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Topics</Text>
        <Text style={styles.listCount}>{topics.length} total</Text>
      </View>

      {topics.map((topic) => (
        <TopicRow
          key={topic.id}
          topic={topic}
          color={color}
          onPress={() =>
            navigation.navigate('LearningPackDetail', {
              packId: `${topic.id}_pack_1`,
              packTitle: topic.title,
              topicId: topic.id,
              subjectColor: color,
            })
          }
        />
      ))}

      <View style={{ height: SPACING['2xl'] }} />
    </ScreenContainer>
  );
}

function TopicRow({
  topic,
  color,
  onPress,
}: {
  topic: Topic;
  color: string;
  onPress: () => void;
}) {
  const isDone = topic.progressPercent === 100;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.topicCard}
    >
      <View style={[styles.topicIcon, isDone ? { backgroundColor: `${color}25` } : {}]}>
        {isDone ? (
          <Ionicons name="checkmark-circle" size={24} color={color} />
        ) : topic.progressPercent > 0 ? (
          <Ionicons name="play-circle" size={24} color={color} />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color={COLORS.textMuted} />
        )}
      </View>

      <View style={styles.topicContent}>
        <View style={styles.topicTitleRow}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          <View style={[styles.formBadge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.formBadgeText, { color }]}>F{topic.form}</Text>
          </View>
        </View>
        <Text style={styles.topicDesc}>{topic.description}</Text>

        <View style={styles.topicMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="layers-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{topic.packCount} packs</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{topic.estimatedMinutes} min</Text>
          </View>
          {topic.progressPercent > 0 && (
            <View style={styles.topicProgressBar}>
              <View
                style={[
                  styles.topicProgressFill,
                  { width: `${topic.progressPercent}%`, backgroundColor: color },
                ]}
              />
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  subjectHeader: {
    paddingTop: SPACING['2xl'],
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
    gap: SPACING.base,
  },
  back: { alignSelf: 'flex-start', padding: SPACING.xs },
  subjectMeta: { gap: SPACING.sm },
  subjectName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  subjectSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  overallProgress: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  overallTrack: {
    flex: 1, height: 6, backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  overallFill: { height: 6, borderRadius: RADIUS.full },
  overallPercent: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, minWidth: 36, textAlign: 'right' },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
  },
  listTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  listCount: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    marginHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    gap: SPACING.md,
  },
  topicIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicContent: { flex: 1, gap: SPACING.xs },
  topicTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  topicTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  formBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  formBadgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  topicDesc: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  topicMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  topicProgressBar: {
    flex: 1, height: 4, backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  topicProgressFill: { height: 4, borderRadius: RADIUS.full },
});
