'use client';

import { AxiosError } from 'axios';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { AlunoForm } from '@/components/aluno-form';
import { Button } from '@/components/ui/button';
import { useCreateAluno } from '@/hooks/use-alunos';
import type { AlunoFormValues } from '@/schemas/aluno';
import type { CreateAlunoPayload } from '@/types/aluno';
import type { LaravelValidationError } from '@/types/auth';

export default function NovoAlunoPage() {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>();
  const createMutation = useCreateAluno();

  function handleSubmit(values: AlunoFormValues) {
    setApiErrors(undefined);

    const payload: CreateAlunoPayload = {
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
      observacoes: values.observacoes.trim() || null,
    };

    createMutation.mutate(payload, {
      onSuccess: (aluno) => {
        toast.success(`Aluno ${aluno.nome} cadastrado!`);
        router.push(`/alunos/${aluno.id}`);
      },
      onError: (error) => {
        if (error instanceof AxiosError && error.response?.status === 422) {
          const data = error.response.data as LaravelValidationError;
          setApiErrors(data.errors);
          toast.error('Verifica os campos do formulário');
          return;
        }
        toast.error('Erro ao cadastrar aluno');
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/alunos" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Novo aluno</h1>
      </div>

      <AlunoForm
        onSubmit={handleSubmit}
        submitLabel="Cadastrar"
        isSubmitting={createMutation.isPending}
        apiErrors={apiErrors}
      />
    </div>
  );
}