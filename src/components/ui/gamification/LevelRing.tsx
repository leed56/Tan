import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import { getLevelProgress, getLevelLabel } from '../../../utils/xpUtils';

interface Props {
  xp: number;
  level: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
}

export function LevelRing({ xp, level, size = 100, strokeWidth = 10, color = COLORS.primary, showLabel = true }: Props) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const { percent } = getLevelProgress(xp);
  const strokeDash = circumference * (1 - percent / 100);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDash}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.level, { fontSize: size * 0.22, color: COLORS.textPrimary }]}>
          {level}
        </Text>
        {showLabel && (
          <Text style={[styles.label, { fontSize: size * 0.1 }]}>{getLevelLabel(level)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  level: { fontWeight: '800', lineHeight: undefined },
  label: { color: COLORS.textMuted, marginTop: 2 },
});
