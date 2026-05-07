'use client';

import { use } from 'react';

interface AlunoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AlunoDetailPage({ params }: AlunoDetailPageProps) {
  const { id } = use(params);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Aluno #{id}</h1>
      <p className="text-sm text-gray-500">
        Página de detalhe — em construção. Volta no 5.5.
      </p>
    </div>
  );
}