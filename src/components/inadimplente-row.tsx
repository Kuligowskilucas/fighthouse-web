import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import type { InadimplenteItem } from '@/types/dashboard';

interface InadimplenteRowProps { item: InadimplenteItem; }

export function InadimplenteRow({ item }: InadimplenteRowProps) {
  const { aluno, quantidade_atrasadas, valor_total_devido, dias_atraso } = item;

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900">{aluno.nome}</p>
          <p className="truncate text-xs text-gray-500">{aluno.plano}</p>
          <p className="mt-1 text-xs text-red-600">
            {dias_atraso} {dias_atraso === 1 ? 'dia' : 'dias'} de atraso
            {quantidade_atrasadas > 1 && ` · ${quantidade_atrasadas} mensalidades`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-semibold text-red-600">
            {formatCurrency(valor_total_devido)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}