import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(18)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.95)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(-90)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.12,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 0.96,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 120,
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 72,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(contentY, {
          toValue: 0,
          tension: 70,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(700),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 420,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace('Welcome');
    });
  }, [
    navigation,
    logoScale,
    logoOpacity,
    contentY,
    contentOpacity,
    glowScale,
    ringRotate,
    shimmerX,
    progress,
    exitOpacity,
  ]);

  const ringSpin = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 116],
  });

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity }]}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#030712', '#080B22', '#151141', '#071B36']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.auroraOne} />
        <View style={styles.auroraTwo} />
        <View style={styles.auroraThree} />

        <View style={styles.gridCircleLarge} />
        <View style={styles.gridCircleSmall} />

        <View style={styles.center}>
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: logoOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.orbitRing,
              {
                opacity: logoOpacity,
                transform: [{ rotate: ringSpin }],
              },
            ]}
          >
            <View style={styles.orbitDot} />
          </Animated.View>

          <Animated.View
            style={[
              styles.logoShell,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.34)', 'rgba(255,255,255,0.08)']}
              style={styles.logoGlass}
            >
              <LinearGradient
                colors={['#A78BFA', '#6366F1', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoMark}
              >
                <Text style={styles.logoLetter}>S</Text>

                <Animated.View
                  style={[
                    styles.shimmer,
                    {
                      transform: [{ translateX: shimmerX }, { rotate: '18deg' }],
                    },
                  ]}
                />
              </LinearGradient>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.copy,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentY }],
              },
            ]}
          >
            <Text style={styles.appName}>Soma</Text>
            <Text style={styles.tagline}>Learn smarter. Achieve more.</Text>

            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>Tanzania O-Level · Form 1–4</Text>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.bottom, { opacity: contentOpacity }]}>
          <Text style={styles.bottomText}>BUILT FOR TANZANIA’S FUTURE</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#030712',
  },

  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  auroraOne: {
    position: 'absolute',
    width: '110%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: 'rgba(99,102,241,0.28)',
    top: '-45%',
    left: '-34%',
  },

  auroraTwo: {
    position: 'absolute',
    width: '95%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: 'rgba(6,182,212,0.16)',
    bottom: '-36%',
    right: '-36%',
  },

  auroraThree: {
    position: 'absolute',
    width: '75%',
    aspectRatio: 1,
    borderRadius: 9999,
    backgroundColor: 'rgba(236,72,153,0.13)',
    top: '28%',
    right: '-40%',
  },

  gridCircleLarge: {
    position: 'absolute',
    width: '135%',
    aspectRatio: 1,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  gridCircleSmall: {
    position: 'absolute',
    width: '72%',
    aspectRatio: 1,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },

  glow: {
    position: 'absolute',
    top: -54,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(124,58,237,0.34)',
  },

  orbitRing: {
    position: 'absolute',
    top: -22,
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  orbitDot: {
    position: 'absolute',
    top: 12,
    left: 24,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDE68A',
  },

  logoShell: {
    width: 116,
    height: 116,
    borderRadius: 34,
    padding: 1,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 34,
    elevation: 22,
  },

  logoGlass: {
    flex: 1,
    borderRadius: 34,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },

  logoMark: {
    flex: 1,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  logoLetter: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -3,
  },

  shimmer: {
    position: 'absolute',
    width: 34,
    height: 130,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  copy: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },

  appName: {
    color: COLORS.textPrimary,
    fontSize: width < 380 ? 48 : 56,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    letterSpacing: -2,
    textAlign: 'center',
  },

  tagline: {
    marginTop: SPACING.xs,
    color: 'rgba(255,255,255,0.74)',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: 23,
    textAlign: 'center',
  },

  pill: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },

  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FDE68A',
  },

  pillText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.4,
  },

  progressTrack: {
    marginTop: SPACING.xl,
    width: 116,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },

  progressFill: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },

  bottom: {
    position: 'absolute',
    bottom: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },

  bottomText: {
    color: 'rgba(255,255,255,0.44)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
