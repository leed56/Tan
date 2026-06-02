import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { formatCountdown } from '../../utils';
import { DEMO_OTP } from '../../constants';
import { useProfileStore } from '../../store/profileStore';

type Props = StackScreenProps<AuthStackParamList, 'OTPVerify'>;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export function OTPVerifyScreen({ navigation, route }: Props) {
  const { phoneNumber } = route.params;
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));
  const { loading, verifyOtp } = useAuth();
  const profile = useProfileStore((s) => s.profile);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigit = (value: string, index: number) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      if (index > 0) inputRefs.current[index - 1]?.focus();
      return;
    }
    const char = clean[clean.length - 1];
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && digits[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      Alert.alert('Incomplete', 'Please enter all 6 digits.');
      return;
    }
    // TODO: Phase 2 — use real OTP verification
    if (code !== DEMO_OTP) {
      Alert.alert('Wrong Code', `Demo mode: use ${DEMO_OTP}`);
      return;
    }
    await verifyOtp(code);
    if (profile) {
      // Already has profile — go to app
      navigation.reset({ index: 0, routes: [{ name: 'SubjectSelection' }] });
    } else {
      navigation.navigate('CreateProfile');
    }
  };

  const handleResend = () => {
    // TODO: Phase 2 — call sendOtp() again
    setCountdown(RESEND_COOLDOWN);
    setCanResend(false);
  };

  const filled = digits.every((d) => d !== '');

  return (
    <ScreenContainer keyboardAvoiding gradient={GRADIENTS.background}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Verify your{'\n'}number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phone}>{phoneNumber}</Text>
          </Text>
        </View>

        {/* OTP boxes */}
        <View style={styles.codeRow}>
          {digits.map((digit, i) => (
            <View
              key={i}
              style={[
                styles.digitBox,
                digit !== '' && styles.digitBoxFilled,
                i === digits.findIndex((d) => d === '') && styles.digitBoxActive,
              ]}
            >
              <TextInput
                ref={(r) => { inputRefs.current[i] = r; }}
                style={styles.digitInput}
                value={digit}
                onChangeText={(v) => handleDigit(v, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                textContentType="oneTimeCode"
                caretHidden
              />
            </View>
          ))}
        </View>

        {/* Demo hint */}
        <View style={styles.demoHint}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.gold} />
          <Text style={styles.demoHintText}>Demo mode — use code: {DEMO_OTP}</Text>
        </View>

        {/* Verify button */}
        <AppButton
          title="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          disabled={!filled}
          variant="primary"
        />

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendBtn}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.countdown}>Resend in {formatCountdown(countdown)}</Text>
          )}
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
  phone: { color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold },
  codeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  digitBox: {
    width: 48,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(123, 111, 242, 0.1)',
  },
  digitBoxActive: {
    borderColor: COLORS.primaryLight,
  },
  digitInput: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(247, 197, 46, 0.08)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  demoHintText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  resendText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  resendBtn: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  countdown: {
    color: COLORS.textDisabled,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
