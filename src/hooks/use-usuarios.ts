'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { UsuarioItem } from '@/types/usuario';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async (): Promise<UsuarioItem[]> => {
      const { data } = await api.get<{ data: UsuarioItem[] }>('/users');
      return data.data;
    },
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      role: string;
      aluno_id?: number | null;
    }): Promise<UsuarioItem> => {
      const { data } = await api.post<{ data: UsuarioItem }>('/users', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useUpdateUsuario(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<{
      name: string;
      email: string;
      role: string;
      aluno_id: number | null;
    }>): Promise<UsuarioItem> => {
      const { data } = await api.patch<{ data: UsuarioItem }>(`/users/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}