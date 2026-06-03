import React from 'react';
import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: string;
}

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'info' | 'default' | 'outline';

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Active', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  verified: { label: 'Verified', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  suspended: { label: 'Suspended', variant: 'destructive' },
  free: { label: 'Free', variant: 'secondary' },
  premium: { label: 'Premium', variant: 'success' },
  family: { label: 'Family', variant: 'info' },
  enabled: { label: 'Enabled', variant: 'success' },
  disabled: { label: 'Disabled', variant: 'secondary' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_MAP[status.toLowerCase()] ?? { label: status, variant: 'secondary' as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
