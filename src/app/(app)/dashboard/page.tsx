'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Logado como: <span className="font-medium">{user?.name ?? '...'}</span>
        </p>
        <Button onClick={logout} variant="outline">
          Sair
        </Button>
      </div>
    </main>
  );
}