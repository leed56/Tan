import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { COLORS, GRADIENTS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

type Props = StackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const copyOpacity = useRef(new Animated.Value(0)).current;
  const copyY = useRef(new Animated.Value(18)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, speed: 12, bounciness: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(copyOpacity, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(copyY, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(900),
      Animated.timing(exitOpacity, { toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      loop.stop();
      navigation.replace('Welcome');
    });

    return () => loop.stop();
  }, [navigation, logoScale, logoOpacity, copyOpacity, copyY, pulse, exitOpacity]);

  const ringSize = Math.min(width * 0.92, 390);

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity }]}> 
      <StatusBar style="light" />
      <LinearGradient colors={['#060A1F', '#10183A', '#070B22']} style={styles.gradient}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <View style={[styles.ring, styles.ringOne, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]} />
        <View style={[styles.ring, styles.ringTwo, { width: ringSize * 0.68, height: ringSize * 0.68, borderRadius: (ringSize * 0.68) / 2 }]} />

        <View style={styles.center}>
          <Animated.View
            style={[
              styles.logoStage,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
                ],
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pulse,
                {
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.44] }),
                  transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.12] }) }],
                },
              ]}
            />
            <LinearGradient colors={GRADIENTS.primary} style={styles.logoBg}>
              <View style={styles.logoInner}>
                <Text style={styles.logoEmoji}>🧠</Text>
              </View>
            </LinearGradient>
            <View style={styles.orbitChipLeft}>
              <Ionicons name="flash" size={15} color={COLORS.gold} />
              <Text style={styles.orbitText}>XP</Text>
            </View>
            <View style={styles.orbitChipRight}>
              <Ionicons name="sparkles" size={15} color={COLORS.successLight} />
              <Text style={styles.orbitText}>AI</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.copy, { opacity: copyOpacity, transform: [{ translateY: copyY }] }]}> 
            <View style={styles.badge}>
              <Ionicons name="school" size={14} color={COLORS.gold} />
              <Text style={styles.badgeText}>Tanzania O-Level • Form 1–4</Text>
            </View>
            <Text style={styles.appName}>Soma AI</Text>
            <Text style={styles.tagline}>Master exams one smart habit at a time.</Text>
            <View style={styles.loadingTrack}>
              <LinearGradient colors={['#F7C52E', '#FF8C42']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loadingFill} />
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.bottom, { opacity: copyOpacity }]}> 
          <Ionicons name="shield-checkmark" size={14} color={COLORS.successLight} />
          <Text style={styles.bottomText}>AI-powered learning made for students</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100vh' as any, backgroundColor: COLORS.bgDark },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glowTop: { position: 'absolute', top: -120, right: -120, width: 310, height: 310, borderRadius: 155, backgroundColor: 'rgba(123,111,242,0.22)' },
  glowBottom: { position: 'absolute', bottom: -130, left: -120, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(247,197,46,0.12)' },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  ringOne: { top: '18%' },
  ringTwo: { top: '25%', borderColor: 'rgba(155,140,249,0.16)' },
  center: { width: '100%', maxWidth: 430, alignItems: 'center', paddingHorizontal: SPACING.screenPadding },
  logoStage: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  pulse: { position: 'absolute', width: 178, height: 178, borderRadius: 89, backgroundColor: COLORS.primary },
  logoBg: { width: 116, height: 116, borderRadius: 34, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 22 }, shadowOpacity: 0.42, shadowRadius: 32, elevation: 20 },
  logoInner: { width: 92, height: 92, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.09)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  logoEmoji: { fontSize: 50 },
  orbitChipLeft: { position: 'absolute', left: 6, top: 52, minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: 'rgba(10,14,39,0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  orbitChipRight: { position: 'absolute', right: 0, bottom: 42, minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: 'rgba(10,14,39,0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  orbitText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold },
  copy: { alignItems: 'center', gap: SPACING.md },
  badge: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, backgroundColor: 'rgba(247,197,46,0.1)', borderWidth: 1, borderColor: 'rgba(247,197,46,0.24)' },
  badgeText: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.extrabold, textTransform: 'uppercase', letterSpacing: 0.5 },
  appName: { color: COLORS.textPrimary, fontSize: 52, lineHeight: 58, fontWeight: TYPOGRAPHY.weights.extrabold, letterSpacing: -1.4, textAlign: 'center' },
  tagline: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.md, lineHeight: TYPOGRAPHY.sizes.md * 1.5, fontWeight: TYPOGRAPHY.weights.medium, textAlign: 'center' },
  loadingTrack: { width: 156, height: 7, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: SPACING.sm },
  loadingFill: { width: '72%', height: '100%', borderRadius: RADIUS.full },
  bottom: { position: 'absolute', bottom: SPACING['3xl'], flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, minHeight: 36, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  bottomText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
});
