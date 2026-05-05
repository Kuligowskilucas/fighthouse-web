// import type { Aluno } from '@/types/aluno';

export interface DashboardResumo {
  mes_referencia: string;
  alunos_ativos: number;
  mensalidades_do_mes: {
    total: number;
    pagas: number;
    em_aberto: number;
  };
  financeiro: {
    recebido_no_mes: number;
    a_receber_no_mes: number;
    total_atrasado_geral: number;
  };
  inadimplencia: {
    quantidade_atrasadas: number;
    alunos_inadimplentes: number;
  };
}

export interface InadimplenteItem {
  aluno: {
    id: number;
    nome: string;
    telefone: string;
    email: string | null;
    plano: string;
  };
  quantidade_atrasadas: number;
  valor_total_devido: number;
  dias_atraso: number;
  mensalidade_mais_antiga: unknown;
}

export interface InadimplentesResponse {
  data: InadimplenteItem[];
  total_alunos_inadimplentes: number;
  valor_total_devido: number;
}