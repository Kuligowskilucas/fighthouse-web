'use client';

import { ChevronLeft, ChevronRight, TrendingUp, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { ErrorState } from '@/components/error-state';
import { MetricCard } from '@/components/metric-card';
import { RoleGuard } from '@/components/role-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCicloResumo } from '@/hooks/use-dashboard';
import { formatCurrency, formatDate, formatMesReferencia, shiftReferencia } from '@/lib/format';
import type { CicloPagante } from '@/types/dashboard';


const formaPagamentoLabel: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  transferencia: 'Transferência',
  mercado_pago: 'Mercado Pago',
};

function tituloCiclo(referencia: string): string {
  const [ano, mes] = referencia.split('-');
  const nomes = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  return `${nomes[Number(mes) - 1]} de ${ano}`;
}

function PaganteRow({ item }: { item: CicloPagante }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900">{item.aluno.nome}</p>
          <p className="text-xs text-gray-500">
            ref: {formatMesReferencia(item.mes_referencia)}
            {item.forma_pagamento && ` · ${formaPagamentoLabel[item.forma_pagamento]}`}
            {` · ${formatDate(item.data_pagamento)}`}
          </p>
        </div>
        <p className="shrink-0 text-base font-semibold text-green-600">
          {formatCurrency(item.valor)}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardCicloPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodo = searchParams.get('periodo') ?? undefined;

  const { data, isLoading, isError, refetch, isPlaceholderData } = useCicloResumo(periodo);

  function irPara(ref: string) {
    router.replace(`/dashboard/ciclo?periodo=${ref}`);
  }

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <ErrorState
        title="Erro ao carregar o fechamento"
        message="Confere se o backend tá no ar e tenta de novo."
        onRetry={() => refetch()}
      />
    );
  }

  const { periodo: p } = data;

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Fechamento</h1>
          <p className="text-sm text-gray-500">Pagamentos recebidos por ciclo de cobrança</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={!p.tem_anterior || isPlaceholderData}
            onClick={() => irPara(shiftReferencia(p.referencia, -1))}
            aria-label="Ciclo anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <p className="font-semibold capitalize text-gray-900">
              {tituloCiclo(p.referencia)}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(p.inicio)} – {formatDate(p.fim)}
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={!p.tem_proximo || isPlaceholderData}
            onClick={() => irPara(shiftReferencia(p.referencia, 1))}
            aria-label="Próximo ciclo"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <MetricCard
            label="Recebido no período"
            value={formatCurrency(data.total_recebido)}
            icon={TrendingUp}
          />
          <MetricCard
            label="Pagamentos"
            value={`${data.quantidade} ${data.quantidade === 1 ? 'pagamento' : 'pagamentos'}`}
            icon={Users}
          />
        </div>

        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900">Pagantes do período</h2>
          {data.pagantes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-gray-500">
                Nenhum pagamento recebido neste ciclo.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {data.pagantes.map((item) => (
                <PaganteRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </RoleGuard>
  );
}