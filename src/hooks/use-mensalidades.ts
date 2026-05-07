'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type {
  MarcarPagamentoPayload,
  Mensalidade,
} from '@/types/mensalidade';

export function useMarcarPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mensalidadeId,
      payload,
    }: {
      mensalidadeId: number;
      payload: MarcarPagamentoPayload;
    }): Promise<Mensalidade> => {
      const { data } = await api.post<{ data: Mensalidade }>(
        `/mensalidades/${mensalidadeId}/marcar-pagamento`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      // Invalida tudo que pode mostrar mensalidade
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['mensalidades'] });
    },
  });
}

export function useDesfazerPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mensalidadeId: number): Promise<Mensalidade> => {
      const { data } = await api.post<{ data: Mensalidade }>(
        `/mensalidades/${mensalidadeId}/desfazer-pagamento`,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['mensalidades'] });
    },
  });
}