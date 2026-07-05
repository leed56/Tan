import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList, FormLevel, AvatarId } from '../../types';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import {
  createUserProfile,
  updateSelectedSubjects as persistSelectedSubjects,
} from '../../services/userService';
import { AVATARS, SUBJECTS } from '../../constants';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<AuthStackParamList, 'CreateProfile'>;

const FORMS: FormLevel[] = [1, 2, 3, 4];

const FORM_META: Record<FormLevel, { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string }> = {
  1: { icon: 'leaf-outline', title: 'Form 1', sub: 'Start' },
  2: { icon: 'trending-up-outline', title: 'Form 2', sub: 'Grow' },
  3: { icon: 'flash-outline', title: 'Form 3', sub: 'Focus' },
  4: { icon: 'trophy-outline', title: 'Form 4', sub: 'Exam' },
};

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

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(22)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        tension: 70,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: 1,
          duration: 2300,
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 2300,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fade, slide, glow, heroFloat]);

  const handleContinue = async () => {
    if (!canContinue || !user || !form) return;

    setLoading(true);

    try {
      const selectedSubjectIds = SUBJECTS.map((s) => `form_${form}_${s.id}`);

      const profile = {
        uid: user.uid,
        name: name.trim(),
        form,
        school: school.trim() || null,
        avatarId: selectedAvatar,
        selectedSubjectIds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setProfile(profile);
      await createUserProfile(user, profile);
      await persistSelectedSubjects(user.uid, selectedSubjectIds);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const glowScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.16],
  });

  const floatingY = heroFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <LinearGradient
      colors={['#030712', '#07111F', '#11163D', '#071B36']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <View style={styles.auroraOne} />
      <View style={styles.auroraTwo} />
      <View style={styles.auroraThree} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fade,
                  transform: [{ translateY: slide }],
                },
              ]}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.stepPill}>
                  <Ionicons name="sparkles" size={13} color="#FDE68A" />
                  <Text style={styles.stepText}>Final step</Text>
                </View>
              </View>

              <View style={styles.hero}>
                <Animated.View
                  style={[
                    styles.heroGlow,
                    {
                      transform: [{ scale: glowScale }],
                    },
                  ]}
                />

                <Animated.View
                  style={[
                    styles.profilePreview,
                    {
                      transform: [{ translateY: floatingY }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0.08)']}
                    style={styles.previewGlass}
                  >
                    <LinearGradient
                      colors={GRADIENTS.primary}
                      style={styles.previewAvatar}
                    >
                      <Text style={styles.previewEmoji}>
                        {AVATARS.find((a) => a.id === selectedAvatar)?.emoji ?? '🎓'}
                      </Text>
                    </LinearGradient>

                    <View style={styles.previewText}>
                      <Text style={styles.previewName}>
                        {name.trim() || 'Your profile'}
                      </Text>
                      <Text style={styles.previewMeta}>
                        {form ? `Form ${form} Student` : 'Choose your form'}
                      </Text>
                    </View>

                    <View style={styles.previewBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#86EFAC" />
                    </View>
                  </LinearGradient>
                </Animated.View>

                <Text style={styles.title}>Build your learning profile</Text>
                <Text style={styles.subtitle}>
                  Soma will personalize subjects, progress, and practice for your level.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.label}>Avatar</Text>
                    <Text style={styles.sectionHint}>Pick one</Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.avatarScroll}
                  >
                    {AVATARS.map((av) => {
                      const selected = selectedAvatar === av.id;

                      return (
                        <TouchableOpacity
                          key={av.id}
                          onPress={() => setSelectedAvatar(av.id as AvatarId)}
                          activeOpacity={0.85}
                          style={styles.avatarTap}
                        >
                          {selected ? (
                            <LinearGradient
                              colors={GRADIENTS.primary}
                              style={styles.avatarSelected}
                            >
                              <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                              <View style={styles.avatarCheck}>
                                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                              </View>
                            </LinearGradient>
                          ) : (
                            <View style={styles.avatarPlain}>
                              <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Student name *</Text>
                  <View style={[styles.inputRow, nameFocused && styles.inputFocused]}>
                    <Ionicons
                      name="person-outline"
                      size={19}
                      color={nameFocused ? COLORS.primary : COLORS.textMuted}
                    />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      placeholder="e.g. Amara Diallo"
                      placeholderTextColor="rgba(255,255,255,0.36)"
                      autoCapitalize="words"
                      maxLength={40}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Form level *</Text>

                  <View style={styles.formGrid}>
                    {FORMS.map((f) => {
                      const selected = form === f;
                      const meta = FORM_META[f];

                      return (
                        <TouchableOpacity
                          key={f}
                          onPress={() => setForm(f)}
                          activeOpacity={0.86}
                          style={[styles.formCard, selected && styles.formCardActive]}
                        >
                          {selected ? (
                            <LinearGradient
                              colors={GRADIENTS.primary}
                              style={styles.formGradient}
                            >
                              <Ionicons name={meta.icon} size={22} color="#FFFFFF" />
                              <Text style={styles.formTitleActive}>{meta.title}</Text>
                              <Text style={styles.formSubActive}>{meta.sub}</Text>
                            </LinearGradient>
                          ) : (
                            <>
                              <View style={styles.formIconSoft}>
                                <Ionicons name={meta.icon} size={20} color="rgba(255,255,255,0.68)" />
                              </View>
                              <Text style={styles.formTitle}>{meta.title}</Text>
                              <Text style={styles.formSub}>{meta.sub}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>
                    School <Text style={styles.optional}>(optional)</Text>
                  </Text>

                  <View style={[styles.inputRow, schoolFocused && styles.inputFocused]}>
                    <Ionicons
                      name="school-outline"
                      size={19}
                      color={schoolFocused ? COLORS.primary : COLORS.textMuted}
                    />
                    <TextInput
                      style={styles.input}
                      value={school}
                      onChangeText={setSchool}
                      onFocus={() => setSchoolFocused(true)}
                      onBlur={() => setSchoolFocused(false)}
                      placeholder="e.g. Azania Secondary School"
                      placeholderTextColor="rgba(255,255,255,0.36)"
                      autoCapitalize="words"
                      maxLength={60}
                    />
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="rgba(255,255,255,0.48)" />
                    <Text style={styles.hint}>Used only to personalize school ranking features.</Text>
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <AppButton
                  title="Start Learning"
                  onPress={handleContinue}
                  disabled={!canContinue}
                  loading={loading}
                  variant="primary"
                  icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                />

                <Text style={styles.footerNote}>
                  All subjects for your form will be unlocked automatically.
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },

  safeArea: {
    flex: 1,
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },

  content: {
    gap: SPACING.xl,
  },

  auroraOne: {
    position: 'absolute',
    width: '125%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: 'rgba(99,102,241,0.24)',
    top: '-55%',
    left: '-40%',
  },

  auroraTwo: {
    position: 'absolute',
    width: '95%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: 'rgba(6,182,212,0.15)',
    top: '45%',
    right: '-45%',
  },

  auroraThree: {
    position: 'absolute',
    width: '90%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: 'rgba(251,191,36,0.09)',
    bottom: '-46%',
    left: '-34%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },

  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },

  stepText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  hero: {
    alignItems: 'center',
  },

  heroGlow: {
    position: 'absolute',
    top: 6,
    width: 210,
    height: 150,
    borderRadius: 90,
    backgroundColor: 'rgba(124,58,237,0.25)',
  },

  profilePreview: {
    width: '100%',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },

  previewGlass: {
    minHeight: 104,
    borderRadius: 32,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  previewAvatar: {
    width: 72,
    height: 72,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewEmoji: {
    fontSize: 34,
  },

  previewText: {
    flex: 1,
    marginLeft: SPACING.base,
  },

  previewName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  previewMeta: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.58)',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  previewBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34,197,94,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(134,239,172,0.24)',
  },

  title: {
    color: '#FFFFFF',
    fontSize: width < 380 ? 34 : 40,
    lineHeight: width < 380 ? 40 : 46,
    fontWeight: '900',
    letterSpacing: -1.6,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: SPACING.sm,
    color: 'rgba(255,255,255,0.68)',
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 23,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
    maxWidth: 340,
  },

  card: {
    gap: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 14,
  },

  section: {
    gap: SPACING.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  sectionHint: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  optional: {
    color: 'rgba(255,255,255,0.44)',
    textTransform: 'none',
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  avatarScroll: {
    gap: SPACING.sm,
    paddingRight: SPACING.md,
    paddingVertical: 2,
  },

  avatarTap: {
    borderRadius: RADIUS.full,
  },

  avatarSelected: {
    width: 68,
    height: 68,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 10,
  },

  avatarPlain: {
    width: 68,
    height: 68,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarEmoji: {
    fontSize: 31,
  },

  avatarCheck: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: '#07111F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputRow: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.4,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(123,111,242,0.13)',
  },

  input: {
    flex: 1,
    height: '100%',
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.sm,
  },

  formCard: {
    width: '48%',
    height: 98,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },

  formCardActive: {
    borderColor: 'rgba(255,255,255,0.25)',
  },

  formGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  formIconSoft: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  formTitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '900',
  },

  formSub: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  formTitleActive: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '900',
  },

  formSubActive: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  hint: {
    flex: 1,
    color: 'rgba(255,255,255,0.46)',
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 17,
  },

  footer: {
    gap: SPACING.sm,
  },

  footerNote: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
