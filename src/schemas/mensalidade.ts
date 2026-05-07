import { z } from 'zod';

export const formasPagamento = ['pix', 'dinheiro', 'cartao', 'transferencia'] as const;

export const marcarPagamentoSchema = z.object({
  data_pagamento: z
    .string()
    .min(1, 'Data é obrigatória')
    .refine((val) => {
      const data = new Date(val);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      return data <= hoje;
    }, 'Data não pode ser no futuro'),
  forma_pagamento: z.enum(formasPagamento, {
    message: 'Selecione a forma de pagamento',
  }),
  observacoes: z.string().max(1000, 'Observações muito longas'),
});

export type MarcarPagamentoFormValues = z.infer<typeof marcarPagamentoSchema>;