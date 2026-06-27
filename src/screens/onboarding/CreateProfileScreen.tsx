import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList, FormLevel, AvatarId } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { createUserProfile } from '../../services/userService';
import { AVATARS } from '../../constants';

type Props = StackScreenProps<AuthStackParamList, 'CreateProfile'>;

const FORMS: FormLevel[] = [1, 2, 3, 4];

export function CreateProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [form, setForm] = useState<FormLevel | null>(null);
  const [school, setSchool] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('avatar_1');
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
      avatarId: selectedAvatar,
      selectedSubjectIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    // Persist locally (survives restart) and to Firestore users/{uid}.
    setProfile(profile);
    await createUserProfile(user, profile);
    setLoading(false);
    navigation.navigate('SubjectSelection');
  };

  return (
    <ScreenContainer scrollable gradient={GRADIENTS.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.step}>Step 1 of 2</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Create your{'\n'}profile</Text>
        <Text style={styles.subtitle}>Help us personalize your learning journey.</Text>

        {/* Avatar picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Choose your avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((av) => (
              <TouchableOpacity
                key={av.id}
                onPress={() => setSelectedAvatar(av.id as AvatarId)}
                style={[
                  styles.avatarItem,
                  selectedAvatar === av.id && styles.avatarSelected,
                ]}
              >
                {selectedAvatar === av.id ? (
                  <LinearGradient colors={GRADIENTS.primary} style={styles.avatarBg}>
                    <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.avatarBgPlain}>
                    <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Your name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Amara Diallo"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="words"
            maxLength={40}
          />
        </View>

        {/* Form selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Form level *</Text>
          <View style={styles.formRow}>
            {FORMS.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setForm(f)}
                style={[styles.formBtn, form === f && styles.formBtnActive]}
              >
                {form === f ? (
                  <LinearGradient colors={GRADIENTS.primary} style={styles.formBtnGrad}>
                    <Text style={styles.formBtnTextActive}>Form {f}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.formBtnText}>Form {f}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* School (optional) */}
        <View style={styles.section}>
          <Text style={styles.label}>School <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.input}
            value={school}
            onChangeText={setSchool}
            placeholder="e.g. Azania Secondary School"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="words"
            maxLength={60}
          />
          <Text style={styles.hint}>Used for leaderboard school rankings</Text>
        </View>

        <AppButton
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          loading={loading}
          variant="primary"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  back: { padding: SPACING.sm },
  step: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  content: { gap: SPACING.xl, paddingBottom: SPACING['2xl'] },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['3xl'] * 1.2,
  },
  subtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.base },
  section: { gap: SPACING.sm },
  label: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  optional: { color: COLORS.textMuted, textTransform: 'none', fontWeight: TYPOGRAPHY.weights.regular },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  avatarItem: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  avatarSelected: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarBg: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBgPlain: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 28 },
  input: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.base,
    height: 56,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  hint: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  formRow: { flexDirection: 'row', gap: SPACING.sm },
  formBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  formBtnActive: { borderColor: COLORS.primary, backgroundColor: 'transparent' },
  formBtnGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  formBtnText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  formBtnTextActive: { color: '#fff', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
});
