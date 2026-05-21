'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AlunoDetalhe } from '@/types/aluno';

export function useMeuPerfil(enabled = true) {
  return useQuery({
    queryKey: ['me', 'aluno'],
    queryFn: async (): Promise<AlunoDetalhe> => {
      const { data } = await api.get<{ data: AlunoDetalhe }>('/me/aluno');
      return data.data;
    },
    enabled, 
  });
}