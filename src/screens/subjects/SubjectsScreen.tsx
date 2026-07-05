import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { SubjectsStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SubjectCard } from '../../components/ui/SubjectCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyCurriculumState } from '../../components/ui/curriculum/EmptyCurriculumState';
import { FormSelector } from '../../components/ui/curriculum/FormSelector';
import { CurriculumProgressCard } from '../../components/ui/curriculum/CurriculumProgressCard';
import { SkeletonList } from '../../components/ui/curriculum/SkeletonCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useCurriculumStore } from '../../store/curriculumStore';
import { useProgressStore } from '../../store/progressStore';
import { useAuthStore } from '../../store/authStore';
import { toSubject } from '../../utils/curriculumAdapters';
import { getTopicCountForSubject } from '../../services/curriculumService';
import type { Subject } from '../../types';

type Props = StackScreenProps<SubjectsStackParamList, 'Subjects'>;

type Filter = 'all' | 'free' | 'premium';

export function SubjectsScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const {
    forms,
    selectedFormId,
    subjectsByForm,
    loadingSubjects,
    error,
    fetchSubjects,
    setSelectedForm,
    clearError,
  } = useCurriculumStore();

  const { getSubjectProgress } = useProgressStore();
  const user = useAuthStore((s) => s.user);

  const subjects = subjectsByForm[selectedFormId] ?? [];
  const selectedForm = forms.find((f) => f.id === selectedFormId);

  // Fetch subjects on mount and when form changes
  useEffect(() => {
    fetchSubjects(selectedFormId);
  }, [selectedFormId, fetchSubjects]);

  const handleRefresh = useCallback(() => {
    fetchSubjects(selectedFormId, true);
  }, [selectedFormId, fetchSubjects]);

  // Convert to Phase 1 Subject type with live progress
  const enrichedSubjects: Subject[] = useMemo(() =>
    subjects.map((cs) => {
      const topicCount = getTopicCountForSubject(selectedFormId, cs.id);
      const progress = getSubjectProgress(cs.id);
      return toSubject(cs, topicCount, progress.totalPacks > 0 ? progress : undefined);
    }),
  [subjects, selectedFormId, getSubjectProgress]);

  const filtered = useMemo(() => {
    let result = enrichedSubjects;
    if (filter === 'free') result = result.filter((s) => !s.isPremium);
    if (filter === 'premium') result = result.filter((s) => s.isPremium);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [enrichedSubjects, search, filter]);

  const handlePress = (subject: Subject) => {
    navigation.navigate('Topics', {
      subjectId: subject.id,
      subjectName: subject.name,
      color: subject.color,
      formId: selectedFormId,
    });
  };

  const progressSummaries = useMemo(
    () => subjects.map((cs) => getSubjectProgress(cs.id)),
    [subjects, getSubjectProgress],
  );

  const totalTopics = useMemo(
    () => subjects.reduce((sum, cs) => sum + getTopicCountForSubject(selectedFormId, cs.id), 0),
    [subjects, selectedFormId],
  );

  const filters: { label: string; value: Filter }[] = [
    { label: `All (${enrichedSubjects.length})`, value: 'all' },
    { label: 'Free', value: 'free' },
    { label: 'Premium', value: 'premium' },
  ];

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState message={error} onRetry={() => { clearError(); fetchSubjects(selectedFormId, true); }} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Subjects</Text>
          <Text style={styles.subtitle}>
            {selectedForm?.name ?? ''} · O-Level curriculum
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('FormSelectorModal')}
          style={styles.formBtn}
        >
          <Text style={styles.formBtnText}>{selectedForm?.name ?? 'Form'}</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Form chips */}
      <View style={styles.formChips}>
        <FormSelector
          forms={forms}
          selectedFormId={selectedFormId}
          onSelect={(f) => setSelectedForm(f.id)}
          mode="chips"
        />
      </View>

      {/* Progress card (only when data + progress exist) */}
      {progressSummaries.some((p) => p.completedPacks > 0) && (
        <View style={styles.progressCard}>
          <CurriculumProgressCard
            formName={selectedForm?.name ?? ''}
            subjectCount={subjects.length}
            totalTopics={totalTopics}
            summaries={progressSummaries}
          />
        </View>
      )}

      {/* Search + filter */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search subjects..."
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[styles.filterPill, filter === f.value && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {loadingSubjects ? (
        <View style={styles.list}>
          <SkeletonList count={6} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          ListEmptyComponent={
            search.trim() ? (
              <EmptyCurriculumState
                variant="subjects"
                formName={selectedForm?.name}
                onAction={() => setSearch('')}
              />
            ) : (
              <EmptyCurriculumState
                variant="subjects"
                formName={selectedForm?.name}
                onAction={handleRefresh}
              />
            )
          }
          renderItem={({ item }) => (
            <SubjectCard subject={item} onPress={handlePress} />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  headerLeft: { gap: 3 },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  subtitle: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  formBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(123,111,242,0.12)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  formBtnText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  formChips: { paddingBottom: SPACING.sm },
  progressCard: {
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.base,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.base,
    height: 48,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base },
  filterRow: { flexDirection: 'row', gap: SPACING.sm },
  filterPill: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  filterPillActive: {
    backgroundColor: 'rgba(123,111,242,0.2)',
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },
  list: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['2xl'],
  },
});
