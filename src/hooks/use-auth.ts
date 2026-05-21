'use client';

import { useCallback, useEffect, useState } from 'react';
import { authStorage } from '@/lib/auth';
import type { User } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(authStorage.getUser());
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, userData: User) => {
    authStorage.setSession(token, userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    isAdmin:     user?.role === 'admin',
    isProfessor: user?.role === 'professor',
    isAluno:     user?.role === 'aluno',
    login,
    logout,
  };
}