'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { AlunosListSkeleton } from '@/components/alunos-list-skeleton';
import { MensalidadeRow } from '@/components/mensalidade-row';
import { Pagination } from '@/components/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMensalidadesList } from '@/hooks/use-mensalidades';
import { gerarOpcoesMeses } from '@/lib/format';
import type { StatusMensalidade } from '@/types/mensalidade';
import { CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { Button } from '@/components/ui/button';
import { useGerarMensalidades } from '@/hooks/use-mensalidades';
import { formatMesReferencia } from '@/lib/format';
import { ErrorState } from '@/components/error-state';
import { RoleGuard } from '@/components/role-guard';



const TABS: Array<{ value: string; label: string; status?: StatusMensalidade }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'aberta', label: 'Abertas', status: 'aberta' },
  { value: 'atrasada', label: 'Atrasadas', status: 'atrasada' },
  { value: 'paga', label: 'Pagas', status: 'paga' },
];

function getMesAtualValue(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}-01`;
}

export default function MensalidadesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const opcoesMeses = useMemo(() => gerarOpcoesMeses(), []);

  // URL como source of truth
  const tab = searchParams.get('tab') ?? 'todas';
  const mes = searchParams.get('mes') ?? getMesAtualValue();
  const page = Number(searchParams.get('page')) || 1;

  const tabConfig = TABS.find((t) => t.value === tab) ?? TABS[0];

  const [confirmGerar, setConfirmGerar] = useState(false);
  const gerarMutation = useGerarMensalidades();

  function handleGerar() {
    // Backend espera 'YYYY-MM', o select tem 'YYYY-MM-DD'
    const mesYM = mes.slice(0, 7);

    gerarMutation.mutate(
      { mes_referencia: mesYM },
      {
        onSuccess: (data) => {
          const mesLabel = formatMesReferencia(data.mes_referencia);
          if (data.criadas === 0) {
            toast.info(`Todas as mensalidades de ${mesLabel} já existiam.`);
          } else if (data.ignoradas === 0) {
            toast.success(
              `${data.criadas} ${data.criadas === 1 ? 'mensalidade gerada' : 'mensalidades geradas'}.`,
            );
          } else {
            toast.success(
              `${data.criadas} novas, ${data.ignoradas} já existiam.`,
            );
          }
          setConfirmGerar(false);
        },
        onError: () => {
          toast.error('Erro ao gerar mensalidades.');
          setConfirmGerar(false);
        },
      },
    );
  }

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleTabChange(novaTab: string) {
    updateParams({ tab: novaTab === 'todas' ? null : novaTab, page: null });
  }

  function handleMesChange(novoMes: string) {
    updateParams({ mes: novoMes, page: null });
  }

  function handlePageChange(novaPage: number) {
    updateParams({ page: String(novaPage) });
  }

const { data, isLoading, isError, refetch } = useMensalidadesList({
  status: tabConfig.status,
  mes_referencia: mes,
  ativo: true,
  page,
});

  return (
    <RoleGuard allowedRoles={['admin', 'professor']}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Mensalidades</h1>
          <Button size="sm" variant="outline" onClick={() => setConfirmGerar(true)} disabled={gerarMutation.isPending}>
            <CalendarPlus className="h-4 w-4" />
            Gerar
          </Button>
        </div>
    
        <div className="space-y-3">
          <Select value={mes} onValueChange={handleMesChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {opcoesMeses.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="flex-1">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
            
        {isLoading ? (
          <AlunosListSkeleton />
        ) : isError ? (
          <ErrorState
            message="Não foi possível carregar a lista de mensalidades."
            onRetry={() => refetch()}
          />
        ) : !data || data.data.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
            Nenhuma mensalidade encontrada com esses filtros.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {data.data.map((mensalidade) => (
                <MensalidadeRow
                  key={mensalidade.id}
                  mensalidade={mensalidade}
                  showAluno
                />
              ))}
            </div>
            <Pagination meta={data.meta} onPageChange={handlePageChange} />
          </>
        )}
        <AlertDialog open={confirmGerar} onOpenChange={setConfirmGerar}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Gerar mensalidades de {formatMesReferencia(mes)}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Vai criar uma mensalidade pra cada aluno ativo que ainda não tem
                mensalidade nesse mês. Alunos que já têm são ignorados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={gerarMutation.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleGerar}
                disabled={gerarMutation.isPending}
              >
                {gerarMutation.isPending ? 'Gerando...' : 'Gerar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}