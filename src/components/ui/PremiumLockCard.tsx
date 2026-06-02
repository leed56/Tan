import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

interface PremiumLockCardProps {
  title?: string;
  description?: string;
  onUpgrade?: () => void;
  compact?: boolean;
}

export function PremiumLockCard({
  title = 'Premium Content',
  description = 'Upgrade to access AI summaries, HOQ practice, and more.',
  onUpgrade,
  compact = false,
}: PremiumLockCardProps) {
  // TODO: Phase 2 — onUpgrade triggers real payment flow
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(247, 197, 46, 0.15)', 'rgba(247, 197, 46, 0.05)']}
        style={[styles.card, compact && styles.cardCompact]}
      >
        <View style={styles.lockRow}>
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={compact ? 20 : 28} color={COLORS.gold} />
          </View>
          {!compact && (
            <View style={styles.textBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          )}
        </View>

        {!compact && (
          <TouchableOpacity
            onPress={onUpgrade}
            activeOpacity={0.85}
            style={styles.upgradeBtn}
          >
            <LinearGradient
              colors={GRADIENTS.premium}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeBtnGradient}
            >
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
  },
  card: {
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(247, 197, 46, 0.3)',
    gap: SPACING.md,
  },
  cardCompact: {
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  lockIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(247, 197, 46, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: { flex: 1 },
  title: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  upgradeBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  upgradeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
