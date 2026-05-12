'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log pra console em dev, em prod (depois) podemos mandar pro Sentry/etc
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
      <AlertCircle className="h-12 w-12 text-red-600" />
      <div>
        <p className="text-lg font-medium text-gray-900">Algo deu errado</p>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          Um erro inesperado aconteceu. Você pode tentar de novo ou voltar pra
          home.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
        <Button asChild>
          <a href="/">Voltar pra home</a>
        </Button>
      </div>
    </div>
  );
}