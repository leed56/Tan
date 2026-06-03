import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, HelpCircle, Users, CreditCard,
  BarChart3, FileText, Bell, Settings, LogOut, Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { signOut } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import type { AdminRole } from '../../types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: AdminRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['super_admin', 'content_editor', 'viewer'] },
  { label: 'Curriculum', href: '/curriculum', icon: <BookOpen size={18} />, roles: ['super_admin', 'content_editor'] },
  { label: 'Questions', href: '/questions', icon: <HelpCircle size={18} />, roles: ['super_admin', 'content_editor'] },
  { label: 'Students', href: '/students', icon: <Users size={18} />, roles: ['super_admin', 'viewer'] },
  { label: 'Subscriptions', href: '/subscriptions', icon: <CreditCard size={18} />, roles: ['super_admin'] },
  { label: 'Analytics', href: '/analytics', icon: <BarChart3 size={18} />, roles: ['super_admin', 'viewer'] },
  { label: 'Content', href: '/content', icon: <FileText size={18} />, roles: ['super_admin', 'content_editor'] },
  { label: 'Notifications', href: '/notifications', icon: <Bell size={18} />, roles: ['super_admin'] },
  { label: 'Settings', href: '/settings', icon: <Settings size={18} />, roles: ['super_admin'] },
];

export function SidebarNav() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap size={16} className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Soma AI</p>
          <p className="text-[10px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {user?.displayName?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-medium text-foreground">{user?.displayName}</p>
            <p className="truncate text-[10px] text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
