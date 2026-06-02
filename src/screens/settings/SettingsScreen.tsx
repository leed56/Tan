import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ProfileStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useAppThemeStore } from '../../store/appThemeStore';
import { useAuth } from '../../hooks/useAuth';

type Props = StackScreenProps<ProfileStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { isDark, toggle } = useAppThemeStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [leaderboardAlerts, setLeaderboardAlerts] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: logout,
        },
      ],
    );
  };

  const handleSupport = () => {
    // TODO: Phase 2 — open in-app support chat or email link
    Alert.alert('Support', 'support@somaaiedu.com\n\nWe respond within 24 hours.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Phase 2 — delete Firestore user data, revoke Firebase auth
            logout();
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsToggle
            icon="moon"
            iconColor={COLORS.primary}
            label="Dark Mode"
            description="Dark interface reduces eye strain"
            value={isDark}
            onToggle={toggle}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsToggle
            icon="notifications"
            iconColor={COLORS.secondary}
            label="Push Notifications"
            description="Allow Soma AI to send notifications"
            value={notificationsEnabled}
            onToggle={() => {
              // TODO: Phase 2 — request/revoke notification permission
              setNotificationsEnabled((v) => !v);
            }}
          />
          <SettingsToggle
            icon="alarm"
            iconColor={COLORS.gold}
            label="Daily Study Reminders"
            description="Get reminded to study every day"
            value={studyReminders}
            onToggle={() => {
              // TODO: Phase 2 — schedule/cancel daily reminder notification
              setStudyReminders((v) => !v);
            }}
            disabled={!notificationsEnabled}
          />
          <SettingsToggle
            icon="trophy"
            iconColor="#FF8C42"
            label="Leaderboard Alerts"
            description="Notify when your rank changes"
            value={leaderboardAlerts}
            onToggle={() => setLeaderboardAlerts((v) => !v)}
            disabled={!notificationsEnabled}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsRow
            icon="shield-checkmark"
            iconColor={COLORS.success}
            label="Privacy Policy"
            onPress={() => {
              // TODO: Phase 2 — open WebView with privacy policy URL
            }}
          />
          <SettingsRow
            icon="document-text"
            iconColor={COLORS.secondary}
            label="Terms of Service"
            onPress={() => {
              // TODO: Phase 2 — open WebView with ToS URL
            }}
          />
          <SettingsRow
            icon="star"
            iconColor={COLORS.gold}
            label="Upgrade to Premium"
            onPress={() => {
              // TODO: Phase 2 — navigate to subscription screen
            }}
            highlight
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingsRow
            icon="help-circle"
            iconColor={COLORS.primary}
            label="Help & FAQ"
            onPress={() => {
              // TODO: Phase 2 — open FAQ screen
            }}
          />
          <SettingsRow
            icon="chatbubble-ellipses"
            iconColor={COLORS.secondary}
            label="Contact Support"
            onPress={handleSupport}
          />
          <SettingsRow
            icon="star-half"
            iconColor={COLORS.gold}
            label="Rate the App"
            onPress={() => {
              // TODO: Phase 2 — open app store rating
            }}
          />
        </SettingsSection>

        {/* Danger zone */}
        <SettingsSection title="Account Actions">
          <AppButton
            title="Log Out"
            onPress={handleLogout}
            variant="secondary"
            size="md"
          />
          <AppButton
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="danger"
            size="md"
          />
        </SettingsSection>

        {/* App version */}
        <View style={styles.versionBlock}>
          <Text style={styles.versionText}>Soma AI · Version 1.0.0 (Phase 1)</Text>
          <Text style={styles.versionSub}>Made with ❤️ for Tanzania</Text>
          <Text style={styles.versionSub}>© 2025 Soma AI Education</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sStyles.section}>
      <Text style={sStyles.sectionTitle}>{title}</Text>
      <View style={sStyles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingsToggle({
  icon,
  iconColor,
  label,
  description,
  value,
  onToggle,
  disabled = false,
}: {
  icon: string;
  iconColor: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={[sStyles.row, disabled && sStyles.rowDisabled]}>
      <View style={[sStyles.iconBox, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={disabled ? COLORS.textDisabled : iconColor} />
      </View>
      <View style={sStyles.rowContent}>
        <Text style={[sStyles.rowLabel, disabled && sStyles.labelDisabled]}>{label}</Text>
        <Text style={sStyles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: COLORS.bgCardLight, true: `${COLORS.primary}70` }}
        thumbColor={value ? COLORS.primary : COLORS.textDisabled}
      />
    </View>
  );
}

function SettingsRow({
  icon,
  iconColor,
  label,
  onPress,
  highlight = false,
}: {
  icon: string;
  iconColor: string;
  label: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={sStyles.row} activeOpacity={0.7}>
      <View style={[sStyles.iconBox, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={iconColor} />
      </View>
      <Text style={[sStyles.rowLabel, sStyles.rowFlex, highlight && { color: COLORS.gold }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.base,
  },
  back: { padding: SPACING.sm },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    gap: SPACING.xl,
    paddingBottom: SPACING['3xl'],
  },
  versionBlock: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.base,
  },
  versionText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  versionSub: { color: COLORS.textDisabled, fontSize: TYPOGRAPHY.sizes.xs },
});

const sStyles = StyleSheet.create({
  section: { gap: SPACING.sm },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    gap: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
    backgroundColor: COLORS.bgCard,
  },
  rowDisabled: { opacity: 0.45 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: { flex: 1, gap: 2 },
  rowFlex: { flex: 1 },
  rowLabel: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  labelDisabled: { color: COLORS.textDisabled },
  rowDesc: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
});
