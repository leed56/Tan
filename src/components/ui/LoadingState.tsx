import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
  const pulse1 = useRef(new Animated.Value(0.3)).current;
  const pulse2 = useRef(new Animated.Value(0.3)).current;
  const pulse3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      );

    const a1 = createPulse(pulse1, 0);
    const a2 = createPulse(pulse2, 150);
    const a3 = createPulse(pulse3, 300);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [pulse1, pulse2, pulse3]);

  const content = (
    <View style={styles.inner}>
      <View style={styles.dotsRow}>
        {[pulse1, pulse2, pulse3].map((anim, i) => (
          <Animated.View key={i} style={{ opacity: anim }}>
            <LinearGradient
              colors={GRADIENTS.primary}
              style={styles.dot}
            />
          </Animated.View>
        ))}
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );

  if (fullScreen) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.fullScreen}>
        {content}
      </LinearGradient>
    );
  }

  return <View style={[styles.container, fullScreen && styles.fullScreen]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    gap: SPACING.base,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: RADIUS.full,
  },
  message: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
