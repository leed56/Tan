import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { XP_PER_LEVEL } from '../../constants';
import { getXpProgressInLevel, formatXp } from '../../utils';

interface XPProgressBarProps {
  xp: number;
  level: number;
  showLabel?: boolean;
  height?: number;
  compact?: boolean;
}

export function XPProgressBar({ xp, level, showLabel = true, height = 8, compact = false }: XPProgressBarProps) {
  const xpInLevel = getXpProgressInLevel(xp);
  const percent = xpInLevel / XP_PER_LEVEL;
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: percent,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [percent, animatedWidth]);

  return (
    <View style={compact ? undefined : styles.container}>
      {showLabel && !compact && (
        <View style={styles.labelRow}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <Text style={styles.xpLabel}>
            {formatXp(xpInLevel)} / {formatXp(XP_PER_LEVEL)} XP
          </Text>
        </View>
      )}

      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fillWrapper,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              height,
            },
          ]}
        >
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { height }]}
          />
        </Animated.View>
      </View>

      {showLabel && compact && (
        <Text style={styles.compactLabel}>Lvl {level} · {Math.round(percent * 100)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  xpLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  track: {
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    width: '100%',
  },
  fillWrapper: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
    width: '100%',
  },
  compactLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    textAlign: 'right',
  },
});
