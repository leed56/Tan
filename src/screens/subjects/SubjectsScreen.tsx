import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { SubjectsStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SubjectCard } from '../../components/ui/SubjectCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { SUBJECTS } from '../../constants';
import type { Subject } from '../../types';

type Props = StackScreenProps<SubjectsStackParamList, 'Subjects'>;

type Filter = 'all' | 'free' | 'premium';

export function SubjectsScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    let result = SUBJECTS;
    if (filter === 'free') result = result.filter((s) => !s.isPremium);
    if (filter === 'premium') result = result.filter((s) => s.isPremium);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [search, filter]);

  const handlePress = (subject: Subject) => {
    navigation.navigate('Topics', {
      subjectId: subject.id,
      subjectName: subject.name,
      color: subject.color,
    });
  };

  const filters: { label: string; value: Filter }[] = [
    { label: 'All (13)', value: 'all' },
    { label: 'Free', value: 'free' },
    { label: 'Premium', value: 'premium' },
  ];

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>All Subjects</Text>
        <Text style={styles.subtitle}>O-Level curriculum · Form 1–4</Text>
      </View>

      {/* Search bar */}
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
            <Ionicons
              name="close-circle"
              size={18}
              color={COLORS.textMuted}
              onPress={() => setSearch('')}
            />
          )}
        </View>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <View
              key={f.value}
              style={[
                styles.filterPill,
                filter === f.value && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.value && styles.filterTextActive,
                ]}
                onPress={() => setFilter(f.value)}
              >
                {f.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No subjects found"
            description={`No subjects match "${search}". Try a different search.`}
            actionLabel="Clear search"
            onAction={() => setSearch('')}
          />
        }
        renderItem={({ item }) => (
          <SubjectCard subject={item} onPress={handlePress} />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.base,
    gap: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
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
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  filterPillActive: {
    backgroundColor: 'rgba(123, 111, 242, 0.2)',
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  list: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['2xl'],
  },
});
