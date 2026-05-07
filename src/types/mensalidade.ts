export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao' | 'transferencia';

export type StatusMensalidade = 'aberta' | 'paga' | 'atrasada';

export interface Mensalidade {
  id: number;
  aluno_id: number;
  mes_referencia: string; // 'YYYY-MM-DD' (sempre dia 1)
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  forma_pagamento: FormaPagamento | null;
  status: StatusMensalidade;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarcarPagamentoPayload {
  data_pagamento: string; // 'YYYY-MM-DD'
  forma_pagamento: FormaPagamento;
  observacoes: string | null;
}