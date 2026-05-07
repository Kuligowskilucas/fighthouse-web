import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatTelefone } from '@/lib/format';
import type { Aluno } from '@/types/aluno';

interface AlunoListItemProps {
  aluno: Aluno;
}

export function AlunoListItem({ aluno }: AlunoListItemProps) {
  return (
    <Link href={`/alunos/${aluno.id}`} className="block">
      <Card className="transition-colors hover:bg-gray-50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-gray-900">{aluno.nome}</p>
              {!aluno.ativo && (
                <Badge variant="secondary" className="shrink-0">
                  Inativo
                </Badge>
              )}
            </div>
            <p className="truncate text-xs text-gray-500">{aluno.plano.nome}</p>
            <p className="text-xs text-gray-500">{formatTelefone(aluno.telefone)}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
        </CardContent>
      </Card>
    </Link>
  );
}