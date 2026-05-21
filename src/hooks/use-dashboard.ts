'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

import type {
  DashboardResumo,
  InadimplentesResponse,
  RecebidosHojeResponse,
} from '@/types/dashboard';

export function useDashboardResumo() {
  return useQuery({
    queryKey: ['dashboard', 'resumo'],
    queryFn: async (): Promise<DashboardResumo> => {
      const { data } = await api.get<DashboardResumo>('/dashboard/resumo');
      return data;
    },
  });
}

export function useInadimplentes() {
  return useQuery({
    queryKey: ['dashboard', 'inadimplentes'],
    queryFn: async (): Promise<InadimplentesResponse> => {
      const { data } = await api.get<InadimplentesResponse>(
        '/dashboard/inadimplentes',
      );
      return data;
    },
  });
}

export function useRecebidosHoje() {
  return useQuery({
    queryKey: ['dashboard', 'recebidos-hoje'],
    queryFn: async (): Promise<RecebidosHojeResponse> => {
      const { data } = await api.get<RecebidosHojeResponse>(
        '/dashboard/recebidos-hoje',
      );
      return data;
    },
  });
}