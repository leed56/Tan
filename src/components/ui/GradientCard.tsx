import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../../theme';

interface GradientCardProps {
  children: React.ReactNode;
  gradient?: string[];
  style?: ViewStyle;
  blur?: boolean;
  blurIntensity?: number;
  padding?: number;
}

export function GradientCard({
  children,
  gradient = [COLORS.bgCard, COLORS.bgMid],
  style,
  blur = false,
  blurIntensity = 20,
  padding = SPACING.cardPadding,
}: GradientCardProps) {
  if (blur) {
    return (
      <View style={[styles.wrapper, style]}>
        <BlurView intensity={blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[styles.overlay, { padding }]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, { padding }, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  wrapper: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    backgroundColor: COLORS.glassBg,
  },
  overlay: {
    flex: 1,
  },
});
