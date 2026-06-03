import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  iconClassName?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className, iconClassName }: StatCardProps) {
  return (
    <Card className={cn('animate-fade-in', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className={cn('mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', trend.value >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </div>
            )}
          </div>
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary', iconClassName)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
