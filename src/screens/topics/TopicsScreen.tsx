import React, { useEffect, useCallback, useMemo } from 'react';
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
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ErrorState } from '../../components/ui/ErrorState';
import { TopicCard } from '../../components/ui/curriculum/TopicCard';
import { EmptyCurriculumState } from '../../components/ui/curriculum/EmptyCurriculumState';
import { SkeletonList } from '../../components/ui/curriculum/SkeletonCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useCurriculumStore } from '../../store/curriculumStore';
import { useProgressStore } from '../../store/progressStore';
import { getPackCountForTopic } from '../../services/curriculumService';
import type { CurriculumTopic } from '../../types/curriculum';

type Props = StackScreenProps<HomeStackParamList, 'Topics'>;

export function TopicsScreen({ navigation, route }: Props) {
  const { subjectId, subjectName, color, formId: routeFormId } = route.params;

  const {
    selectedFormId,
    topicsBySubject,
    loadingTopics,
    error,
    fetchTopics,
    clearError,
  } = useCurriculumStore();

  const { getTopicProgress } = useProgressStore();

  const formId = routeFormId ?? selectedFormId;
  const topics = topicsBySubject[`${formId}::${subjectId}`] ?? [];

  useEffect(() => {
    fetchTopics(formId, subjectId);
  }, [formId, subjectId, fetchTopics]);

  const handleRefresh = useCallback(() => {
    fetchTopics(formId, subjectId, true);
  }, [formId, subjectId, fetchTopics]);

  const enrichedTopics = useMemo(
    () =>
      topics.map((t) => {
        const packCount = getPackCountForTopic(t.id);
        return { topic: t, packCount, progress: getTopicProgress(t.id, packCount) };
      }),
    [topics, getTopicProgress],
  );

  const completedCount = enrichedTopics.filter((e) => e.progress.progressPercent === 100).length;
  const overallPct = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  const handleTopicPress = useCallback((topic: CurriculumTopic) => {
    navigation.navigate('LearningPackDetail', {
      packId: topic.id,
      packTitle: topic.name,
      topicId: topic.id,
      subjectColor: color,
      formId,
      subjectId,
    });
  }, [navigation, color, formId, subjectId]);

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState
          message={error}
          onRetry={() => { clearError(); fetchTopics(formId, subjectId, true); }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
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

          {topics.length > 0 && (
            <View style={styles.overallProgress}>
              <View style={styles.overallTrack}>
                <View
                  style={[styles.overallFill, { width: `${overallPct}%`, backgroundColor: color }]}
                />
              </View>
              <Text style={[styles.overallPercent, { color }]}>{overallPct}%</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Topics list */}
      {loadingTopics ? (
        <View style={styles.list}>
          <SkeletonList count={5} />
        </View>
      ) : (
        <FlatList
          data={enrichedTopics}
          keyExtractor={(item) => item.topic.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Topics</Text>
              <Text style={styles.listCount}>{topics.length} total</Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyCurriculumState
              variant="topics"
              onAction={() => navigation.goBack()}
            />
          }
          renderItem={({ item }) => (
            <TopicCard
              topic={item.topic}
              subjectColor={color}
              packCount={item.packCount}
              progress={item.progress}
              onPress={handleTopicPress}
            />
          )}
        />
      )}
    </ScreenContainer>
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
    flex: 1,
    height: 6,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  overallFill: { height: 6, borderRadius: RADIUS.full },
  overallPercent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    minWidth: 36,
    textAlign: 'right',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xs,
  },
  listTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  listCount: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  list: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['2xl'],
  },
});
