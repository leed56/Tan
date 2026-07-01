import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ProfileStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import { useFamilyStore } from '../../store/familyStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useAuthStore } from '../../store/authStore';
import type { FamilyProfile } from '../../types/subscription';

type Props = StackScreenProps<ProfileStackParamList, 'FamilyProfiles'>;

export function FamilyProfilesScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const { profiles, loading, fetchProfiles, addMember } = useFamilyStore();
  const { planMaxProfiles } = useSubscriptionStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formLevel, setFormLevel] = useState('');

  const maxProfiles = planMaxProfiles();

  useEffect(() => {
    if (user?.uid) fetchProfiles(user.uid);
  }, [user?.uid, fetchProfiles]);

  const handleAdd = async () => {
    if (!user?.uid) return;
    if (name.trim().length === 0) {
      Alert.alert('Name required', 'Please enter the member\'s name.');
      return;
    }
    if (profiles.length >= maxProfiles - 1) {
      Alert.alert('Profile limit reached', `Your plan allows ${maxProfiles} profiles including yours.`);
      return;
    }
    await addMember(user.uid, name.trim(), phone.trim() || null, formLevel ? parseInt(formLevel, 10) : null);
    setName('');
    setPhone('');
    setFormLevel('');
    setShowAdd(false);
  };

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient colors={[`${COLORS.primary}18`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Family Pack</Text>
        <Text style={styles.headerTitle}>Family Profiles</Text>
        <View style={styles.slotPill}>
          <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.slotText}>{profiles.length + 1} / {maxProfiles} profiles used</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Owner card */}
        <View style={styles.memberCard}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={COLORS.textPrimary} />
          </LinearGradient>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>You (Owner)</Text>
            <Text style={styles.memberDetail}>{user?.phoneNumber ?? 'Main account'}</Text>
          </View>
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerBadgeText}>OWNER</Text>
          </View>
        </View>

        {/* Member cards */}
        {profiles.map((p) => (
          <MemberCard key={p.id} profile={p} />
        ))}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, maxProfiles - 1 - profiles.length) }).map((_, i) => (
          <TouchableOpacity
            key={`empty_${i}`}
            style={styles.emptySlot}
            onPress={() => setShowAdd(true)}
            activeOpacity={0.7}
          >
            <View style={styles.emptyIcon}>
              <Ionicons name="add" size={22} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptySlotText}>Add family member</Text>
          </TouchableOpacity>
        ))}

        {/* Add button */}
        {profiles.length < maxProfiles - 1 && (
          <AppButton
            title="Add Family Member"
            onPress={() => setShowAdd(true)}
            variant="secondary"
            icon={<Ionicons name="person-add-outline" size={18} color={COLORS.primary} />}
          />
        )}

        <Text style={styles.hint}>
          Each family member gets their own premium access. Share the invite code or add them directly.
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
          <Text style={styles.addTitle}>Add Family Member</Text>

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
            <Text style={styles.fieldLabel}>Phone (optional)</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="+255 7XX XXX XXX"
              placeholderTextColor={COLORS.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Form level (optional)</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="1 – 4"
              placeholderTextColor={COLORS.textMuted}
              value={formLevel}
              onChangeText={setFormLevel}
              keyboardType="number-pad"
              maxLength={1}
            />
          </View>

          <AppButton
            title={loading ? 'Adding...' : 'Add Member'}
            onPress={handleAdd}
            loading={loading}
            variant="primary"
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function MemberCard({ profile }: { profile: FamilyProfile }) {
  const joined = profile.joinedAt != null;
  return (
    <View style={styles.memberCard}>
      <View style={[styles.avatarCircle, styles.avatarGray]}>
        <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{profile.memberName}</Text>
        <Text style={styles.memberDetail}>
          {profile.memberPhone ?? `Form ${profile.memberForm ?? '—'}`}
        </Text>
      </View>
      <View style={[styles.statusPill, joined ? styles.pillActive : styles.pillPending]}>
        <Text style={[styles.pillText, joined ? styles.pillTextActive : styles.pillTextPending]}>
          {joined ? 'Active' : 'Pending'}
        </Text>
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
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarGray: { backgroundColor: COLORS.bgCardLight },
  memberInfo: { flex: 1 },
  memberName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  memberDetail: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  ownerBadge: {
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
  },
  ownerBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: TYPOGRAPHY.weights.bold },
  statusPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
  },
  pillActive: { backgroundColor: `${COLORS.success}15`, borderColor: `${COLORS.success}40` },
  pillPending: { backgroundColor: `${COLORS.warning}10`, borderColor: `${COLORS.warning}30` },
  pillText: { fontSize: 11, fontWeight: TYPOGRAPHY.weights.semibold },
  pillTextActive: { color: COLORS.success },
  pillTextPending: { color: COLORS.warning },
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
});
