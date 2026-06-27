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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { PaymentMethodCard } from '../../components/ui/subscription/PaymentMethodCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';
import type { PaymentProvider } from '../../types/subscription';
import { PAYMENT_META } from '../../utils/seedPlans';
import { createPaymentRequest, activateSubscription } from '../../services/subscriptionService';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useAuthStore } from '../../store/authStore';

type Props = StackScreenProps<HomeStackParamList, 'PaymentMethodScreen'>;

const PROVIDERS: PaymentProvider[] = [
  'google_play',
  'airtel',
  'mpesa',
  'tigo',
  'halopesa',
  'ttcl',
  'whatsapp',
];

const WHATSAPP_NUMBER = process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP_NUMBER ?? '+255700000000';

export function PaymentMethodScreen({ navigation, route }: Props) {
  const { planId, planTitle, priceMonthly } = route.params;
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('mpesa');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  const user = useAuthStore((s) => s.user);
  const { setSubscription } = useSubscriptionStore();

  const meta = PAYMENT_META[selectedProvider];
  const needsPhone = meta?.requiresPhone ?? false;

  const handlePay = async () => {
    if (!user?.uid) return;
    if (needsPhone && phone.trim().length < 9) {
      Alert.alert('Phone required', 'Please enter a valid phone number.');
      return;
    }

    if (selectedProvider === 'whatsapp') {
      const message = encodeURIComponent(
        `Hello! I'd like to subscribe to Soma AI *${planTitle}* plan for ${priceMonthly.toLocaleString()} TSH/month. My account ID: ${user.uid}`,
      );
      await Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`);
      return;
    }

    setProcessing(true);
    try {
      await createPaymentRequest(user.uid, planId as any, selectedProvider, needsPhone ? phone : null);
      // In production this would wait for a webhook/callback. For now simulate success.
      const sub = await activateSubscription(user.uid, planId as any, selectedProvider);
      setSubscription(sub);
      Alert.alert(
        'Payment submitted!',
        'Your subscription is now active. Enjoy premium access!',
        [{ text: 'Continue', onPress: () => navigation.navigate('SubscriptionStatus') }],
      );
    } catch {
      Alert.alert('Payment failed', 'Please try again or contact support.');
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
          <Text style={styles.priceText}>{priceMonthly.toLocaleString()} TSH / month</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Select payment method</Text>

        {PROVIDERS.map((p) => (
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

        {/* WhatsApp note */}
        {selectedProvider === 'whatsapp' && (
          <View style={styles.whatsappNote}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
            <Text style={styles.whatsappText}>
              Tapping below will open WhatsApp with a pre-filled message to our support team.
            </Text>
          </View>
        )}

        <AppButton
          title={
            processing
              ? 'Processing...'
              : selectedProvider === 'whatsapp'
              ? 'Open WhatsApp'
              : `Pay ${priceMonthly.toLocaleString()} TSH`
          }
          onPress={handlePay}
          loading={processing}
          variant="primary"
          icon={selectedProvider === 'whatsapp' ? 'logo-whatsapp' : 'card-outline'}
        />

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
