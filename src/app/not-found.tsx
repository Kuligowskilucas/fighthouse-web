import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
      <div>
        <p className="text-6xl font-bold text-red-600">404</p>
        <p className="mt-2 text-lg font-medium text-gray-900">
          Página não encontrada
        </p>
        <p className="mt-1 text-sm text-gray-500">
          A página que você procura não existe ou foi movida.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Voltar pra home</Link>
      </Button>
    </div>
  );
}