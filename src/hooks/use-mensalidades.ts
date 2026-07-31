'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type {
  MarcarPagamentoPayload,
  Mensalidade,
} from '@/types/mensalidade';

import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query';

import type {
  MensalidadeComAluno,
  StatusMensalidade,
} from '@/types/mensalidade';
import type { PaginatedResponse } from '@/types/pagination';

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

export interface MensalidadesListParams {
  status?: StatusMensalidade;
  mes_referencia?: string;
  aluno_id?: number;
  ativo?: boolean;
  page?: number;
  per_page?: number;
}

export function useMensalidadesList(params: MensalidadesListParams = {}) {
  return useQuery({
    queryKey: ['mensalidades', 'list', params],
    queryFn: async (): Promise<PaginatedResponse<MensalidadeComAluno>> => {
      const { data } = await api.get<PaginatedResponse<MensalidadeComAluno>>(
        '/mensalidades',
        { params },
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export interface GerarMensalidadesPayload {
  mes_referencia?: string;
}

export interface GerarMensalidadesResponse {
  criadas: number;
  ignoradas: number;
  mes_referencia: string;
}

export function useGerarMensalidades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: GerarMensalidadesPayload = {},
    ): Promise<GerarMensalidadesResponse> => {
      const { data } = await api.post<GerarMensalidadesResponse>(
        '/mensalidades/gerar',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensalidades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
  });
}