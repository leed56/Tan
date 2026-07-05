import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList, FormLevel } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { createUserProfile } from '../../services/userService';

type Props = StackScreenProps<AuthStackParamList, 'CreateProfile'>;

const FORMS: FormLevel[] = [1, 2, 3, 4];

export function CreateProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [form, setForm] = useState<FormLevel | null>(null);
  const [school, setSchool] = useState('');
  const [loading, setLoading] = useState(false);

  const user = useAuthStore((s) => s.user);
  const setProfile = useProfileStore((s) => s.setProfile);

  const canContinue = name.trim().length >= 2 && form !== null;

  const handleContinue = async () => {
    if (!canContinue || !user) return;
    setLoading(true);
    const profile = {
      uid: user.uid,
      name: name.trim(),
      form: form!,
      school: school.trim() || null,
      avatarId: 'avatar_1' as const,
      selectedSubjectIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProfile(profile);
    await createUserProfile(user, profile);
    setLoading(false);
    navigation.navigate('SubjectSelection');
  };

  return (
    <ScreenContainer scrollable keyboardAvoiding gradient={GRADIENTS.background}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.stepPill}><Text style={styles.step}>Step 1 of 2</Text></View>
        </View>

        <LinearGradient colors={['rgba(123,111,242,0.26)', 'rgba(74,144,217,0.08)']} style={styles.heroCard}>
          <View style={styles.heroTop}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.heroIcon}>
              <Ionicons name="person-add" size={34} color={COLORS.textPrimary} />
            </LinearGradient>
            <View style={styles.heroMiniCard}>
              <Ionicons name="school" size={18} color={COLORS.gold} />
              <Text style={styles.heroMiniText}>Student setup</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={14} color={COLORS.gold} />
            <Text style={styles.badgeText}>Personalize learning</Text>
          </View>
          <Text style={styles.title}>Create student profile.</Text>
          <Text style={styles.subtitle}>Add the student name, Form level, and school if available. Soma AI will prepare the learning path next.</Text>
        </LinearGradient>

        <View style={styles.cardShadow}>
          <LinearGradient colors={['rgba(255,255,255,0.095)', 'rgba(255,255,255,0.045)']} style={styles.card}>
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Student name</Text>
                <Text style={styles.required}>Required</Text>
              </View>
              <View style={styles.inputShell}>
                <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Amara Diallo"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                  maxLength={40}
                  accessibilityLabel="Student name"
                />
                {name.trim().length >= 2 && <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Select Form</Text>
                <Text style={styles.required}>Required</Text>
              </View>
              <View style={styles.formGrid}>
                {FORMS.map((f) => {
                  const selected = form === f;
                  return (
                    <Pressable
                      key={f}
                      onPress={() => setForm(f)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select Form ${f}`}
                      accessibilityState={{ selected }}
                      style={[styles.formButton, selected && styles.formButtonActive]}
                    >
                      {selected ? (
                        <LinearGradient colors={GRADIENTS.primary} style={styles.formGradient}>
                          <Text style={styles.formTextActive}>Form {f}</Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.formText}>Form {f}</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>School</Text>
                <Text style={styles.optional}>Optional</Text>
              </View>
              <View style={styles.inputShell}>
                <Ionicons name="business-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={school}
                  onChangeText={setSchool}
                  placeholder="e.g. Azania Secondary School"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                  maxLength={60}
                  accessibilityLabel="School name optional"
                />
              </View>
              <Text style={styles.hint}>Used later for school ranking and progress insights.</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.previewBox}>
          <View style={styles.previewIcon}><Ionicons name="layers" size={22} color={COLORS.primaryLight} /></View>
          <View style={styles.previewCopy}>
            <Text style={styles.previewTitle}>Next: choose subjects</Text>
            <Text style={styles.previewText}>After this, the student can select learning subjects for the selected Form.</Text>
          </View>
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!canContinue || loading}
          accessibilityRole="button"
          accessibilityLabel="Continue to subject selection"
          accessibilityState={{ disabled: !canContinue || loading }}
          style={[styles.continueButton, (!canContinue || loading) && styles.disabled]}
        >
          <LinearGradient
            colors={!canContinue || loading ? [COLORS.textDisabled, COLORS.textMuted] : ['#9B8CF9', '#7B6FF2', '#4A90D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>{loading ? 'Saving profile...' : 'Continue'}</Text>
            <View style={styles.arrow}><Ionicons name="arrow-forward" size={20} color={COLORS.primaryDark} /></View>
          </LinearGradient>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', paddingBottom: SPACING['3xl'] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  back: { width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  stepPill: { minHeight: 34, justifyContent: 'center', paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  step: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  heroCard: { gap: SPACING.md, padding: SPACING.lg, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', marginBottom: SPACING.lg, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 12 },
  heroMiniCard: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: 'rgba(10,14,39,0.34)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heroMiniText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold },
  badge: { alignSelf: 'flex-start', minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(247,197,46,0.24)', backgroundColor: 'rgba(247,197,46,0.1)' },
  badgeText: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { color: COLORS.textPrimary, fontSize: 38, lineHeight: 43, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: -0.8 },
  subtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.md, lineHeight: TYPOGRAPHY.sizes.md * 1.55 },
  cardShadow: { borderRadius: 30, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 9, marginBottom: SPACING.lg },
  card: { gap: SPACING.xl, padding: SPACING.lg, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  fieldGroup: { gap: SPACING.sm },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md },
  label: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, textTransform: 'uppercase', letterSpacing: 0.8 },
  required: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  optional: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  inputShell: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: 'rgba(10,14,39,0.42)', borderRadius: RADIUS.xl, borderWidth: 1.5, borderColor: COLORS.glassBorder, paddingHorizontal: SPACING.base },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.medium },
  hint: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, lineHeight: TYPOGRAPHY.sizes.xs * 1.45 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  formButton: { width: '48%', minHeight: 58, borderRadius: RADIUS.xl, borderWidth: 1.5, borderColor: COLORS.glassBorder, backgroundColor: 'rgba(10,14,39,0.42)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  formButtonActive: { borderColor: COLORS.primary, backgroundColor: 'transparent' },
  formGradient: { width: '100%', height: '100%', minHeight: 58, alignItems: 'center', justifyContent: 'center' },
  formText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold },
  formTextActive: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  previewBox: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glassBg, marginBottom: SPACING.lg },
  previewIcon: { width: 46, height: 46, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(123,111,242,0.14)' },
  previewCopy: { flex: 1, minWidth: 0 },
  previewTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  previewText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: TYPOGRAPHY.sizes.sm * 1.45, marginTop: 2 },
  continueButton: { minHeight: 62, borderRadius: RADIUS.xl, overflow: 'hidden', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.34, shadowRadius: 22, elevation: 12 },
  disabled: { opacity: 0.72, shadowOpacity: 0 },
  continueGradient: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md, paddingHorizontal: SPACING.xl },
  continueText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.extrabold },
  arrow: { width: 34, height: 34, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
});
