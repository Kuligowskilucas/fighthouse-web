'use client';

import { AlertCircle, CalendarDays, TrendingUp, Users, Wallet } from 'lucide-react';

import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { InadimplenteRow } from '@/components/inadimplente-row';
import { MetricCard } from '@/components/metric-card';
import { useDashboardResumo, useInadimplentes } from '@/hooks/use-dashboard';
import { formatCurrency } from '@/lib/format';
import { ErrorState } from '@/components/error-state';

export default function DashboardPage() {
  const resumoQuery = useDashboardResumo();
  const inadimplentesQuery = useInadimplentes();


  
  if (resumoQuery.isLoading || inadimplentesQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (resumoQuery.isError || inadimplentesQuery.isError) {
    return (
      <ErrorState
        title="Erro ao carregar dashboard"
        message="Confere se o backend tá no ar e tenta de novo."
        onRetry={() => {
          resumoQuery.refetch();
          inadimplentesQuery.refetch();
        }}
      />
    );
  }

  const resumo = resumoQuery.data!;
  const inadimplentes = inadimplentesQuery.data!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Visão geral do mês atual
        </p>
      </div>

      <section aria-labelledby="metricas-heading" className="space-y-3">
        <h2 id="metricas-heading" className="sr-only">
          Métricas do mês
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <MetricCard
            label="Recebido no mês"
            value={formatCurrency(resumo.financeiro.recebido_no_mes)}
            icon={TrendingUp}
          />
          <MetricCard
            label="A receber no mês"
            value={formatCurrency(resumo.financeiro.a_receber_no_mes)}
            icon={CalendarDays}
          />
          <MetricCard
            label="Total atrasado"
            value={formatCurrency(resumo.financeiro.total_atrasado_geral)}
            icon={Wallet}
            variant="danger"
          />
          <MetricCard
            label="Inadimplentes"
            value={`${resumo.inadimplencia.alunos_inadimplentes} ${
              resumo.inadimplencia.alunos_inadimplentes === 1 ? 'aluno' : 'alunos'
            }`}
            icon={Users}
            variant="danger"
          />
        </div>
      </section>

      <section aria-labelledby="inadimplentes-heading" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="inadimplentes-heading" className="font-semibold text-gray-900">
            Inadimplentes
          </h2>
          {inadimplentes.data.length > 0 && (
            <span className="text-xs text-gray-500">
              {inadimplentes.data.length}{' '}
              {inadimplentes.data.length === 1 ? 'pessoa' : 'pessoas'}
            </span>
          )}
        </div>

        {inadimplentes.data.length === 0 ? (
          <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4 shrink-0 text-gray-400" />
            <p>Nenhum aluno com mensalidade em atraso. 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inadimplentes.data.map((item) => (
              <InadimplenteRow key={item.aluno.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}