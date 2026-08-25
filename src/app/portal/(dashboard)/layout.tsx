import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardSidebar from '@/components/DashboardSidebar';
import PortalMobileHeader from '@/components/PortalMobileHeader';
import IdleTimeoutGuard from '@/components/IdleTimeoutGuard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/portal/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 🔒 20-Minute Staff Room Idle Auto-Timeout Guard */}
      <IdleTimeoutGuard idleMinutes={20} warningMinutes={18} />

      {/* Organized Desktop Sidebar */}
      <DashboardSidebar session={session} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header and Drawer */}
        <PortalMobileHeader session={session} />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
