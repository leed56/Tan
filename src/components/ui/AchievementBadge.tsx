import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import type { Badge } from '../../types';

interface AchievementBadgeProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  onPress?: (badge: Badge) => void;
}

export function AchievementBadge({ badge, size = 'md', onPress }: AchievementBadgeProps) {
  const sizeMap = { sm: 44, md: 60, lg: 76 };
  const iconSizeMap = { sm: 18, md: 24, lg: 32 };
  const dim = sizeMap[size];
  const iconSize = iconSizeMap[size];

  const content = (
    <View style={[styles.container, { width: dim }]}>
      <View style={[styles.iconWrapper, { width: dim, height: dim, borderRadius: dim / 2 }]}>
        {badge.isEarned ? (
          <LinearGradient
            colors={GRADIENTS.gold}
            style={[styles.earned, { width: dim, height: dim, borderRadius: dim / 2 }]}
          >
            <Ionicons
              name={badge.iconName as keyof typeof Ionicons.glyphMap}
              size={iconSize}
              color="#fff"
            />
          </LinearGradient>
        ) : (
          <View style={[styles.locked, { width: dim, height: dim, borderRadius: dim / 2 }]}>
            <Ionicons
              name={badge.iconName as keyof typeof Ionicons.glyphMap}
              size={iconSize}
              color={COLORS.textDisabled}
            />
          </View>
        )}
        {!badge.isEarned && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={10} color={COLORS.textMuted} />
          </View>
        )}
      </View>
      {size !== 'sm' && (
        <Text style={[styles.label, !badge.isEarned && styles.labelLocked]} numberOfLines={2}>
          {badge.title}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(badge)} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconWrapper: {
    position: 'relative',
  },
  earned: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  locked: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgCardLight,
    borderWidth: 1.5,
    borderColor: COLORS.textDisabled,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgMid,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.xs * 1.4,
  },
  labelLocked: {
    color: COLORS.textDisabled,
  },
});
