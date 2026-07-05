import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import type { Subject } from '../../types';

interface SubjectCardProps {
  subject: Subject;
  onPress: (subject: Subject) => void;
  isSelected?: boolean;
  showProgress?: boolean;
}

export function SubjectCard({ subject, onPress, isSelected = false, showProgress = true }: SubjectCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(subject)}
      activeOpacity={0.8}
      style={[styles.wrapper, isSelected && styles.selectedWrapper]}
    >
      <LinearGradient
        colors={subject.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconBox}
      >
        <Ionicons name={subject.iconName as keyof typeof Ionicons.glyphMap} size={28} color="#fff" />
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{subject.name}</Text>

        {showProgress && (
          <>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${subject.progressPercent}%`, backgroundColor: subject.color },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {subject.completedTopics} / {subject.totalTopics} topics
            </Text>
          </>
        )}
      </View>

      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: subject.color }]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  selectedWrapper: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(123, 111, 242, 0.1)',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: { flex: 1, gap: SPACING.xs },
  name: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: RADIUS.full,
    minWidth: 4,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
