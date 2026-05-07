'use client';

import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AlunoListItem } from '@/components/aluno-list-item';
import { AlunosListSkeleton } from '@/components/alunos-list-skeleton';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAlunos } from '@/hooks/use-alunos';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export default function AlunosListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL é a fonte de verdade
  const search = searchParams.get('search') ?? '';
  const incluirInativos = searchParams.get('incluirInativos') === 'true';
  const page = Number(searchParams.get('page')) || 1;

  // State local pro input (responsivo a digitação)
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Sincroniza debounced -> URL
  useEffect(() => {
    if (debouncedSearch === search) return;

    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    params.delete('page'); // muda busca = volta pra página 1
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleToggleInativos(checked: boolean) {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set('incluirInativos', 'true');
    } else {
      params.delete('incluirInativos');
    }
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    router.replace(`${pathname}?${params.toString()}`);
  }

  const { data, isLoading, isError } = useAlunos({
    search: search || undefined,
    ativo: incluirInativos ? undefined : true,
    page,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Alunos</h1>
        <Button asChild size="sm">
          <Link href="/alunos/novo">
            <Plus className="h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar por nome ou telefone"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="incluir-inativos"
            checked={incluirInativos}
            onCheckedChange={handleToggleInativos}
          />
          <Label htmlFor="incluir-inativos" className="text-sm text-gray-600">
            Incluir inativos
          </Label>
        </div>
      </div>

      {isLoading ? (
        <AlunosListSkeleton />
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Erro ao carregar alunos. Tenta recarregar a página.
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
          {search ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado ainda.'}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.data.map((aluno) => (
              <AlunoListItem key={aluno.id} aluno={aluno} />
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}