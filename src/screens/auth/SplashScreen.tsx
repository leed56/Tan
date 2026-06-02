import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(glowOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(exitOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      navigation.replace('Welcome');
    });
  }, [navigation, logoScale, logoOpacity, taglineOpacity, glowOpacity, exitOpacity]);

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0A0E27', '#1A0E3F', '#0D1B5E']}
        style={styles.gradient}
      >
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <View style={styles.center}>
          {/* Glow behind logo */}
          <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: logoScale }], opacity: logoOpacity },
            ]}
          >
            <LinearGradient
              colors={['#9B8CF9', '#7B6FF2', '#5A50CC']}
              style={styles.logoBg}
            >
              <Text style={styles.logoEmoji}>🧠</Text>
            </LinearGradient>
          </Animated.View>

          {/* App name */}
          <Animated.View style={{ opacity: logoOpacity }}>
            <Text style={styles.appName}>Soma AI</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.View style={{ opacity: taglineOpacity }}>
            <Text style={styles.tagline}>Learn Smarter. Pass NECTA.</Text>
          </Animated.View>

          {/* Powered by line */}
          <Animated.View style={[styles.poweredRow, { opacity: taglineOpacity }]}>
            <View style={styles.poweredDot} />
            <Text style={styles.powered}>Tanzania O-Level · Form 1–4</Text>
            <View style={styles.poweredDot} />
          </Animated.View>
        </View>

        {/* Bottom brand */}
        <Animated.View style={[styles.bottom, { opacity: taglineOpacity }]}>
          <Text style={styles.bottomText}>Powered by AI · Made for Tanzania</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(123, 111, 242, 0.15)',
  },
  circle1: { width: width * 1.4, height: width * 1.4, top: -width * 0.5, left: -width * 0.2 },
  circle2: { width: width * 0.8, height: width * 0.8, bottom: -width * 0.2, right: -width * 0.2 },
  circle3: { width: width * 0.5, height: width * 0.5, top: '20%', right: -width * 0.1, borderColor: 'rgba(247, 197, 46, 0.1)' },
  center: { alignItems: 'center', gap: SPACING.md },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(123, 111, 242, 0.25)',
    top: -40,
  },
  logoContainer: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  logoBg: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: { fontSize: 52 },
  appName: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['5xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    letterSpacing: -1,
    marginTop: SPACING.sm,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  poweredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  poweredDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
  },
  powered: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.3,
  },
  bottom: {
    position: 'absolute',
    bottom: SPACING['3xl'],
  },
  bottomText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 0.5,
  },
});
