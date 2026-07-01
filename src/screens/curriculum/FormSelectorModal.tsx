import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AppRootStackParamList } from '../../types';
import { FormSelector } from '../../components/ui/curriculum/FormSelector';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useCurriculumStore } from '../../store/curriculumStore';
import type { CurriculumForm } from '../../types/curriculum';

type Props = StackScreenProps<AppRootStackParamList, 'FormSelectorModal'>;

const FORM_DESCRIPTIONS: Record<string, { desc: string; topics: string[] }> = {
  form_1: {
    desc: 'Foundation year — building core concepts across all subjects.',
    topics: ['Numbers & Algebra', 'Grammar Basics', 'Cell Biology', 'Map Reading'],
  },
  form_2: {
    desc: 'Building on fundamentals with more advanced applications.',
    topics: ['Linear Equations', 'Essay Writing', 'Nutrition', 'Colonialism'],
  },
  form_3: {
    desc: 'Deeper exploration of complex topics and critical thinking.',
    topics: ['Trigonometry', 'Literature Analysis', 'Genetics', 'Nationalism'],
  },
  form_4: {
    desc: 'NECTA preparation — mastering all topics for the national exam.',
    topics: ['Calculus', 'Advanced Writing', 'Human Physiology', 'NECTA Revision'],
  },
};

export function FormSelectorModal({ navigation }: Props) {
  const { forms, selectedFormId, setSelectedForm } = useCurriculumStore();
  const insets = useSafeAreaInsets();

  const handleSelect = (form: CurriculumForm) => {
    setSelectedForm(form.id);
    navigation.goBack();
  };

  const selectedForm = forms.find((f) => f.id === selectedFormId) ?? forms[0];
  const meta = FORM_DESCRIPTIONS[selectedFormId];

  return (
    <View style={styles.root}>
      {/* Dim overlay tap to close */}
      <TouchableOpacity style={styles.backdrop} onPress={() => navigation.goBack()} />

      <View style={[styles.sheet, { paddingBottom: SPACING['3xl'] + insets.bottom }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Select Your Form</Text>
            <Text style={styles.subtitle}>
              Currently: <Text style={styles.current}>{selectedForm.name}</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
        >
          <FormSelector
            forms={forms}
            selectedFormId={selectedFormId}
            onSelect={handleSelect}
            mode="cards"
          />

          {/* Info card about selected form */}
          {meta && (
            <LinearGradient
              colors={['rgba(123,111,242,0.15)', 'rgba(123,111,242,0.05)']}
              style={styles.infoCard}
            >
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={18} color={COLORS.primary} />
                <Text style={styles.infoTitle}>{selectedForm.name} Overview</Text>
              </View>
              <Text style={styles.infoDesc}>{meta.desc}</Text>
              <View style={styles.sampleTopics}>
                {meta.topics.map((t) => (
                  <View key={t} style={styles.topicChip}>
                    <Text style={styles.topicChipText}>{t}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          )}

          {/* Notice */}
          <View style={styles.notice}>
            <Ionicons name="alert-circle-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.noticeText}>
              Your progress is saved per form. Switching forms shows different subjects and topics.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    borderTopWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingBottom: SPACING['3xl'],
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.textDisabled,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.base,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
  },
  current: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold },
  closeBtn: {
    padding: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.base,
    paddingBottom: SPACING.base,
  },
  infoCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(123,111,242,0.25)',
    gap: SPACING.sm,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  infoTitle: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  infoDesc: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
  },
  sampleTopics: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  topicChip: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  topicChipText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  noticeText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: TYPOGRAPHY.sizes.xs * 1.6,
  },
});
