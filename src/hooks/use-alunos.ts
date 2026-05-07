'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Aluno, AlunoDetalhe, CreateAlunoPayload, UpdateAlunoPayload } from '@/types/aluno';
import type { PaginatedResponse } from '@/types/pagination';

export interface AlunosListParams {
  search?: string;
  ativo?: boolean;
  plano_id?: number;
  page?: number;
  per_page?: number;
}

export function useAlunos(params: AlunosListParams = {}) {
  return useQuery({
    queryKey: ['alunos', 'list', params],
    queryFn: async (): Promise<PaginatedResponse<Aluno>> => {
      const { data } = await api.get<PaginatedResponse<Aluno>>('/alunos', {
        params,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAluno(id: number) {
  return useQuery({
    queryKey: ['alunos', 'detail', id],
    queryFn: async (): Promise<AlunoDetalhe> => {
      const { data } = await api.get<{ data: AlunoDetalhe }>(`/alunos/${id}`);
      return data.data;
    },
    enabled: id > 0,
  });
}

export function useCreateAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAlunoPayload): Promise<Aluno> => {
      const { data } = await api.post<{ data: Aluno }>('/alunos', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAluno(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAlunoPayload): Promise<Aluno> => {
      const { data } = await api.patch<{ data: Aluno }>(`/alunos/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/alunos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}