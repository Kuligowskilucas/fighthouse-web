'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePlanos } from '@/hooks/use-planos'              
import type { Aluno } from '@/types/aluno'                  
import { api } from '@/lib/api'                             
import TurmaCard from '@/components/turma-card'             
import GerenciarPlanosSheet from '@/components/gerenciar-planos-sheet'  
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Settings } from 'lucide-react'

export default function TurmasPage() {
  const [gerenciarOpen, setGerenciarOpen] = useState(false)

  const { data: planos, isLoading: loadingPlanos } = usePlanos()

  // Busca todos os alunos ativos de uma vez; agrupa no frontend
  // per_page=999 é ok para uma academia pequena
  const { data: alunos = [], isLoading: loadingAlunos } = useQuery({
    queryKey: ['alunos', 'todos-ativos'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Aluno[] }>('/alunos', {
        params: { ativo: 1, per_page: 999 },
      })
      return data.data
    },
  })

  // Agrupa alunos por plano_id
  const alunosPorPlano = alunos.reduce<Record<number, Aluno[]>>((acc, aluno) => {
    if (!acc[aluno.plano_id]) acc[aluno.plano_id] = []
    acc[aluno.plano_id].push(aluno)
    return acc
  }, {})

  const turmasComHorario = planos?.filter(p => p.dias_semana !== null) ?? []
  const planoLivre = planos?.find(p => p.dias_semana === null) ?? null
  const isLoading = loadingPlanos || loadingAlunos

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Turmas</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGerenciarOpen(true)}
        >
          <Settings className="h-4 w-4 mr-1.5" />
          Gerenciar
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {turmasComHorario.map(plano => (
            <TurmaCard
              key={plano.id}
              plano={plano}
              alunos={alunosPorPlano[plano.id] ?? []}
            />
          ))}

          {planoLivre && (
            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Livre · multi-modalidade
              </p>
              <TurmaCard
                plano={planoLivre}
                alunos={alunosPorPlano[planoLivre.id] ?? []}
                isLivre
              />
            </div>
          )}
        </div>
      )}

      <GerenciarPlanosSheet
        open={gerenciarOpen}
        onOpenChange={setGerenciarOpen}
      />
    </div>
  )
}