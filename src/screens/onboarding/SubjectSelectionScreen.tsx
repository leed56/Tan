import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { AppButton } from '../../components/ui/AppButton';
import { SubjectCard } from '../../components/ui/SubjectCard';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { SUBJECTS } from '../../constants';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { updateSelectedSubjects as persistSelectedSubjects } from '../../services/userService';
import type { Subject } from '../../types';

type Props = StackScreenProps<AuthStackParamList, 'SubjectSelection'>;

const MIN_SELECTION = 2;

// SUBJECTS use bare ids (e.g. "mathematics"); the DB uses form-scoped ids
// (e.g. "form_1_mathematics"). Convert between the two so the UI stays simple
// while persisted ids match the curriculum collections.
const toBareId = (id: string) => id.replace(/^form_\d+_/, '');
const toScopedId = (form: number, id: string) => `form_${form}_${toBareId(id)}`;

export function SubjectSelectionScreen({ navigation }: Props) {
  const profile = useProfileStore((s) => s.profile);
  const updateSelectedSubjects = useProfileStore((s) => s.updateSelectedSubjects);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const [selected, setSelected] = useState<Set<string>>(
    new Set((profile?.selectedSubjectIds ?? []).map(toBareId)),
  );
  const [saving, setSaving] = useState(false);

  const toggle = (subject: Subject) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(subject.id)) next.delete(subject.id);
      else next.add(subject.id);
      return next;
    });
  };

  const handleStart = async () => {
    setSaving(true);
    // Store DB-compatible form-scoped ids based on the student's form.
    const form = profile?.form ?? 1;
    const scopedIds = Array.from(selected).map((id) => toScopedId(form, id));
    updateSelectedSubjects(scopedIds);
    if (user) await persistSelectedSubjects(user.uid, scopedIds);
    // Authenticate user into the app
    if (user) setUser(user);
    setSaving(false);
  };

  const canStart = selected.size >= MIN_SELECTION;

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        {/* After an OTP-flow reset this can be the only route in the stack —
            hide the arrow rather than render a back button that does nothing. */}
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.back} />
        )}
        <Text style={styles.step}>Step 2 of 2</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Choose your{'\n'}subjects</Text>
        <Text style={styles.subtitle}>
          Select at least {MIN_SELECTION} subjects to start.{' '}
          <Text style={styles.selectedCount}>{selected.size} selected</Text>
        </Text>
      </View>

      <FlatList
        data={SUBJECTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        renderItem={({ item }) => (
          <SubjectCard
            subject={item}
            onPress={toggle}
            isSelected={selected.has(item.id)}
            showProgress={false}
          />
        )}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* Sticky CTA */}
      <View style={styles.footer}>
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {canStart
              ? `${selected.size} subjects selected — ready to go!`
              : `Select ${MIN_SELECTION - selected.size} more to continue`}
          </Text>
        </View>
        <AppButton
          title="Start Learning 🚀"
          onPress={handleStart}
          disabled={!canStart}
          loading={saving}
          variant="primary"
        />
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING['3xl'],
    marginBottom: SPACING.base,
  },
  back: { padding: SPACING.sm },
  step: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  titleBlock: {
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.base,
    gap: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['3xl'] * 1.2,
  },
  subtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.base },
  selectedCount: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },
  list: {
    paddingHorizontal: SPACING.screenPadding,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    padding: SPACING.base,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  selectionInfo: {
    alignItems: 'center',
  },
  selectionText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
