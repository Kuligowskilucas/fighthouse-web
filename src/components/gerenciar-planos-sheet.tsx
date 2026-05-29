'use client'

import { useState } from 'react'
import { usePlanos } from '@/hooks/use-planos'                    
import { useDeletePlano } from '@/hooks/use-plano-mutations'      
import type { Plano } from '@/types/aluno'                        
import PlanoFormDialog from './plano-form-dialog'                 
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function GerenciarPlanosSheet({ open, onOpenChange }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null)
  const { data: planos } = usePlanos()
  const deletePlano = useDeletePlano()

  function handleEdit(plano: Plano) {
    setEditingPlano(plano)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditingPlano(null)
    setFormOpen(true)
  }

  async function handleDelete(plano: Plano) {
    if (!confirm(`Excluir a turma "${plano.nome}"?`)) return
    try {
      await deletePlano.mutateAsync(plano.id)
      toast.success('Turma excluída')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao excluir')
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Gerenciar Turmas</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-2">
            {planos?.map(plano => (
              <div
                key={plano.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{plano.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {plano.valor > 0
                      ? `R$ ${plano.valor.toFixed(2).replace('.', ',')}`
                      : 'Sem preço definido'}
                    {plano.dias_semana ? ` · ${plano.dias_semana}` : ''}
                    {typeof plano.alunos_count === 'number'
                      ? ` · ${plano.alunos_count} aluno${plano.alunos_count !== 1 ? 's' : ''}`
                      : ''}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleEdit(plano)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
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

          <Button className="w-full mt-4" variant="outline" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Turma
          </Button>
        </SheetContent>
      </Sheet>

      <PlanoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        plano={editingPlano}
      />
    </>
  )
}