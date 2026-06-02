import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../../theme';
import { getLevelLabel } from '../../../utils/xpUtils';

interface Props {
  visible: boolean;
  newLevel: number;
  onDismiss: () => void;
}

export function LevelUpModal({ visible, newLevel, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          style={styles.card}
        >
          {/* Pulsing ring */}
          <MotiView
            from={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ type: 'timing', duration: 1200, loop: true }}
            style={styles.pulseRing}
          />

          <LinearGradient colors={GRADIENTS.gold} style={styles.levelCircle}>
            <Text style={styles.levelNumber}>{newLevel}</Text>
          </LinearGradient>

          <Text style={styles.headline}>Level Up!</Text>
          <Text style={styles.levelLabel}>{getLevelLabel(newLevel)}</Text>
          <Text style={styles.body}>
            You've reached Level {newLevel}. Keep studying to unlock more rewards!
          </Text>

          <TouchableOpacity onPress={onDismiss} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.btn}>
              <Text style={styles.btnText}>Keep Going!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,14,39,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenPadding,
  },
  card: {
    backgroundColor: COLORS.bgMid,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    width: '100%',
    borderWidth: 1.5,
    borderColor: `${COLORS.gold}50`,
    position: 'relative',
    overflow: 'hidden',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.gold,
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
  },
  levelCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  levelNumber: {
    color: '#1A1A1A',
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  headline: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  levelLabel: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.sm * 1.6,
  },
  btn: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  btnText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold },
});
