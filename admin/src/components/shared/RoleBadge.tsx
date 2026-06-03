import React from 'react';
import { Badge } from '../ui/badge';
import type { AdminRole } from '../../types';

interface RoleBadgeProps { role: AdminRole; }

const ROLE_CONFIG: Record<AdminRole, { label: string; variant: 'default' | 'secondary' | 'info' }> = {
  super_admin: { label: 'Super Admin', variant: 'default' },
  content_editor: { label: 'Content Editor', variant: 'info' },
  viewer: { label: 'Viewer', variant: 'secondary' },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
