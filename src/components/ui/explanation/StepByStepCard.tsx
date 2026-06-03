import React from 'react';
import { GoldExplanationCard } from './GoldExplanationCard';
import { MathStepRenderer } from './MathStepRenderer';
import { COLORS } from '../../../theme';

interface Props {
  steps: string[];
  defaultExpanded?: boolean;
}

export function StepByStepCard({ steps, defaultExpanded = false }: Props) {
  if (!steps || steps.length === 0) return null;
  return (
    <GoldExplanationCard
      title="Step-by-Step Solution"
      icon="calculator-outline"
      defaultExpanded={defaultExpanded}
      accentColor={COLORS.primary}
    >
      <MathStepRenderer steps={steps} />
    </GoldExplanationCard>
  );
}
