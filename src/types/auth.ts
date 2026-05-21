export type UserRole = 'admin' | 'professor' | 'aluno';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  aluno_id: number | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LaravelValidationError {
  message: string;
  errors: Record<string, string[]>;
}