'use client';

import { useCallback, useEffect, useState } from 'react';
import { authStorage } from '@/lib/auth';
import type { User } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega user do localStorage no mount.
  // Precisa ser useEffect pra evitar hydration mismatch:
  // no servidor o user é sempre null, no cliente pode ser diferente.
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
    login,
    logout,
  };
}