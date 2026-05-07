export interface Plano {
  id: number;
  nome: string;
  valor: number;
  frequencia_semanal: number | null;
  ativo: boolean;
}

export interface Aluno {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  plano_id: number;
  plano: Plano;
  valor_personalizado: number | null;
  valor_efetivo: number;
  dia_vencimento: number;
  data_matricula: string;
  dias_matriculado: number;
  ativo: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mensalidade {
  id: number;
  aluno_id: number;
  mes_referencia: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  forma_pagamento: 'pix' | 'dinheiro' | 'cartao' | null;
  status: 'aberta' | 'paga' | 'atrasada';
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlunoDetalhe extends Aluno {
  mensalidades: Mensalidade[];
  resumo_financeiro: {
    total_mensalidades: number;
    pagas: number;
    atrasadas: number;
    abertas: number;
    valor_total_pago: number;
  };
  mensalidade_atual: Mensalidade | null;
}

export interface CreateAlunoPayload {
  nome: string;
  telefone: string;
  email: string | null;
  plano_id: number;
  valor_personalizado: number | null;
  dia_vencimento: number;
  data_matricula: string;
  observacoes: string | null;
}

export type UpdateAlunoPayload = Partial<CreateAlunoPayload> & {
  ativo?: boolean;
};