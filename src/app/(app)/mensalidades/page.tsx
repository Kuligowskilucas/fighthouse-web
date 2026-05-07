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

  const { data, isLoading, isError } = useMensalidadesList({
    status: tabConfig.status,
    mes_referencia: mes,
    page,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mensalidades</h1>

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
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Erro ao carregar mensalidades. Tenta recarregar a página.
        </div>
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
    </div>
  );
}