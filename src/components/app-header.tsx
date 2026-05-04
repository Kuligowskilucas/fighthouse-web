'use client';

import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/user-menu';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
        <span className="text-lg font-bold text-red-600">Fight House</span>

        <UserMenu
          trigger={
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          }
        />
      </div>
    </header>
  );
}