'use client';

import { ShieldX } from 'lucide-react';
import { AlertCircle, CalendarDays, CheckCircle, Clock } from 'lucide-react';

import { MensalidadeRow } from '@/components/mensalidade-row';
import { MetricCard } from '@/components/metric-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/error-state';
import { useAuth } from '@/hooks/use-auth';
import { useMeuPerfil } from '@/hooks/use-meu-perfil';
import { formatCurrency, formatDate, formatTelefone } from '@/lib/format';

export default function MeuPerfilPage() {
  const { user } = useAuth();
  const temAlunoVinculado = !!user?.aluno_id;

  const { data: aluno, isLoading, isError, refetch } = useMeuPerfil(temAlunoVinculado);

  // Admin/professor sem aluno vinculado — mostra só dados da conta
  if (!temAlunoVinculado) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Meu perfil</h1>
        <Card>
          <CardContent className="space-y-2 pt-4 text-sm">
            <DataRow label="Nome"  value={user?.name ?? ''} />
            <DataRow label="Email" value={user?.email ?? ''} />
            <DataRow label="Tipo"  value={roleLabel[user?.role ?? 'admin']} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <MeuPerfilSkeleton />;

  if (isError || !aluno) {
    return (
      <ErrorState
        message="Não foi possível carregar seu perfil."
        onRetry={() => refetch()}
      />
    );
  }

  const r = aluno.resumo_financeiro;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{aluno.nome}</h1>

      <Card>
        <CardContent className="space-y-2 pt-4 text-sm">
          <DataRow label="Telefone" value={formatTelefone(aluno.telefone)} />
          {aluno.email && <DataRow label="E-mail" value={aluno.email} />}
          <DataRow label="Plano" value={aluno.plano.nome} />
          <DataRow label="Mensalidade" value={formatCurrency(aluno.valor_efetivo)} />
          <DataRow label="Matriculado em" value={formatDate(aluno.data_matricula)} />
          <DataRow
            label="Situação"
            value={
              <Badge variant={aluno.ativo ? 'default' : 'secondary'}>
                {aluno.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            }
          />
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-base font-semibold">Resumo financeiro</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MetricCard label="Pagas"     value={String(r.pagas)}    icon={CheckCircle} />
          <MetricCard label="Em aberto" value={String(r.abertas)}  icon={Clock} />
          <MetricCard
            label="Atrasadas"
            value={String(r.atrasadas)}
            icon={AlertCircle}
            variant={r.atrasadas > 0 ? 'danger' : 'default'}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Total pago: {formatCurrency(r.valor_total_pago)}
        </p>
      </section>

      {aluno.mensalidades.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold">Histórico</h2>
          <div className="space-y-2">
            {aluno.mensalidades.map((m) => (
              <MensalidadeRow key={m.id} mensalidade={m} readOnly />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Helpers locais
const roleLabel: Record<string, string> = {
  admin:     'Administrador',
  professor: 'Professor',
  aluno:     'Aluno',
};

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MeuPerfilSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}