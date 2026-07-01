import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ProfileStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { subscribeToDevices, removeDevice, getCurrentDeviceId } from '../../services/deviceService';
import type { RegisteredDevice } from '../../types/subscription';

type Props = StackScreenProps<ProfileStackParamList, 'ManageDevices'>;

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ManageDevicesScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const planMaxDevices = useSubscriptionStore((s) => s.planMaxDevices);
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentDeviceId().then(setCurrentId);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToDevices(user.uid, setDevices);
  }, [user?.uid]);

  const maxDevices = planMaxDevices();

  const handleRemove = (device: RegisteredDevice) => {
    Alert.alert('Remove device', `Sign out ${device.deviceName} from this account?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => user?.uid && removeDevice(user.uid, device.id),
      },
    ]);
  };

  return (
    <ScreenContainer padded={false}>
      <LinearGradient colors={[`${COLORS.primary}18`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Subscription</Text>
        <Text style={styles.headerTitle}>Manage Devices</Text>
        <View style={styles.slotPill}>
          <Ionicons name="phone-portrait-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.slotText}>{devices.length} / {maxDevices} devices used</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {devices.map((d) => {
          const isCurrent = d.id === currentId;
          return (
            <View key={d.id} style={styles.deviceCard}>
              <View style={styles.deviceIcon}>
                <Ionicons
                  name={d.platform === 'ios' ? 'logo-apple' : d.platform === 'android' ? 'logo-android' : 'globe-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </View>
              <View style={styles.deviceInfo}>
                <View style={styles.deviceNameRow}>
                  <Text style={styles.deviceName}>{d.deviceName}</Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>THIS DEVICE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.deviceMeta}>Active {timeAgo(d.lastActiveAt)}</Text>
              </View>
              {!isCurrent && (
                <TouchableOpacity onPress={() => handleRemove(d)} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={22} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <Text style={styles.hint}>
          Your plan allows up to {maxDevices} devices signed in at once. Remove
          a device above to free up a slot for a new one.
        </Text>
      </ScrollView>
    </ScreenContainer>
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
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCardLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deviceInfo: { flex: 1 },
  deviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deviceName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  deviceMeta: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  currentBadge: {
    backgroundColor: `${COLORS.success}15`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: `${COLORS.success}40`,
  },
  currentBadgeText: { color: COLORS.success, fontSize: 9, fontWeight: TYPOGRAPHY.weights.bold },
  hint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.xs * 1.6,
    marginTop: SPACING.sm,
  },
});
