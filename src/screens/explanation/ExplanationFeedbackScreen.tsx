import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppButton } from '../../components/ui/AppButton';
import { saveExplanationFeedback } from '../../services/explanationService';
import { useExplanationStore } from '../../store/explanationStore';
import { useProfileStore } from '../../store/profileStore';
import type { ExplanationFeedbackRating } from '../../types/explanation';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GRADIENTS } from '../../theme';

type Props = StackScreenProps<HomeStackParamList, 'ExplanationFeedback'>;

const OPTIONS: Array<{
  rating: ExplanationFeedbackRating;
  label: string;
  desc: string;
  color: string;
  bg: string;
  icon: string;
}> = [
  {
    rating: 'helpful', label: 'Helpful ✓',
    desc: 'Clear and easy to understand',
    color: COLORS.success, bg: 'rgba(78,205,196,0.12)', icon: 'checkmark-circle-outline',
  },
  {
    rating: 'confusing', label: 'Confusing ?',
    desc: 'Hard to follow or unclear',
    color: COLORS.warning, bg: 'rgba(255,169,77,0.12)', icon: 'help-circle-outline',
  },
  {
    rating: 'wrong', label: 'Wrong Answer ✗',
    desc: 'Explanation contains errors',
    color: COLORS.error, bg: 'rgba(255,107,107,0.12)', icon: 'close-circle-outline',
  },
];

export function ExplanationFeedbackScreen({ navigation, route }: Props) {
  const { questionId, explanationId, packTitle } = route.params;
  const [selected, setSelected] = useState<ExplanationFeedbackRating | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { setFeedback } = useExplanationStore();
  const profile = useProfileStore((s) => s.profile);
  const userId = profile?.uid ?? 'anonymous';

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    await saveExplanationFeedback({
      userId, questionId, explanationId, rating: selected, comment: comment.trim(),
    }).catch(() => {});
    setFeedback(questionId, selected);
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => navigation.goBack(), 1200);
  };

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate Explanation</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.packLabel}>{packTitle}</Text>

          {submitted ? (
            <View style={styles.successState}>
              <Text style={styles.successEmoji}>🙏</Text>
              <Text style={styles.successTitle}>Thank you!</Text>
              <Text style={styles.successSub}>Your feedback helps us improve.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.question}>How was this explanation?</Text>

              {OPTIONS.map((opt) => {
                const isSelected = selected === opt.rating;
                return (
                  <TouchableOpacity
                    key={opt.rating}
                    style={[
                      styles.optionCard,
                      { backgroundColor: opt.bg, borderColor: isSelected ? opt.color : 'transparent' },
                    ]}
                    onPress={() => setSelected(opt.rating)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={opt.icon as any} size={28} color={opt.color} />
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, { color: opt.color }]}>{opt.label}</Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={opt.color} />
                    )}
                  </TouchableOpacity>
                );
              })}

              <View style={styles.commentSection}>
                <Text style={styles.commentLabel}>Optional comment</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="What could be improved?"
                  placeholderTextColor={COLORS.textMuted}
                  value={comment}
                  onChangeText={setComment}
                  maxLength={200}
                  multiline
                  numberOfLines={3}
                />
                <Text style={styles.charCount}>{comment.length}/200</Text>
              </View>

              <AppButton
                title={submitting ? 'Submitting…' : 'Submit Feedback'}
                onPress={handleSubmit}
                variant="primary"
                disabled={!selected || submitting}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  body: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['3xl'],
    gap: SPACING.md,
  },
  packLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
  },
  question: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 2,
  },
  optionText: { flex: 1 },
  optionLabel: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold },
  optionDesc: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  commentSection: { gap: SPACING.sm },
  commentLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  commentInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.base,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'right',
  },
  successState: {
    alignItems: 'center',
    paddingTop: SPACING['3xl'],
    gap: SPACING.md,
  },
  successEmoji: { fontSize: 56 },
  successTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  successSub: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sizes.sm },
});
