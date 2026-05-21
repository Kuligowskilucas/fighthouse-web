'use client';

import { ShieldX } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/types/auth';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    const homeByRole: Record<UserRole, string> = {
      admin:     '/dashboard',
      professor: '/alunos',
      aluno:     '/meu-perfil',
    };

    const home = user ? homeByRole[user.role] : '/login';

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="mb-1 text-xl font-bold text-gray-900">Acesso negado</h1>
        <p className="mb-6 text-sm text-gray-500">
          Você não tem permissão para acessar esta página.
        </p>
        <Button variant="outline" onClick={() => router.replace(home)}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}