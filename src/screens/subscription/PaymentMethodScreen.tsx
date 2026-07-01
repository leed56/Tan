import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { PaymentMethodCard } from '../../components/ui/subscription/PaymentMethodCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import type { PaymentProvider, PlanId, BillingCycle } from '../../types/subscription';
import { PAYMENT_META } from '../../utils/seedPlans';
import { createPaymentRequest } from '../../services/subscriptionService';
import { useAuthStore } from '../../store/authStore';

type Props = StackScreenProps<HomeStackParamList, 'PaymentMethodScreen'>;

// Real Play/App Store billing isn't wired up yet, so every payment method —
// mobile money and WhatsApp alike — routes through admin manual verification.
const ANDROID_PROVIDERS: PaymentProvider[] = ['mpesa', 'tigo', 'airtel', 'halopesa', 'ttcl', 'whatsapp'];

const WHATSAPP_NUMBER = process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP_NUMBER ?? '+255700000000';

export function PaymentMethodScreen({ navigation, route }: Props) {
  const { planId, planTitle, billingCycle, price } = route.params;
  const isApple = Platform.OS === 'ios';
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(
    isApple ? 'whatsapp' : 'mpesa',
  );
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  const user = useAuthStore((s) => s.user);

  const meta = PAYMENT_META[selectedProvider];
  const needsPhone = !isApple && (meta?.requiresPhone ?? false);
  const cycleLabel = billingCycle === 'yearly' ? 'year' : 'month';

  const submitAndOpenWhatsApp = async () => {
    if (!user?.uid) return;
    setProcessing(true);
    try {
      await createPaymentRequest(
        user.uid,
        planId as PlanId,
        billingCycle as BillingCycle,
        'whatsapp',
        user.phoneNumber ?? null,
      );
      const message = encodeURIComponent(
        `Hello! I'd like to subscribe to Soma AI *${planTitle}* plan (${billingCycle}) for ${price.toLocaleString()} TSH. My account ID: ${user.uid}`,
      );
      await Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`);
      Alert.alert(
        'Chat sent to WhatsApp',
        "Complete payment with our support team. Once confirmed, your account activates instantly — no need to reopen the app.",
        [{ text: 'OK', onPress: () => navigation.navigate('SubscriptionStatus') }],
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePay = async () => {
    if (!user?.uid) return;
    if (selectedProvider === 'whatsapp') {
      await submitAndOpenWhatsApp();
      return;
    }
    if (needsPhone && phone.trim().length < 9) {
      Alert.alert('Phone required', 'Please enter a valid phone number.');
      return;
    }

    setProcessing(true);
    try {
      await createPaymentRequest(
        user.uid,
        planId as PlanId,
        billingCycle as BillingCycle,
        selectedProvider,
        needsPhone ? phone : (user.phoneNumber ?? null),
      );
      Alert.alert(
        'Payment submitted!',
        'We’ve received your request. Our team verifies mobile money payments and activates your subscription — usually within minutes. You’ll see it unlock automatically, right here in the app.',
        [{ text: 'OK', onPress: () => navigation.navigate('SubscriptionStatus') }],
      );
    } catch {
      Alert.alert('Something went wrong', 'Please try again or contact support on WhatsApp.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      {/* Header */}
      <LinearGradient colors={[`${COLORS.gold}18`, COLORS.bgDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Payment</Text>
        <Text style={styles.headerTitle}>{planTitle}</Text>
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>{price.toLocaleString()} TSH / {cycleLabel}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isApple ? (
          <>
            <View style={styles.appleCard}>
              <Ionicons name="logo-apple" size={28} color={COLORS.textPrimary} />
              <Text style={styles.appleTitle}>Apple device support</Text>
              <Text style={styles.appleBody}>
                To keep pricing fair for everyone, iPhone/iPad subscriptions are
                activated through our WhatsApp support team rather than the App
                Store. Tap below to chat with us and complete payment securely.
              </Text>
            </View>
            <AppButton
              title={processing ? 'Opening WhatsApp...' : 'Chat on WhatsApp'}
              onPress={handlePay}
              loading={processing}
              variant="primary"
              icon="logo-whatsapp"
            />
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Select payment method</Text>

            {ANDROID_PROVIDERS.map((p) => (
              <PaymentMethodCard
                key={p}
                provider={p}
                isSelected={selectedProvider === p}
                onSelect={setSelectedProvider}
              />
            ))}

            {/* Phone input for mobile money */}
            {needsPhone && (
              <View style={styles.phoneCard}>
                <Text style={styles.phoneLabel}>Mobile number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryText}>+255</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="7XX XXX XXX"
                    placeholderTextColor={COLORS.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>
            )}

            {/* Manual-verification note */}
            <View style={styles.whatsappNote}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.whatsappText}>
                {selectedProvider === 'whatsapp'
                  ? 'Tapping below will open WhatsApp with a pre-filled message to our support team.'
                  : 'Our team verifies mobile money payments manually — your subscription activates automatically the moment it’s confirmed.'}
              </Text>
            </View>

            <AppButton
              title={
                processing
                  ? 'Processing...'
                  : selectedProvider === 'whatsapp'
                  ? 'Open WhatsApp'
                  : `Submit — ${price.toLocaleString()} TSH`
              }
              onPress={handlePay}
              loading={processing}
              variant="primary"
              icon={selectedProvider === 'whatsapp' ? 'logo-whatsapp' : 'card-outline'}
            />
          </>
        )}

        <Text style={styles.secureNote}>
          <Ionicons name="shield-checkmark-outline" size={12} color={COLORS.textMuted} />
          {' '}Secure payment — your data is encrypted
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
  pricePill: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.gold}20`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${COLORS.gold}40`,
  },
  priceText: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.sm,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  appleCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  appleTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  appleBody: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
  },
  phoneCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  phoneLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  phoneRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  countryCode: {
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  countryText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.base },
  phoneInput: {
    flex: 1,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  whatsappNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    marginTop: SPACING.xs,
  },
  whatsappText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  secureNote: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
