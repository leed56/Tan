import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';
import type { QuizType } from '../../../types/quiz';
import { FREE_DAILY_LIMITS } from '../../../types/quiz';

interface DailyLimitModalProps {
  visible: boolean;
  quizType: QuizType;
  onClose: () => void;
  onUpgrade?: () => void;
}

const TYPE_LABEL: Record<QuizType, string> = {
  mcq: 'Multiple Choice',
  fib: 'Fill in the Blanks',
  tf: 'True / False',
  hoq: 'Higher Order Questions',
};

export function DailyLimitModal({ visible, quizType, onClose, onUpgrade }: DailyLimitModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Gold badge */}
          <View style={styles.iconWrap}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={28} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Daily Limit Reached</Text>
          <Text style={styles.body}>
            You've used all {FREE_DAILY_LIMITS[quizType]} free{' '}
            <Text style={styles.bold}>{TYPE_LABEL[quizType]}</Text> quizzes for today.{'\n\n'}
            Upgrade to Premium for unlimited questions, AI summaries, and NECTA-style Higher Order Questions.
          </Text>

          {/* Premium CTA */}
          <LinearGradient colors={GRADIENTS.gold} style={styles.upgradeBtn}>
            <TouchableOpacity onPress={() => { onClose(); onUpgrade?.(); }} activeOpacity={0.85} style={styles.upgradeBtnInner}>
              <Ionicons name="star" size={16} color="#1A1A1A" />
              <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Dismiss */}
          <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
            <Text style={styles.dismissText}>Maybe later</Text>
          </TouchableOpacity>

          {/* Resets at midnight notice */}
          <View style={styles.notice}>
            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.noticeText}>Free limits reset at midnight local time.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10,14,39,0.85)',
    paddingHorizontal: SPACING.screenPadding,
  },
  card: {
    backgroundColor: COLORS.bgMid,
    borderRadius: RADIUS['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(247,197,46,0.25)',
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    width: '100%',
    maxWidth: 460,
  },
  iconWrap: { marginBottom: SPACING.sm },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    textAlign: 'center',
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * 1.6,
  },
  bold: { color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.weights.bold },
  upgradeBtn: {
    borderRadius: RADIUS.lg,
    width: '100%',
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  upgradeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  upgradeBtnText: {
    color: '#1A1A1A',
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  dismissBtn: { paddingVertical: SPACING.sm },
  dismissText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  noticeText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.xs },
});
