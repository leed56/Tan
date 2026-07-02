import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ExplanationCard } from './ExplanationCard';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface FeedbackModalProps {
  visible: boolean;
  isCorrect: boolean;
  xpEarned: number;
  explanation: string;
  correctAnswerLabel?: string;
  onContinue: () => void;
  onViewExplanation?: () => void;
}

export function FeedbackModal({
  visible,
  isCorrect,
  xpEarned,
  explanation,
  correctAnswerLabel,
  onContinue,
  onViewExplanation,
}: FeedbackModalProps) {
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(300);
    }
  }, [visible, translateY]);

  const accentColor = isCorrect ? COLORS.success : COLORS.warning;
  const gradientColors: [string, string] = isCorrect
    ? ['rgba(78,205,196,0.18)', 'rgba(78,205,196,0.04)']
    : ['rgba(255,169,77,0.18)', 'rgba(255,169,77,0.04)'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onContinue}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <LinearGradient colors={gradientColors} style={styles.inner}>
            {/* Status row */}
            <View style={styles.statusRow}>
              <View style={[styles.iconCircle, { backgroundColor: `${accentColor}22` }]}>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'information-circle'}
                  size={32}
                  color={accentColor}
                />
              </View>
              <View style={styles.statusText}>
                <Text style={[styles.statusTitle, { color: accentColor }]}>
                  {isCorrect ? 'Correct!' : 'Good try!'}
                </Text>
                <Text style={styles.statusSub}>
                  {isCorrect ? 'Well done, keep it up!' : 'Let\'s learn from this one.'}
                </Text>
              </View>
              {isCorrect && (
                <View style={styles.xpBadge}>
                  <Ionicons name="flash" size={14} color={COLORS.gold} />
                  <Text style={styles.xpText}>+{xpEarned} XP</Text>
                </View>
              )}
            </View>

            {/* Explanation */}
            <ExplanationCard
              explanation={explanation}
              correctLabel={!isCorrect && correctAnswerLabel ? `Correct answer: ${correctAnswerLabel}` : undefined}
            />

            {/* View Full Explanation */}
            {onViewExplanation && (
              <TouchableOpacity
                onPress={onViewExplanation}
                activeOpacity={0.8}
                style={styles.explainBtn}
              >
                <Ionicons name="bulb-outline" size={16} color={COLORS.primary} />
                <Text style={styles.explainBtnText}>View Full Explanation</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            )}

            {/* Continue button */}
            <TouchableOpacity
              onPress={onContinue}
              activeOpacity={0.85}
              style={[styles.continueBtn, { borderColor: accentColor }]}
            >
              <Text style={[styles.continueBtnText, { color: accentColor }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={accentColor} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10,14,39,0.7)',
  },
  sheet: {
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    borderTopWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  inner: {
    padding: SPACING.screenPadding,
    gap: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: { flex: 1 },
  statusTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  statusSub: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(247,197,46,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(247,197,46,0.3)',
  },
  xpText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    paddingVertical: SPACING.md,
  },
  continueBtnText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  explainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}50`,
    backgroundColor: `${COLORS.primary}10`,
  },
  explainBtnText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
