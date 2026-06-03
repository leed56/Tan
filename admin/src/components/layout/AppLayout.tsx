import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
