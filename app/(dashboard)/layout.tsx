'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { ProtectedRoute } from '@/components/layout/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto w-full lg:pt-0 pt-16">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
