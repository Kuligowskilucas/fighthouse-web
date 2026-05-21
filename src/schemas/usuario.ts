import { z } from 'zod';

export const usuarioSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[a-zA-Z]/, 'Precisa ter pelo menos uma letra')
      .regex(/[0-9]/, 'Precisa ter pelo menos um número'),
    role: z.enum(['admin', 'professor', 'aluno']),
    aluno_id: z.number().nullable(),
  })
  .refine(
    (data) => data.role !== 'aluno' || data.aluno_id !== null,
    { message: 'Selecione um aluno para vincular', path: ['aluno_id'] },
  );

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;

export const editarUsuarioSchema = z.object({
  name:     z.string().min(1, 'Nome é obrigatório'),
  email:    z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  role:     z.enum(['admin', 'professor', 'aluno']),
  aluno_id: z.number().nullable(),
}).refine(
  (data) => data.role !== 'aluno' || data.aluno_id !== null,
  { message: 'Selecione um aluno para vincular', path: ['aluno_id'] },
);

export type EditarUsuarioFormValues = z.infer<typeof editarUsuarioSchema>;