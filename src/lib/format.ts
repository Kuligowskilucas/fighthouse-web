export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formata telefone brasileiro pra exibição.
 * Backend manda só dígitos (5541999999999), aqui formatamos pra leitura.
 */
export function formatTelefone(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '');

  // 13 dígitos: +55 (41) 99999-9999 (DDI + DDD + celular)
  if (digitos.length === 13) {
    return `+${digitos.slice(0, 2)} (${digitos.slice(2, 4)}) ${digitos.slice(4, 9)}-${digitos.slice(9)}`;
  }
  // 12 dígitos: +55 (41) 9999-9999 (DDI + DDD + fixo)
  if (digitos.length === 12) {
    return `+${digitos.slice(0, 2)} (${digitos.slice(2, 4)}) ${digitos.slice(4, 8)}-${digitos.slice(8)}`;
  }
  // 11 dígitos: (41) 99999-9999 (DDD + celular, sem DDI)
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  // 10 dígitos: (41) 9999-9999 (DDD + fixo, sem DDI)
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  // Formato desconhecido: retorna como veio
  return telefone;
}

/**
 * 'YYYY-MM-DD' → 'DD/MM/YYYY'
 * Sem usar Date pra evitar problema de timezone.
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * 'YYYY-MM-DD' → 'mai/2026'
 * Pra exibir mês de referência de mensalidade.
 */
export function formatMesReferencia(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  const meses = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
  ];
  return `${meses[Number(month) - 1]}/${year}`;
}

/**
 * Gera lista de meses pra select: últimos 12 + atual.
 * Retorna [{value: 'YYYY-MM-DD', label: 'mai/2026'}, ...] do mais recente pro mais antigo.
 */
export function gerarOpcoesMeses(): Array<{ value: string; label: string }> {
  const meses: Array<{ value: string; label: string }> = [];
  const hoje = new Date();

  for (let i = -2; i <= 11; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const value = `${ano}-${mes}-01`;
    meses.push({ value, label: formatMesReferencia(value) });
  }

  return meses;
}