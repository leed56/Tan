import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { TopBar } from './TopBar';
import { NAV_ITEMS } from './navItems';

// Derive route → page title from the sidebar's own nav list instead of
// duplicating it here — keeps the TopBar title in sync with SidebarNav.
const ROUTE_TITLES: Record<string, string> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.href.replace(/^\//, ''), item.label])
);

function titleForPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0] ?? '';
  if (!segment) return 'Dashboard';
  return ROUTE_TITLES[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function AppLayout() {
  const location = useLocation();
  const title = titleForPath(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
