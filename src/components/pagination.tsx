'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types/pagination';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  // Não mostra paginação se só tem 1 página
  if (meta.last_page <= 1) return null;

  const canGoBack = meta.current_page > 1;
  const canGoForward = meta.current_page < meta.last_page;

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <p className="text-xs text-gray-500">
        {meta.from}–{meta.to} de {meta.total}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={!canGoBack}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={!canGoForward}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}