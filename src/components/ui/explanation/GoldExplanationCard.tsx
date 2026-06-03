import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../theme';

interface Props {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  accentColor?: string;
}

export function GoldExplanationCard({
  title,
  icon,
  children,
  defaultExpanded = false,
  accentColor = COLORS.gold,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.card, { borderColor: `${accentColor}30` }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.75}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${accentColor}18` }]}>
          <Ionicons name={icon as any} size={16} color={accentColor} />
        </View>
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>
      {expanded && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.base,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  body: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base,
    gap: SPACING.sm,
  },
});
