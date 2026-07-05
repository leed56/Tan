import React from 'react';
import {
  LayoutDashboard, BookOpen, HelpCircle, Users, CreditCard,
  BarChart3, FileText, Bell, Settings,
} from 'lucide-react';
import type { AdminRole } from '../../types';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: AdminRole[];
}

export const NAV_ITEMS: NavItem[] = [
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
