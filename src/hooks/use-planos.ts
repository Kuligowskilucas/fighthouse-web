'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { Plano } from '@/types/aluno';

interface PlanosResponse {
  data: Plano[];
}

export function usePlanos() {
  return useQuery({
    queryKey: ['planos'],
    queryFn: async (): Promise<Plano[]> => {
      const { data } = await api.get<PlanosResponse>('/planos');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}