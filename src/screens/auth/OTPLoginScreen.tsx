import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { COLORS, GRADIENTS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

type Props = StackScreenProps<AuthStackParamList, 'OTPLogin'>;

export function OTPLoginScreen({ navigation }: Props) {
  const { loading, loginDemo } = useAuth();

  const handleGoogle = async () => {
    try {
      await loginDemo();
      navigation.navigate('CreateProfile');
    } catch {
      Alert.alert('Login failed', 'Please try again.');
    }
  };

  return (
    <ScreenContainer scrollable keyboardAvoiding gradient={GRADIENTS.background}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.heroIconWrap}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>🧠</Text>
          </LinearGradient>
        </View>

        <View style={styles.copyBlock}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={15} color={COLORS.successLight} />
            <Text style={styles.badgeText}>Secure student login</Text>
          </View>
          <Text style={styles.title}>Continue your learning journey.</Text>
          <Text style={styles.subtitle}>Sign in with Google to sync progress, save your profile, and keep Soma AI personalized for you.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}><Ionicons name="logo-google" size={24} color={COLORS.textPrimary} /></View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Google account</Text>
              <Text style={styles.cardText}>Recommended for students and parents</Text>
            </View>
          </View>

          <Pressable
            onPress={handleGoogle}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
            style={({ pressed }) => [styles.googleButton, pressed && styles.googleButtonPressed, loading && styles.disabled]}
          >
            <Ionicons name="logo-google" size={20} color={COLORS.bgDark} />
            <Text style={styles.googleText}>{loading ? 'Signing in...' : 'Continue with Google'}</Text>
          </Pressable>
        </View>

        <View style={styles.benefits}>
          <View style={styles.benefit}><Ionicons name="cloud-done-outline" size={18} color={COLORS.primaryLight} /><Text style={styles.benefitText}>Save progress across devices</Text></View>
          <View style={styles.benefit}><Ionicons name="lock-closed-outline" size={18} color={COLORS.primaryLight} /><Text style={styles.benefitText}>Secure Firebase-backed account</Text></View>
          <View style={styles.benefit}><Ionicons name="person-add-outline" size={18} color={COLORS.primaryLight} /><Text style={styles.benefitText}>Create your learning profile next</Text></View>
        </View>

        <Text style={styles.note}>Google login UI is active. This branch currently uses the existing Firebase demo session until real Google provider config is added.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  back: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'flex-start', marginBottom: SPACING.base },
  content: { flex: 1, gap: SPACING.xl, paddingBottom: SPACING['2xl'] },
  heroIconWrap: { alignItems: 'center', marginTop: SPACING.md },
  heroIcon: { width: 96, height: 96, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.36, shadowRadius: 28, elevation: 12 },
  heroEmoji: { fontSize: 44 },
  copyBlock: { gap: SPACING.md },
  badge: { alignSelf: 'flex-start', minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(126,221,215,0.22)', backgroundColor: 'rgba(78,205,196,0.1)' },
  badgeText: { color: COLORS.successLight, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, textTransform: 'uppercase', letterSpacing: 0.45 },
  title: { color: COLORS.textPrimary, fontSize: 38, lineHeight: 43, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: -0.8 },
  subtitle: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.md, lineHeight: TYPOGRAPHY.sizes.md * 1.55 },
  card: { gap: SPACING.lg, padding: SPACING.lg, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.07)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  cardIcon: { width: 52, height: 52, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  cardCopy: { flex: 1, minWidth: 0 },
  cardTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.extrabold },
  cardText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, marginTop: 3 },
  googleButton: { minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, borderRadius: RADIUS.xl, backgroundColor: '#fff' },
  googleButtonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.65 },
  googleText: { color: COLORS.bgDark, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.extrabold },
  benefits: { gap: SPACING.sm },
  benefit: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glassBg },
  benefitText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, flex: 1 },
  note: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, lineHeight: TYPOGRAPHY.sizes.xs * 1.55, textAlign: 'center' },
});
