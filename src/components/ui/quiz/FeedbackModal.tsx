import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ExplanationCard } from './ExplanationCard';
import { ExamTipCard } from '../explanation/ExamTipCard';
import { parseExplanation } from '../../../utils/parseExplanation';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface FeedbackModalProps {
  visible: boolean;
  isCorrect: boolean;
  xpEarned: number;
  explanation: string;
  correctAnswerLabel?: string;
  onContinue: () => void;
}

export function FeedbackModal({
  visible,
  isCorrect,
  xpEarned,
  explanation,
  correctAnswerLabel,
  onContinue,
}: FeedbackModalProps) {
  const parsed = parseExplanation(explanation);
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 22,
        stiffness: 260,
        mass: 0.9,
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
          {/* Accent bar so correct/wrong reads at a glance */}
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <LinearGradient colors={gradientColors} style={styles.inner}>
            <View style={styles.grabber} />

            {/* Status row */}
            <View style={styles.statusRow}>
              <View style={[styles.iconCircle, { backgroundColor: `${accentColor}22`, borderColor: `${accentColor}55` }]}>
                <Ionicons
                  name={isCorrect ? 'checkmark' : 'bulb'}
                  size={30}
                  color={accentColor}
                />
              </View>
              <View style={styles.statusText}>
                <Text style={[styles.statusTitle, { color: accentColor }]}>
                  {isCorrect ? 'Correct!' : 'Good try!'}
                </Text>
                <Text style={styles.statusSub}>
                  {isCorrect ? 'Well done, keep it up.' : "Here's the explanation."}
                </Text>
              </View>
              {isCorrect && (
                <View style={styles.xpBadge}>
                  <Ionicons name="flash" size={15} color={COLORS.gold} />
                  <Text style={styles.xpText}>+{xpEarned}</Text>
                </View>
              )}
            </View>

            {/* Explanation — the single explanation surface; long content
                scrolls within the sheet so nothing is cut off. */}
            <ScrollView
              style={styles.explainScroll}
              contentContainerStyle={styles.explainScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <ExplanationCard
                explanation={parsed.body}
                correctLabel={!isCorrect && correctAnswerLabel ? `Correct answer: ${correctAnswerLabel}` : undefined}
              />
              {parsed.tip ? <ExamTipCard tip={parsed.tip} /> : null}
            </ScrollView>

            {/* Continue button — filled, prominent */}
            <TouchableOpacity onPress={onContinue} activeOpacity={0.9}>
              <LinearGradient
                colors={isCorrect ? ['#4ECDC4', '#3DBAB2'] : ['#FFB74D', '#F5A623']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueBtn}
              >
                <Text style={styles.continueBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#0B1020" />
              </LinearGradient>
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
    // Center horizontally so on wide/desktop web (where the Modal portals
    // outside the phone frame) the sheet stays phone-width instead of
    // spanning the whole browser.
    alignItems: 'center',
    backgroundColor: 'rgba(10,14,39,0.7)',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    // Lift the sheet off the screen for depth.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 24,
  },
  accentBar: { height: 4, width: '100%' },
  inner: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING['2xl'],
    gap: SPACING.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.glassBorder,
    marginBottom: SPACING.xs,
  },
  explainScroll: { maxHeight: 340 },
  explainScrollContent: { gap: SPACING.md },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: { flex: 1 },
  statusTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontFamily: TYPOGRAPHY.families.extrabold,
    letterSpacing: -0.4,
  },
  statusSub: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontFamily: TYPOGRAPHY.families.medium,
    marginTop: 3,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(247,197,46,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(247,197,46,0.35)',
  },
  xpText: {
    color: COLORS.gold,
    fontSize: TYPOGRAPHY.sizes.base,
    fontFamily: TYPOGRAPHY.families.extrabold,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.base,
    marginTop: SPACING.xs,
  },
  continueBtnText: {
    color: '#0B1020',
    fontSize: TYPOGRAPHY.sizes.md,
    fontFamily: TYPOGRAPHY.families.bold,
    letterSpacing: 0.2,
  },
});
