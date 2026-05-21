'use client';

import { AxiosError } from 'axios';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

import { AlunoForm } from '@/components/aluno-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAluno, useUpdateAluno } from '@/hooks/use-alunos';
import type { AlunoFormValues } from '@/schemas/aluno';
import type { UpdateAlunoPayload } from '@/types/aluno';
import type { LaravelValidationError } from '@/types/auth';
import { RoleGuard } from '@/components/role-guard';

interface EditarAlunoPageProps {
  params: Promise<{ id: string }>;
}

export default function EditarAlunoPage({ params }: EditarAlunoPageProps) {
  const { id: idParam } = use(params);
  const id = Number(idParam);

  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>();

  const alunoQuery = useAluno(id);
  const updateMutation = useUpdateAluno(id);

  function handleSubmit(values: AlunoFormValues) {
    setApiErrors(undefined);

    const payload: UpdateAlunoPayload = {
      nome: values.nome.trim(),
      telefone: values.telefone.replace(/\D/g, ''),
      email: values.email || null,
      plano_id: values.plano_id,
      valor_personalizado:
        values.valor_personalizado === ''
          ? null
          : Number(values.valor_personalizado),
      dia_vencimento: values.dia_vencimento,
      data_matricula: values.data_matricula,
      horario_treino: values.horario_treino.trim() || null,
      observacoes: values.observacoes.trim() || null,
    };

    updateMutation.mutate(payload, {
      onSuccess: (aluno) => {
        toast.success(`Aluno ${aluno.nome} atualizado!`);
        router.push(`/alunos/${aluno.id}`);
      },
      onError: (error) => {
        if (error instanceof AxiosError && error.response?.status === 422) {
          const data = error.response.data as LaravelValidationError;
          setApiErrors(data.errors);
          toast.error('Verifica os campos do formulário');
          return;
        }
        toast.error('Erro ao atualizar aluno');
      },
    });
  }

  if (alunoQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (alunoQuery.isError || !alunoQuery.data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/alunos" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Editar aluno</h1>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Aluno não encontrado.
        </div>
      </div>
    );
  }

  const aluno = alunoQuery.data;

  const formDefaults: Partial<AlunoFormValues> = {
    nome: aluno.nome,
    telefone: aluno.telefone,
    email: aluno.email ?? '',
    plano_id: aluno.plano_id,
    valor_personalizado:
      aluno.valor_personalizado != null
        ? String(aluno.valor_personalizado)
        : '',
    dia_vencimento: aluno.dia_vencimento,
    data_matricula: aluno.data_matricula,
    horario_treino: aluno.horario_treino ?? '',
    observacoes: aluno.observacoes ?? '',
  };

  return (
    <RoleGuard allowedRoles={['admin', 'professor']}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/alunos/${id}`} aria-label="Voltar">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Editar aluno</h1>
        </div>

        <AlunoForm
          defaultValues={formDefaults}
          onSubmit={handleSubmit}
          submitLabel="Salvar alterações"
          isSubmitting={updateMutation.isPending}
          apiErrors={apiErrors}
        />
      </div>
    </RoleGuard>
  );
}