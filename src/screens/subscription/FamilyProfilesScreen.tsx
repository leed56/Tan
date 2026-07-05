import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ProfileStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { confirmAction, notify } from '../../utils/confirm';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { AVATARS } from '../../constants';
import { useFamilyStore } from '../../store/familyStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { getLevelProgress } from '../../utils/xpUtils';
import type { ChildProfile } from '../../types/subscription';

type Props = StackScreenProps<ProfileStackParamList, 'FamilyProfiles'>;

interface FamilyMember {
  key: string;
  isOwner: boolean;
  name: string;
  avatarEmoji: string;
  form: number | null;
  xp: number;
  level: number;
  streakDays: number;
  weekXp: number;
  child: ChildProfile | null;
}

function avatarEmoji(avatarId: string): string {
  return AVATARS.find((a) => a.id === avatarId)?.emoji ?? '🎓';
}

export function FamilyProfilesScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const ownerProfile = useProfileStore((s) => s.profile);
  const { xp: ownerXp, level: ownerLevel, streak: ownerStreak } = useGamificationStore();
  const { profiles, loading, startListening, addProfile, removeProfile } = useFamilyStore();
  const activeChildId = useFamilyStore((s) => s.activeChildId);
  const switchToChild = useFamilyStore((s) => s.switchToChild);
  const switchToPrimary = useFamilyStore((s) => s.switchToPrimary);
  const { planMaxProfiles } = useSubscriptionStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0].id);
  const [formLevel, setFormLevel] = useState<number | null>(null);

  const maxProfiles = planMaxProfiles();
  const maxChildren = Math.max(0, maxProfiles - 1);

  useEffect(() => {
    if (user?.uid) startListening(user.uid);
  }, [user?.uid, startListening]);

  const members: FamilyMember[] = [
    {
      key: 'owner',
      isOwner: true,
      name: ownerProfile?.name ?? 'You',
      avatarEmoji: ownerProfile ? avatarEmoji(ownerProfile.avatarId) : '👤',
      form: ownerProfile?.form ?? null,
      xp: ownerXp,
      level: ownerLevel,
      streakDays: ownerStreak,
      weekXp: -1, // owner's weekly XP isn't tracked in this aggregate view
      child: null,
    },
    ...profiles.map((p) => ({
      key: p.id,
      isOwner: false,
      name: p.name,
      avatarEmoji: avatarEmoji(p.avatarId),
      form: p.form,
      xp: p.xp,
      level: p.level,
      streakDays: p.streakDays,
      weekXp: p.weekXp,
      child: p,
    })),
  ];

  const mvp = [...profiles].sort((a, b) => b.weekXp - a.weekXp)[0];

  const handleAdd = async () => {
    if (!user?.uid) return;
    if (name.trim().length === 0) {
      notify('Name required', "Please enter the student's name.");
      return;
    }
    if (profiles.length >= maxChildren) {
      notify('Profile limit reached', `Your plan allows ${maxChildren} student profiles.`);
      return;
    }
    await addProfile(user.uid, name.trim(), selectedAvatar, formLevel);
    setName('');
    setSelectedAvatar(AVATARS[0].id);
    setFormLevel(null);
    setShowAdd(false);
  };

  const handleRemove = (childId: string, childName: string) => {
    confirmAction(
      'Remove profile',
      `Remove ${childName}'s profile? Their progress will be lost.`,
      'Remove',
      () => removeProfile(childId),
    );
  };

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient colors={[`${COLORS.primary}18`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Family Pack</Text>
        <Text style={styles.headerTitle}>Family Hub</Text>
        <View style={styles.slotPill}>
          <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.slotText}>{profiles.length + 1} / {maxProfiles} profiles used</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Family MVP of the week */}
        {mvp && mvp.weekXp > 0 && (
          <LinearGradient colors={GRADIENTS.gold} style={styles.mvpCard}>
            <Ionicons name="trophy" size={22} color="#1A1A1A" />
            <View style={{ flex: 1 }}>
              <Text style={styles.mvpTitle}>Family MVP this week</Text>
              <Text style={styles.mvpName}>{avatarEmoji(mvp.avatarId)} {mvp.name} · +{mvp.weekXp} XP</Text>
            </View>
          </LinearGradient>
        )}

        {/* Member cards */}
        {members.map((m) => (
          <MemberCard
            key={m.key}
            member={m}
            isActive={m.isOwner ? activeChildId === null : activeChildId === m.key}
            onSwitch={() => (m.isOwner ? switchToPrimary() : switchToChild(m.key))}
            onRemove={m.child ? () => handleRemove(m.child!.id, m.name) : undefined}
          />
        ))}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, maxChildren - profiles.length) }).map((_, i) => (
          <TouchableOpacity
            key={`empty_${i}`}
            style={styles.emptySlot}
            onPress={() => setShowAdd(true)}
            activeOpacity={0.7}
          >
            <View style={styles.emptyIcon}>
              <Ionicons name="add" size={22} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptySlotText}>Add student profile</Text>
          </TouchableOpacity>
        ))}

        {profiles.length < maxChildren && (
          <AppButton
            title="Add Student Profile"
            onPress={() => setShowAdd(true)}
            variant="secondary"
            icon={<Ionicons name="person-add-outline" size={18} color={COLORS.primary} />}
          />
        )}

        <Text style={styles.hint}>
          Student profiles share your Family Pack subscription — no separate
          login needed. Tap "Play as" to switch who's earning XP; each
          profile keeps its own level, streak and weekly progress.
        </Text>
      </ScrollView>

      {/* Add member modal */}
      <Modal
        visible={showAdd}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAdd(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setShowAdd(false)} />
        <View style={styles.addSheet}>
          <View style={styles.handle} />
          <Text style={styles.addTitle}>Add Student Profile</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Amina Hassan"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.avatarOption, selectedAvatar === a.id && styles.avatarOptionSelected]}
                  onPress={() => setSelectedAvatar(a.id)}
                >
                  <Text style={styles.avatarEmoji}>{a.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Form level (optional)</Text>
            <View style={styles.formRow}>
              {[1, 2, 3, 4].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.formChip, formLevel === f && styles.formChipSelected]}
                  onPress={() => setFormLevel(formLevel === f ? null : f)}
                >
                  <Text style={[styles.formChipText, formLevel === f && styles.formChipTextSelected]}>
                    Form {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <AppButton
            title={loading ? 'Adding...' : 'Add Profile'}
            onPress={handleAdd}
            loading={loading}
            variant="primary"
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function MemberCard({
  member,
  isActive,
  onSwitch,
  onRemove,
}: {
  member: FamilyMember;
  isActive: boolean;
  onSwitch: () => void;
  onRemove?: () => void;
}) {
  const progress = getLevelProgress(member.xp);
  return (
    <View style={[styles.memberCard, isActive && styles.memberCardActive]}>
      <View style={styles.memberTop}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarCircleEmoji}>{member.avatarEmoji}</Text>
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{member.name}</Text>
            {member.isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>OWNER</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberDetail}>
            {member.form ? `Form ${member.form} · ` : ''}Level {member.level}
            {member.weekXp >= 0 ? ` · +${member.weekXp} XP this week` : ''}
          </Text>
        </View>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.xpBarTrack}>
        <View style={[styles.xpBarFill, { width: `${progress.percent}%` }]} />
      </View>

      <View style={styles.memberBottomRow}>
        <View style={styles.streakChip}>
          <Ionicons name="flame" size={13} color={COLORS.warning} />
          <Text style={styles.streakChipText}>{member.streakDays}d streak</Text>
        </View>
        <TouchableOpacity
          style={[styles.switchBtn, isActive && styles.switchBtnActive]}
          onPress={onSwitch}
          disabled={isActive}
        >
          <Ionicons
            name={isActive ? 'checkmark-circle' : 'play-circle-outline'}
            size={15}
            color={isActive ? COLORS.success : COLORS.primary}
          />
          <Text style={[styles.switchBtnText, isActive && styles.switchBtnTextActive]}>
            {isActive ? 'Playing now' : 'Play as'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING['2xl'],
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  back: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.sm },
  headerLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  slotText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.sm,
  },
  mvpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.xs,
  },
  mvpTitle: { color: 'rgba(0,0,0,0.65)', fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  mvpName: { color: '#1A1A1A', fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold, marginTop: 2 },
  memberCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    gap: SPACING.sm,
  },
  memberCardActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}0A` },
  memberTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgCardLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarCircleEmoji: { fontSize: 22 },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  memberDetail: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  ownerBadge: {
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
  },
  ownerBadgeText: { color: COLORS.primary, fontSize: 9, fontWeight: TYPOGRAPHY.weights.bold },
  xpBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.bgCardLight,
    overflow: 'hidden',
  },
  xpBarFill: { height: '100%', borderRadius: 3, backgroundColor: COLORS.primary },
  memberBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakChipText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  switchBtnActive: { backgroundColor: `${COLORS.success}15`, borderColor: `${COLORS.success}30` },
  switchBtnText: { color: COLORS.primary, fontSize: 11, fontWeight: TYPOGRAPHY.weights.semibold },
  switchBtnTextActive: { color: COLORS.success },
  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'transparent',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emptySlotText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  hint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.xs * 1.6,
    marginTop: SPACING.sm,
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  addSheet: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.glassBorder,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  addTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
  },
  field: { gap: 6 },
  fieldLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm },
  fieldInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  avatarOptionSelected: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}15` },
  avatarEmoji: { fontSize: 20 },
  formRow: { flexDirection: 'row', gap: SPACING.sm },
  formChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgCard,
  },
  formChipSelected: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}15` },
  formChipText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm },
  formChipTextSelected: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },
});
