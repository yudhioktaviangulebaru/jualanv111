import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ImpersonationBanner } from './ImpersonationBanner';

interface DashboardLayoutProps {
  children: ComponentChildren;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div class="flex min-h-screen">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          class="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div class="flex min-w-0 flex-1 flex-col">
        <Navbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <ImpersonationBanner />
        <main class="flex-1 p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
}
