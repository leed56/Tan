import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>
      </div>
    </header>
  );
}
