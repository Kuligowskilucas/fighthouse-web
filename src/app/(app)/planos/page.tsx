'use client'

import { useState } from 'react'
import { usePlanos } from '@/hooks/use-planos'
import { useDeletePlano } from '@/hooks/use-plano-mutations'
import PlanoFormDialog from '@/components/plano-form-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import type { Plano } from '@/types/aluno'

export default function PlanosPage() {
  const [formOpen, setFormOpen]       = useState(false)
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null)
  const { data: planos, isLoading }   = usePlanos()
  const deletePlano                   = useDeletePlano()

  function handleEdit(plano: Plano) {
    setEditingPlano(plano)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditingPlano(null)
    setFormOpen(true)
  }

  async function handleDelete(plano: Plano) {
    if (!confirm(`Excluir "${plano.nome}"?`)) return
    try {
      await deletePlano.mutateAsync(plano.id)
      toast.success('Plano excluído')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao excluir')
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Planos</h1>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Novo
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {planos?.map(plano => (
            <div
              key={plano.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{plano.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(plano.valor)}
                  {plano.dias_semana && ` · ${plano.dias_semana}`}
                  {typeof plano.alunos_count === 'number' &&
                    ` · ${plano.alunos_count} ${plano.alunos_count === 1 ? 'aluno' : 'alunos'}`}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon" variant="ghost" className="h-8 w-8"
                  onClick={() => handleEdit(plano)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon" variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(plano)}
                  disabled={deletePlano.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PlanoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        plano={editingPlano}
      />
    </div>
  )
}