import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { CurriculumForm } from '../../../types/curriculum';

interface FormSelectorProps {
  forms: CurriculumForm[];
  selectedFormId: string;
  onSelect: (form: CurriculumForm) => void;
  /** Inline mode (horizontal chips) vs full modal mode (large cards) */
  mode?: 'chips' | 'cards';
}

export function FormSelector({
  forms,
  selectedFormId,
  onSelect,
  mode = 'chips',
}: FormSelectorProps) {
  if (mode === 'chips') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {forms.map((form) => {
          const active = form.id === selectedFormId;
          return active ? (
            <LinearGradient
              key={form.id}
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chip}
            >
              <TouchableOpacity onPress={() => onSelect(form)} style={styles.chipInner}>
                <Text style={styles.chipTextActive}>{form.name}</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              key={form.id}
              onPress={() => onSelect(form)}
              style={styles.chipInactive}
            >
              <Text style={styles.chipText}>{form.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  // Cards mode — used in FormSelectorModal
  return (
    <View style={styles.cards}>
      {forms.map((form) => {
        const active = form.id === selectedFormId;
        return (
          <TouchableOpacity
            key={form.id}
            onPress={() => onSelect(form)}
            activeOpacity={0.8}
            style={[styles.formCard, active && styles.formCardActive]}
          >
            {active ? (
              <LinearGradient colors={GRADIENTS.primary} style={styles.formCardGrad}>
                <CardContent form={form} active />
              </LinearGradient>
            ) : (
              <View style={styles.formCardInner}>
                <CardContent form={form} active={false} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CardContent({ form, active }: { form: CurriculumForm; active: boolean }) {
  return (
    <>
      <View style={[styles.formIconBg, active && styles.formIconBgActive]}>
        <Text style={styles.formIcon}>{['①', '②', '③', '④'][form.order - 1]}</Text>
      </View>
      <View style={styles.formInfo}>
        <Text style={[styles.formName, active && styles.formNameActive]}>{form.name}</Text>
        <Text style={[styles.formDesc, active && styles.formDescActive]}>
          O-Level Year {form.order}
        </Text>
      </View>
      {active && (
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  chips: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.screenPadding,
  },
  chip: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  chipInner: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  chipInactive: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  chipTextActive: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  // Card mode
  cards: { gap: SPACING.sm },
  formCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  formCardActive: { borderColor: COLORS.primary },
  formCardGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
  },
  formCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
    backgroundColor: COLORS.bgCard,
  },
  formIconBg: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formIconBgActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  formIcon: { fontSize: 28 },
  formInfo: { flex: 1 },
  formName: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  formNameActive: { color: '#fff' },
  formDesc: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  formDescActive: { color: 'rgba(255,255,255,0.8)' },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
