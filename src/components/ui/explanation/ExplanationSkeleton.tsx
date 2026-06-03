import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../../theme';

function SkeletonBox({ height, width = '100%' }: { height: number; width?: string | number }) {
  return <View style={[styles.box, { height, width: width as any }]} />;
}

export function ExplanationSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox height={20} width="60%" />
      <View style={styles.card}>
        <SkeletonBox height={14} />
        <SkeletonBox height={14} width="85%" />
        <SkeletonBox height={14} width="70%" />
      </View>
      <View style={styles.card}>
        <SkeletonBox height={14} />
        <SkeletonBox height={14} width="90%" />
      </View>
      <View style={styles.card}>
        <SkeletonBox height={14} />
        <SkeletonBox height={14} width="75%" />
        <SkeletonBox height={14} width="60%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.md },
  box: {
    backgroundColor: COLORS.bgCardLight,
    borderRadius: RADIUS.sm,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
});
