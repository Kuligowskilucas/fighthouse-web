'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';          // era: import api from

interface PlanoPayload {
  nome: string;
  valor: number;                          // era: preco
  ativo: boolean;
  dias_semana: string | null;
  horarios: string[];
}

export function useCreatePlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlanoPayload) => api.post('/planos', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planos'] }),
  });
}

export function useUpdatePlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: PlanoPayload & { id: number }) =>
      api.put(`/planos/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['planos'] }),
  });
}

export function useDeletePlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/planos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['planos'] });
      qc.invalidateQueries({ queryKey: ['alunos'] });
    },
  });
}