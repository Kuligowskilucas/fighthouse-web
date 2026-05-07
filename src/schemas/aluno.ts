import { z } from 'zod';

// Reflete as regras do StoreAlunoRequest do backend.
// Onde o backend tem `nullable`, aqui aceita string vazia que vira null no submit.
export const alunoSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome muito longo'),
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine((val) => {
      const digitos = val.replace(/\D/g, '');
      return digitos.length >= 10 && digitos.length <= 13;
    }, 'Telefone deve ter entre 10 e 13 dígitos'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(255)
    .or(z.literal('')),
  plano_id: z
    .number({ message: 'Selecione um plano' })
    .int()
    .positive(),
  valor_personalizado: z
    .string()
    .refine((val) => val === '' || !isNaN(Number(val)), 'Valor inválido')
    .refine(
      (val) => val === '' || (Number(val) >= 0 && Number(val) <= 9999.99),
      'Valor deve estar entre 0 e 9999.99',
    ),
  dia_vencimento: z
    .number({ message: 'Dia de vencimento é obrigatório' })
    .int()
    .min(1, 'Mínimo 1')
    .max(31, 'Máximo 31'),
  data_matricula: z
    .string()
    .min(1, 'Data de matrícula é obrigatória')
    .refine((val) => {
      const data = new Date(val);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      return data <= hoje;
    }, 'Data não pode ser no futuro'),
  observacoes: z.string().max(1000, 'Observações muito longas'),
});

export type AlunoFormValues = z.infer<typeof alunoSchema>;