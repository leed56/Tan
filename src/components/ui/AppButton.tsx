import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  size = 'lg',
  icon,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const accessibilityState = { disabled: isDisabled, busy: loading };

  const heightMap = { sm: 40, md: 48, lg: 56 };
  const fontSizeMap = { sm: TYPOGRAPHY.sizes.sm, md: TYPOGRAPHY.sizes.base, lg: TYPOGRAPHY.sizes.md };

  if (variant === 'primary' || variant === 'gold') {
    const gradientColors = variant === 'gold' ? GRADIENTS.gold : GRADIENTS.primary;
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[styles.wrapper, fullWidth && styles.fullWidth, style]}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={accessibilityState}
      >
        <LinearGradient
          colors={isDisabled ? [COLORS.textDisabled, COLORS.textMuted] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { height: heightMap[size] }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.row}>
              {icon && <View style={styles.iconGap}>{icon}</View>}
              <Text style={[styles.label, { fontSize: fontSizeMap[size] }]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[styles.ghost, { height: heightMap[size] }, fullWidth && styles.fullWidth, style]}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={accessibilityState}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <View style={styles.row}>
            {icon && <View style={styles.iconGap}>{icon}</View>}
            <Text style={[styles.ghostLabel, { fontSize: fontSizeMap[size] }, isDisabled && styles.disabledText]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[styles.dangerBtn, { height: heightMap[size] }, fullWidth && styles.fullWidth, style]}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={accessibilityState}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.error} />
        ) : (
          <Text style={[styles.dangerLabel, { fontSize: fontSizeMap[size] }]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  // secondary
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.secondary,
        { height: heightMap[size] },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabledOpacity,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={accessibilityState}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconGap}>{icon}</View>}
          <Text style={[styles.secondaryLabel, { fontSize: fontSizeMap[size] }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  label: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  ghost: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  ghostLabel: {
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  secondary: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.glassBg,
  },
  secondaryLabel: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dangerBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  dangerLabel: {
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  disabledOpacity: { opacity: 0.5 },
  disabledText: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconGap: { marginRight: SPACING.sm },
});