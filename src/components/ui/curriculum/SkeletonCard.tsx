import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../../theme';

interface SkeletonCardProps {
  height?: number;
  style?: ViewStyle;
}

export function SkeletonCard({ height = 80, style }: SkeletonCardProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
    return () => shimmer.stopAnimation();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });

  return (
    <Animated.View style={[styles.card, { height, opacity }, style]}>
      <View style={styles.iconPh} />
      <View style={styles.lines}>
        <View style={[styles.line, styles.lineWide]} />
        <View style={[styles.line, styles.lineNarrow]} />
        <View style={[styles.line, styles.lineMid]} />
      </View>
    </Animated.View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} style={i > 0 ? { marginTop: SPACING.sm } : undefined} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
  },
  iconPh: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgCardLight,
  },
  lines: { flex: 1, gap: SPACING.sm },
  line: {
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCardLight,
  },
  lineWide: { width: '80%' },
  lineNarrow: { width: '40%' },
  lineMid: { width: '60%' },
});
