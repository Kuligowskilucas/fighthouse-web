import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { AppHeader } from '@/components/app-header';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-white">
        <AppHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}