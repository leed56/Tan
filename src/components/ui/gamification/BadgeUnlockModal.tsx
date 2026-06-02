import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../../theme';
import type { BadgeDefinition } from '../../../types/gamification';

interface Props {
  visible: boolean;
  badge: BadgeDefinition | null;
  onDismiss: () => void;
}

const RARITY_GRADIENT: Record<string, string[]> = {
  common: ['#4ECDC4', '#2EAF9F'],
  rare: ['#7B6FF2', '#5A50CC'],
  epic: ['#F7C52E', '#D4A017'],
};

export function BadgeUnlockModal({ visible, badge, onDismiss }: Props) {
  if (!badge) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <MotiView
        from={{ translateY: 300 }}
        animate={{ translateY: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        style={styles.sheet}
      >
        <View style={styles.handle} />

        <LinearGradient
          colors={RARITY_GRADIENT[badge.rarity] ?? RARITY_GRADIENT.common}
          style={styles.iconCircle}
        >
          <Ionicons name={badge.iconName as keyof typeof Ionicons.glyphMap} size={40} color="#fff" />
        </LinearGradient>

        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>🏅 New Badge Unlocked!</Text>
        </View>

        <Text style={styles.badgeTitle}>{badge.title}</Text>
        <Text style={styles.badgeDesc}>{badge.description}</Text>

        <View style={[styles.rarityPill, { backgroundColor: `${badge.color}20`, borderColor: `${badge.color}40` }]}>
          <Text style={[styles.rarityText, { color: badge.color }]}>{badge.rarity.toUpperCase()}</Text>
        </View>

        <TouchableOpacity onPress={onDismiss} style={styles.btnWrap} activeOpacity={0.85}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.btn}>
            <Text style={styles.btnText}>Awesome!</Text>
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.glassBorder, marginBottom: SPACING.sm },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  newBadge: {
    backgroundColor: `${COLORS.gold}15`,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${COLORS.gold}40`,
  },
  newBadgeText: { color: COLORS.gold, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  badgeTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    textAlign: 'center',
  },
  badgeDesc: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
  },
  rarityPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderWidth: 1,
  },
  rarityText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold },
  btnWrap: { width: '100%', marginTop: SPACING.sm, marginBottom: SPACING.md },
  btn: { borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  btnText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold },
});
