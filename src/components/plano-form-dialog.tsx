'use client'

import { useEffect, useState } from 'react'
import type { Plano } from '@/types/aluno'                               
import { useCreatePlano, useUpdatePlano } from '@/hooks/use-plano-mutations'  
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  plano: Plano | null
}

export default function PlanoFormDialog({ open, onOpenChange, plano }: Props) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [diasSemana, setDiasSemana] = useState('')
  const [horarios, setHorarios] = useState<string[]>([])
  const [novoHorario, setNovoHorario] = useState('')

  const createPlano = useCreatePlano()
  const updatePlano = useUpdatePlano()
  const isEditing = plano !== null
  const isLoading = createPlano.isPending || updatePlano.isPending

  useEffect(() => {
    if (open) {
      setNome(plano?.nome ?? '')
      setPreco(plano ? String(plano.valor) : '')
      setDiasSemana(plano?.dias_semana ?? '')
      setHorarios(plano ? [...plano.horarios] : [])
      setNovoHorario('')
    }
  }, [open, plano])

  function addHorario() {
    const h = novoHorario.trim()
    if (!h) return
    if (!/^\d{2}:\d{2}$/.test(h)) {
      toast.error('Use o formato HH:MM (ex: 18:00)')
      return
    }
    if (horarios.includes(h)) return
    setHorarios(prev => [...prev, h].sort())
    setNovoHorario('')
  }

  async function handleSubmit() {
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    const payload = {
      nome: nome.trim(),
      valor: parseFloat(preco.replace(',', '.')) || 0,  // era: preco:
      ativo: true,
      dias_semana: diasSemana.trim() || null,
      horarios,
    }

    try {
      if (isEditing && plano) {
        await updatePlano.mutateAsync({ id: plano.id, ...payload })
        toast.success('Turma atualizada')
      } else {
        await createPlano.mutateAsync(payload)
        toast.success('Turma criada')
      }
      onOpenChange(false)
    } catch (err: any) {
      const errors = err?.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]
        toast.error(Array.isArray(first) ? first[0] as string : String(first))
      } else {
        toast.error(err?.response?.data?.message ?? 'Erro ao salvar')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Turma' : 'Nova Turma'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Muay Thai"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="preco">Mensalidade (R$)</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={preco}
              onChange={e => setPreco(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dias">Dias da semana</Label>
            <Input
              id="dias"
              value={diasSemana}
              onChange={e => setDiasSemana(e.target.value)}
              placeholder="Ex: Seg/Qua/Sex — vazio = Livre"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Horários</Label>
            <div className="flex gap-2">
              <Input
                value={novoHorario}
                onChange={e => setNovoHorario(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHorario())}
                placeholder="HH:MM"
                className="font-mono"
              />
              <Button type="button" variant="outline" size="icon" onClick={addHorario}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {horarios.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {horarios.map(h => (
                  <Badge key={h} variant="secondary" className="gap-1 font-mono pr-1">
                    {h}
                    <button
                      type="button"
                      onClick={() => setHorarios(prev => prev.filter(x => x !== h))}
                      className="hover:text-destructive ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}