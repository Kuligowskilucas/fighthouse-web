import type { UserRole } from '@/types/auth';

export interface UsuarioItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  aluno_id: number | null;
}