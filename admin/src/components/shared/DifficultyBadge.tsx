import React from 'react';
import { Badge } from '../ui/badge';

interface DifficultyBadgeProps { difficulty: 'easy' | 'medium' | 'hard'; }

const DIFF_MAP = {
  easy: { label: 'Easy', variant: 'success' as const },
  medium: { label: 'Medium', variant: 'warning' as const },
  hard: { label: 'Hard', variant: 'destructive' as const },
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const config = DIFF_MAP[difficulty];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
