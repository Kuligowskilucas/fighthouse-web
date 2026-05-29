'use client';

import { useMutation } from '@tanstack/react-query';
import { LayoutDashboard, LayoutGrid, LogOut, User, Users, Wallet } from 'lucide-react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';

interface UserMenuProps {
  trigger: React.ReactNode;
}

export function UserMenu({ trigger }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout, isAdmin, isProfessor, isAluno } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/logout'),
    onSettled: () => {
      logout();
      router.replace('/login');
    },
  });

  const roleLabel: Record<string, string> = {
    admin:     'Administrador',
    professor: 'Professor',
    aluno:     'Aluno',
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex w-72 flex-col">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="text-left">
            <span className="block font-medium text-gray-900">{user?.name ?? '...'}</span>
            <span className="text-xs text-gray-500">
              {user?.role ? roleLabel[user.role] : ''}
            </span>
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <nav className="flex flex-col gap-1 px-2">
          {/* Dashboard — só admin */}
          {isAdmin && (
            <NavLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} onClick={() => setOpen(false)} />
          )}

          {/* Alunos e Mensalidades — admin e professor */}
          {(isAdmin || isProfessor) && (
            <>
              <NavLink href="/alunos" label="Alunos" icon={Users} onClick={() => setOpen(false)} />
              <NavLink href="/mensalidades" label="Mensalidades" icon={Wallet} onClick={() => setOpen(false)} />
              <NavLink href="/planos" label="Planos" icon={LayoutGrid} onClick={() => setOpen(false)} />
            </>
          )}

          {/* Gerenciar usuários — só admin */}
          {isAdmin && (
            <NavLink href="/usuarios" label="Usuários" icon={User} onClick={() => setOpen(false)} />
          )}

          {/* Meu perfil — só aluno */}
          {isAluno && (
            <NavLink href="/meu-perfil" label="Meu perfil" icon={User} onClick={() => setOpen(false)} />
          )}
        </nav>

        <div className="mt-auto px-2 pb-2">
          <Separator className="mb-2" />
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NavLink({
  href, label, icon: Icon, onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}