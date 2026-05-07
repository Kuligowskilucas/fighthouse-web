import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, formatMesReferencia } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Mensalidade } from '@/types/aluno';

interface MensalidadeRowProps {
  mensalidade: Mensalidade;
}

const statusConfig = {
  paga: {
    label: 'Paga',
    badgeClass: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  atrasada: {
    label: 'Atrasada',
    badgeClass: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  aberta: {
    label: 'Aberta',
    badgeClass: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
} as const;

export function MensalidadeRow({ mensalidade }: MensalidadeRowProps) {
  const config = statusConfig[mensalidade.status];

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">
              {formatMesReferencia(mensalidade.mes_referencia)}
            </p>
            <Badge className={cn('shrink-0', config.badgeClass)}>
              {config.label}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Vence em {formatDate(mensalidade.data_vencimento)}
            {mensalidade.data_pagamento && (
              <> · Paga em {formatDate(mensalidade.data_pagamento)}</>
            )}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-gray-900">
          {formatCurrency(mensalidade.valor)}
        </p>
      </CardContent>
    </Card>
  );
}