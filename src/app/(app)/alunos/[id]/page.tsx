'use client';

import { AxiosError } from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  Pencil,
  Power,
  Trash2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

import { MensalidadeRow } from '@/components/mensalidade-row';
import { MetricCard } from '@/components/metric-card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAluno,
  useDeleteAluno,
  useUpdateAluno,
} from '@/hooks/use-alunos';
import { formatCurrency, formatDate, formatTelefone } from '@/lib/format';
import { ErrorState } from '@/components/error-state';
import { RoleGuard } from '@/components/role-guard';


type ConfirmAction = 'desativar' | 'reativar' | 'excluir' | null;

interface AlunoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AlunoDetailPage({ params }: AlunoDetailPageProps) {
  const { id: idParam } = use(params);
  const id = Number(idParam);

  const router = useRouter();
  const [confirm, setConfirm] = useState<ConfirmAction>(null);

  const alunoQuery = useAluno(id);
  const updateMutation = useUpdateAluno(id);
  const deleteMutation = useDeleteAluno();

  function handleToggleAtivo(novoEstado: boolean) {
    updateMutation.mutate(
      { ativo: novoEstado },
      {
        onSuccess: () => {
          toast.success(novoEstado ? 'Aluno reativado' : 'Aluno desativado');
          setConfirm(null);
        },
        onError: () => {
          toast.error('Erro ao atualizar aluno');
          setConfirm(null);
        },
      },
    );
  }

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Aluno excluído');
        router.push('/alunos');
      },
      onError: (error) => {
        if (error instanceof AxiosError && error.response?.status === 409) {
          toast.error(
            error.response.data?.message ??
              'Não é possível excluir um aluno com mensalidades.',
          );
          setConfirm(null);
          return;
        }
        toast.error('Erro ao excluir aluno');
        setConfirm(null);
      },
    });
  }

  if (alunoQuery.isLoading) {
    return <AlunoDetailSkeleton />;
  }

  if (alunoQuery.isError || !alunoQuery.data) {
    const isNotFound =
      alunoQuery.error instanceof AxiosError &&
      alunoQuery.error.response?.status === 404;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/alunos" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Aluno</h1>
        </div>
        {isNotFound ? (
          <ErrorState
            title="Aluno não encontrado"
            message="Esse aluno não existe ou foi excluído."
          />
        ) : (
          <ErrorState
            message="Não foi possível carregar os dados do aluno."
            onRetry={() => alunoQuery.refetch()}
          />
        )}
      </div>
    );
  }

  const aluno = alunoQuery.data;
  const podeExcluir = aluno.resumo_financeiro.total_mensalidades === 0;
  const isMutating = updateMutation.isPending || deleteMutation.isPending;

  return (
    <RoleGuard allowedRoles={['admin', 'professor']}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/alunos" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h1 className="truncate text-2xl font-bold">{aluno.nome}</h1>
            {!aluno.ativo && (
              <Badge variant="secondary" className="shrink-0">
                Inativo
              </Badge>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/alunos/${id}/editar`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirm(aluno.ativo ? 'desativar' : 'reativar')}
            disabled={isMutating}
          >
            <Power className="h-4 w-4" />
            {aluno.ativo ? 'Desativar' : 'Reativar'}
          </Button>
          {podeExcluir && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirm('excluir')}
              disabled={isMutating}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          )}
        </div>

        {/* Dados pessoais */}
        <Card>
          <CardContent className="space-y-3 p-4 text-sm">
            <DataRow label="Telefone" value={formatTelefone(aluno.telefone)} />
            {aluno.email && <DataRow label="E-mail" value={aluno.email} />}
            <DataRow label="Plano" value={aluno.plano.nome} />
            <DataRow
              label="Valor"
              value={
                aluno.valor_personalizado != null
                  ? `${formatCurrency(aluno.valor_efetivo)} (personalizado)`
                  : formatCurrency(aluno.valor_efetivo)
              }
            />
            <DataRow label="Vence todo dia" value={String(aluno.dia_vencimento)} />
            <DataRow
              label="Matriculado em"
              value={`${formatDate(aluno.data_matricula)} (${aluno.dias_matriculado} dias)`}
            />
            {aluno.horario_treino && (
              <DataRow label="Horário de treino" value={aluno.horario_treino} />
            )}
            {aluno.observacoes && (
              <DataRow label="Observações" value={aluno.observacoes} />
            )}
          </CardContent>
        </Card>

        {/* Resumo financeiro */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Resumo financeiro</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <MetricCard
              label="Pagas"
              value={String(aluno.resumo_financeiro.pagas)}
              icon={CheckCircle}
            />
            <MetricCard
              label="Em aberto"
              value={String(aluno.resumo_financeiro.abertas)}
              icon={Clock}
            />
            <MetricCard
              label="Atrasadas"
              value={String(aluno.resumo_financeiro.atrasadas)}
              icon={AlertCircle}
              variant={aluno.resumo_financeiro.atrasadas > 0 ? 'danger' : 'default'}
            />
          </div>
          <p className="text-xs text-gray-500">
            Total pago: {formatCurrency(aluno.resumo_financeiro.valor_total_pago)}
          </p>
        </section>

        {/* Histórico de mensalidades */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Mensalidades ({aluno.mensalidades.length})
          </h2>
          {aluno.mensalidades.length === 0 ? (
            <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
              <p>Nenhuma mensalidade registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {aluno.mensalidades.map((m) => (
                <MensalidadeRow key={m.id} mensalidade={m} />
              ))}
            </div>
          )}
        </section>

        {/* Confirmações */}
        <AlertDialog
          open={confirm === 'desativar'}
          onOpenChange={(open) => !open && setConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desativar aluno?</AlertDialogTitle>
              <AlertDialogDescription>
                {aluno.nome} não vai mais aparecer na lista por padrão. Você pode
                reativar a qualquer momento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isMutating}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleToggleAtivo(false)}
                disabled={isMutating}
              >
                Desativar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={confirm === 'reativar'}
          onOpenChange={(open) => !open && setConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reativar aluno?</AlertDialogTitle>
              <AlertDialogDescription>
                {aluno.nome} vai voltar a aparecer na lista de ativos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isMutating}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleToggleAtivo(true)}
                disabled={isMutating}
              >
                Reativar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={confirm === 'excluir'}
          onOpenChange={(open) => !open && setConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir aluno?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. {aluno.nome} será removido
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isMutating}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isMutating}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  );
}

function AlunoDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}