'use client';

import { AlertCircle, CalendarDays, CheckCircle2, TrendingUp, Users, Wallet } from 'lucide-react';

import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { InadimplenteRow } from '@/components/inadimplente-row';
import { MetricCard } from '@/components/metric-card';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardResumo, useInadimplentes, useRecebidosHoje } from '@/hooks/use-dashboard';
import { formatCurrency, formatMesReferencia } from '@/lib/format';
import { ErrorState } from '@/components/error-state';
import { RoleGuard } from '@/components/role-guard';
import type { RecebidoHojeItem } from '@/types/dashboard';
import { usePlanos } from '@/hooks/use-planos'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Aluno } from '@/types/aluno'
import TurmaCard from '@/components/turma-card'
import { LayoutGrid } from 'lucide-react'

const formaPagamentoLabel: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  transferencia: 'Transferência',
};

function RecebidoHojeRow({ item }: { item: RecebidoHojeItem }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900">{item.aluno.nome}</p>
          <p className="text-xs text-gray-500">
            {formatMesReferencia(item.mes_referencia)}
            {item.forma_pagamento && ` · ${formaPagamentoLabel[item.forma_pagamento]}`}
          </p>
        </div>
        <p className="shrink-0 text-base font-semibold text-green-600">
          {formatCurrency(item.valor)}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const resumoQuery      = useDashboardResumo();
  const inadimplentesQuery = useInadimplentes();
  const recebidosQuery   = useRecebidosHoje();

  const planosQuery = usePlanos()
  const alunosQuery = useQuery({
    queryKey: ['alunos', 'todos-ativos'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Aluno[] }>('/alunos', {
        params: { ativo: 1, per_page: 999 },
      })
      return data.data
    },
  })

  if ( resumoQuery.isLoading || inadimplentesQuery.isLoading || recebidosQuery.isLoading || planosQuery.isLoading || alunosQuery.isLoading ) {
    return <DashboardSkeleton />
  }

  if ( resumoQuery.isError || inadimplentesQuery.isError || recebidosQuery.isError || planosQuery.isError || alunosQuery.isError ) {
    return (
      <ErrorState
        title="Erro ao carregar dashboard"
        message="Confere se o backend tá no ar e tenta de novo."
        onRetry={() => {
          resumoQuery.refetch();
          inadimplentesQuery.refetch();
          recebidosQuery.refetch();
        }}
      />
    );
  }

  const resumo         = resumoQuery.data!;
  const inadimplentes  = inadimplentesQuery.data!;
  const recebidos      = recebidosQuery.data!;

  const planos   = planosQuery.data ?? []
  const alunos   = alunosQuery.data ?? []

  const inadimplenteIds = new Set(inadimplentes.data.map(i => i.aluno.id))

  const alunosPorPlano = alunos.reduce<Record<number, Aluno[]>>((acc, aluno) => {
    if (!acc[aluno.plano_id]) acc[aluno.plano_id] = []
    acc[aluno.plano_id].push(aluno)
    return acc
  }, {})

  const turmasComHorario = planos.filter(p => p.dias_semana !== null)
  const planoLivre       = planos.find(p => p.dias_semana === null) ?? null

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Visão geral do mês atual</p>
        </div>

        {/* ── Métricas ── */}
        <section aria-labelledby="metricas-heading" className="space-y-3">
          <h2 id="metricas-heading" className="sr-only">Métricas do mês</h2>
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

        {/* ── Recebidos hoje ── */}
        <section aria-labelledby="recebidos-heading" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 id="recebidos-heading" className="font-semibold text-gray-900">
              Recebidos hoje
            </h2>
            {recebidos.quantidade > 0 && (
              <span className="text-xs text-gray-500">
                {formatCurrency(recebidos.total_recebido)}
              </span>
            )}
          </div>

          {recebidos.quantidade === 0 ? (
            <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-400" />
              <p>Nenhum pagamento registrado hoje.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recebidos.data.map((item) => (
                <RecebidoHojeRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* ── Turmas ── */}
        <section aria-labelledby="turmas-heading" className="space-y-3">
          <h2 id="turmas-heading" className="font-semibold text-gray-900">
            Turmas
          </h2>

          <div className="space-y-3">
            {turmasComHorario.map(plano => (
              <TurmaCard
                key={plano.id}
                plano={plano}
                alunos={alunosPorPlano[plano.id] ?? []}
                inadimplenteIds={inadimplenteIds}
              />
            ))}

            {planoLivre && (
              <TurmaCard
                plano={planoLivre}
                alunos={alunosPorPlano[planoLivre.id] ?? []}
                isLivre
                inadimplenteIds={inadimplenteIds}
              />
            )}
          </div>
        </section>
      </div>
    </RoleGuard>
  );
}