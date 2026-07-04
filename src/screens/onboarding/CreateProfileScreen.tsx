import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
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
import { createUserProfile, updateSelectedSubjects as persistSelectedSubjects } from '../../services/userService';
import { AVATARS, SUBJECTS } from '../../constants';

type Props = StackScreenProps<AuthStackParamList, 'CreateProfile'>;

const FORM_META: Record<FormLevel, { icon: keyof typeof Ionicons.glyphMap }> = {
  1: { icon: 'leaf-outline' },
  2: { icon: 'trending-up-outline' },
  3: { icon: 'flash-outline' },
  4: { icon: 'trophy-outline' },
};
const FORMS: FormLevel[] = [1, 2, 3, 4];

export function CreateProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [form, setForm] = useState<FormLevel | null>(null);
  const [school, setSchool] = useState('');
  const [schoolFocused, setSchoolFocused] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('avatar_1');
  const [loading, setLoading] = useState(false);

  const user = useAuthStore((s) => s.user);
  const setProfile = useProfileStore((s) => s.setProfile);
  const setUser = useAuthStore((s) => s.setUser);

  const canContinue = name.trim().length >= 2 && form !== null;

  // Gentle entrance so the form doesn't just pop in after the Welcome screen.
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const handleContinue = async () => {
    if (!canContinue || !user) return;
    setLoading(true);
    // All subjects are available by default — no separate selection step.
    // selectedSubjectIds must stay non-empty (RootNavigator treats an empty
    // list as "onboarding incomplete"), so seed it with every subject id
    // scoped to the student's form.
    const selectedSubjectIds = SUBJECTS.map((s) => `form_${form}_${s.id}`);
    const profile = {
      uid: user.uid,
      name: name.trim(),
      form: form!,
      school: school.trim() || null,
      avatarId: selectedAvatar,
      selectedSubjectIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    // Persist locally (survives restart) and to Firestore users/{uid}.
    setProfile(profile);
    await createUserProfile(user, profile);
    await persistSelectedSubjects(user.uid, selectedSubjectIds);
    setLoading(false);
    // Authenticate into the app — RootNavigator switches stacks automatically.
    setUser(user);
  };

  return (
    <ScreenContainer scrollable gradient={GRADIENTS.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.stepPill}>
          <Ionicons name="checkmark-circle" size={13} color={COLORS.success} />
          <Text style={styles.step}>Last step</Text>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={styles.title}>Create your{'\n'}profile</Text>
        <Text style={styles.subtitle}>Help us personalize your learning journey.</Text>

        {/* Avatar picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Choose your avatar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarScroll}>
            {AVATARS.map((av) => {
              const isSelected = selectedAvatar === av.id;
              return (
                <TouchableOpacity
                  key={av.id}
                  onPress={() => setSelectedAvatar(av.id as AvatarId)}
                  activeOpacity={0.85}
                  style={styles.avatarItem}
                >
                  {isSelected ? (
                    <LinearGradient colors={GRADIENTS.primary} style={[styles.avatarBg, styles.avatarSelected]}>
                      <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                      <View style={styles.avatarCheck}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={styles.avatarBgPlain}>
                      <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Your name *</Text>
          <View style={[styles.inputRow, nameFocused && styles.inputRowFocused]}>
            <Ionicons name="person-outline" size={18} color={nameFocused ? COLORS.primary : COLORS.textMuted} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="e.g. Amara Diallo"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              maxLength={40}
            />
          </View>
        </View>

        {/* Form selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Form level *</Text>
          <View style={styles.formRow}>
            {FORMS.map((f) => {
              const isSelected = form === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setForm(f)}
                  activeOpacity={0.85}
                  style={[styles.formBtn, isSelected && styles.formBtnActive]}
                >
                  {isSelected ? (
                    <LinearGradient colors={GRADIENTS.primary} style={styles.formBtnGrad}>
                      <Ionicons name={FORM_META[f].icon} size={18} color="#fff" />
                      <Text style={styles.formBtnTextActive}>Form {f}</Text>
                    </LinearGradient>
                  ) : (
                    <>
                      <Ionicons name={FORM_META[f].icon} size={18} color={COLORS.textMuted} />
                      <Text style={styles.formBtnText}>Form {f}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* School (optional) */}
        <View style={styles.section}>
          <Text style={styles.label}>School <Text style={styles.optional}>(optional)</Text></Text>
          <View style={[styles.inputRow, schoolFocused && styles.inputRowFocused]}>
            <Ionicons name="school-outline" size={18} color={schoolFocused ? COLORS.primary : COLORS.textMuted} />
            <TextInput
              style={styles.input}
              value={school}
              onChangeText={setSchool}
              onFocus={() => setSchoolFocused(true)}
              onBlur={() => setSchoolFocused(false)}
              placeholder="e.g. Azania Secondary School"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              maxLength={60}
            />
          </View>
          <Text style={styles.hint}>Used for leaderboard school rankings</Text>
        </View>

        <AppButton
          title="Start Learning 🚀"
          onPress={handleContinue}
          disabled={!canContinue}
          loading={loading}
          variant="primary"
        />
      </Animated.View>
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
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.success}15`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  step: { color: COLORS.success, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
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
  avatarScroll: { gap: SPACING.sm, paddingRight: SPACING.sm },
  avatarItem: {
    borderRadius: RADIUS.full,
  },
  avatarSelected: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarBg: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBgPlain: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 30 },
  avatarCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.base,
    height: 56,
  },
  inputRowFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(123,111,242,0.06)',
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    height: '100%',
  },
  hint: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  formRow: { flexDirection: 'row', gap: SPACING.sm },
  formBtn: {
    flex: 1,
    height: 64,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  formBtnActive: { borderColor: COLORS.primary, backgroundColor: 'transparent' },
  formBtnGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', gap: 4 },
  formBtnText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  formBtnTextActive: { color: '#fff', fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
});
