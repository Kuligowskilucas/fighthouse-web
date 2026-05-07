'use client';

import { useEffect, useState } from 'react';

/**
 * Atrasa atualização de um valor — útil pra inputs de busca,
 * evitando disparar request a cada tecla digitada.
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebouncedValue(search, 300);
 * // useDebouncedValue retorna o valor "atrasado", que só muda 300ms
 * // depois que o usuário parou de digitar.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}