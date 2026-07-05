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
      school: null,
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

        <View style={styles.hero}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroIcon}>
            <Ionicons name="person-add" size={34} color={COLORS.textPrimary} />
          </LinearGradient>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={14} color={COLORS.gold} />
            <Text style={styles.badgeText}>Personalize learning</Text>
          </View>
          <Text style={styles.title}>Create student profile.</Text>
          <Text style={styles.subtitle}>Enter the student name and select the current Form level. Soma AI will prepare the learning path next.</Text>
        </View>

        <LinearGradient colors={['rgba(123,111,242,0.18)', 'rgba(74,144,217,0.06)']} style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Student name</Text>
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
            <Text style={styles.label}>Select Form</Text>
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
        </LinearGradient>

        <View style={styles.previewBox}>
          <View style={styles.previewIcon}><Ionicons name="school" size={22} color={COLORS.primaryLight} /></View>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl },
  back: { width: 44, height: 44, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  stepPill: { minHeight: 34, justifyContent: 'center', paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.glassBg, borderWidth: 1, borderColor: COLORS.glassBorder },
  step: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  hero: { gap: SPACING.md, marginBottom: SPACING['2xl'] },
  heroIcon: { width: 74, height: 74, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 12 },
  badge: { alignSelf: 'flex-start', minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(247,197,46,0.24)', backgroundColor: 'rgba(247,197,46,0.1)' },
  badgeText: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { color: COLORS.textPrimary, fontSize: 40, lineHeight: 45, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: -0.8 },
  subtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.md, lineHeight: TYPOGRAPHY.sizes.md * 1.55 },
  card: { gap: SPACING.xl, padding: SPACING.lg, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', marginBottom: SPACING.lg },
  fieldGroup: { gap: SPACING.sm },
  label: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, textTransform: 'uppercase', letterSpacing: 0.8 },
  inputShell: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: 'rgba(10,14,39,0.42)', borderRadius: RADIUS.xl, borderWidth: 1.5, borderColor: COLORS.glassBorder, paddingHorizontal: SPACING.base },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.medium },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  formButton: { width: '48%', minHeight: 56, borderRadius: RADIUS.xl, borderWidth: 1.5, borderColor: COLORS.glassBorder, backgroundColor: 'rgba(10,14,39,0.42)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  formButtonActive: { borderColor: COLORS.primary, backgroundColor: 'transparent' },
  formGradient: { width: '100%', height: '100%', minHeight: 56, alignItems: 'center', justifyContent: 'center' },
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
