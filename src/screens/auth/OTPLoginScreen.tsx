import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { validateTanzaniaPhone } from '../../utils';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_PHONE } from '../../constants';

type Props = StackScreenProps<AuthStackParamList, 'OTPLogin'>;

const COUNTRY_CODE = '+255';

export function OTPLoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const { loading, sendOtp } = useAuth();

  const fullPhone = `${COUNTRY_CODE}${phone.replace(/\D/g, '')}`;
  const isValid = validateTanzaniaPhone(`255${phone.replace(/\D/g, '')}`);

  const handleSend = async () => {
    if (!isValid) {
      Alert.alert('Invalid Number', 'Please enter a valid Tanzania mobile number.');
      return;
    }
    // TODO: Phase 2 — replace with real Firebase OTP via sendOtp()
    await sendOtp(fullPhone);
    navigation.navigate('OTPVerify', { phoneNumber: fullPhone });
  };

  const handleDemo = () => {
    // DEMO LOGIN MODE — bypasses real OTP
    // TODO: Phase 2 — remove demo mode, use real OTP only
    setPhone('712345678');
    navigation.navigate('OTPVerify', { phoneNumber: `${COUNTRY_CODE}712345678` });
  };

  return (
    <ScreenContainer scrollable keyboardAvoiding gradient={GRADIENTS.background}>
      {/* Back */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <Ionicons name="phone-portrait" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Enter your{'\n'}phone number</Text>
          <Text style={styles.subtitle}>
            We'll send a verification code to your Tanzania number.
          </Text>
        </View>

        {/* Phone Input */}
        <View style={styles.inputWrapper}>
          <TouchableOpacity
            style={styles.countryCode}
            accessibilityRole="button"
            accessibilityLabel="Country code Tanzania plus two five five"
          >
            {/* TODO: Phase 2 — country selector picker */}
            <Text style={styles.countryFlag}>🇹🇿</Text>
            <Text style={styles.countryCodeText}>{COUNTRY_CODE}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="7XX XXX XXX"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            maxLength={12}
            autoFocus
            accessibilityLabel="Phone number"
          />

          {isValid && (
            <View style={styles.validMark}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            </View>
          )}
        </View>

        <Text style={styles.hint}>
          Tanzania numbers: 07xx or 06xx (10 digits)
        </Text>

        {/* Send OTP */}
        <AppButton
          title="Send Verification Code"
          onPress={handleSend}
          loading={loading}
          disabled={!isValid}
          variant="primary"
        />

        {/* Demo mode */}
        <View style={styles.demoBox}>
          <View style={styles.demoHeader}>
            <Ionicons name="flask" size={14} color={COLORS.gold} />
            <Text style={styles.demoTitle}>Demo Mode</Text>
          </View>
          <Text style={styles.demoDesc}>
            Skip OTP verification for testing. Uses demo number {DEMO_PHONE}.
          </Text>
          <TouchableOpacity
            onPress={handleDemo}
            style={styles.demoBtn}
            accessibilityRole="button"
            accessibilityLabel="Use demo login"
          >
            <Text style={styles.demoBtnText}>Use Demo Login →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  back: { padding: SPACING.sm, marginBottom: SPACING.base, alignSelf: 'flex-start' },
  content: { flex: 1, gap: SPACING.base },
  header: { gap: SPACING.md, marginBottom: SPACING.sm },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(123, 111, 242, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    lineHeight: TYPOGRAPHY.sizes['3xl'] * 1.2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    height: 60,
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  countryFlag: { fontSize: 20 },
  countryCodeText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.glassBorder,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: 1,
  },
  validMark: {},
  hint: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: -SPACING.xs,
  },
  demoBox: {
    backgroundColor: 'rgba(247, 197, 46, 0.08)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(247, 197, 46, 0.2)',
    padding: SPACING.base,
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  demoTitle: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  demoDesc: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: TYPOGRAPHY.sizes.xs * 1.6,
  },
  demoBtn: { alignSelf: 'flex-start' },
  demoBtnText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});