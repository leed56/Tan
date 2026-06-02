import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../../theme';

interface Props {
  title?: string;
  description?: string;
  onUpgrade: () => void;
  children: React.ReactNode;
}

export function PremiumGate({ title = 'Premium Feature', description, onUpgrade, children }: Props) {
  return (
    <View style={styles.wrapper}>
      {/* Blurred content underneath */}
      <View style={styles.blurOverlay} pointerEvents="none">
        <View style={styles.frostedContent}>{children}</View>
      </View>

      {/* Lock overlay */}
      <View style={styles.lockLayer}>
        <LinearGradient
          colors={['rgba(10,14,39,0.7)', 'rgba(10,14,39,0.9)']}
          style={styles.lockGradient}
        >
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={22} color={COLORS.gold} />
          </View>
          <Text style={styles.lockTitle}>{title}</Text>
          {description ? (
            <Text style={styles.lockDescription}>{description}</Text>
          ) : null}
          <TouchableOpacity onPress={onUpgrade} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.upgradeBtn}>
              <Ionicons name="flash" size={16} color="#1A1A1A" />
              <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', overflow: 'hidden', borderRadius: RADIUS.lg },
  blurOverlay: { opacity: 0.25 },
  frostedContent: {},
  lockLayer: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  lockGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  lockBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(247,197,46,0.15)',
    borderWidth: 2,
    borderColor: `${COLORS.gold}50`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  lockTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  lockDescription: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
    paddingHorizontal: SPACING.sm,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  upgradeBtnText: {
    color: '#1A1A1A',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
