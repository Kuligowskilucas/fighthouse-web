'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Plano, Aluno } from '@/types/aluno'  
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  plano: Plano
  alunos: Aluno[]
  isLivre?: boolean
  inadimplenteIds?: Set<number> 
}

export default function TurmaCard({ plano, alunos, isLivre, inadimplenteIds }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className={cn('transition-shadow', expanded && 'shadow-md ring-1 ring-primary/20')}>
      <CardHeader
        className="cursor-pointer select-none pb-3 pt-4 px-4"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base leading-tight">{plano.nome}</h3>
              <span className="text-sm text-muted-foreground">
                {alunos.length} {alunos.length === 1 ? 'aluno' : 'alunos'}
              </span>
            </div>
            {plano.dias_semana && (
              <p className="text-sm text-muted-foreground mt-0.5">{plano.dias_semana}</p>
            )}
            {isLivre && (
              <p className="text-xs text-muted-foreground mt-0.5">multi-modalidade · horário livre</p>
            )}
          </div>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
        </div>

        {plano.horarios.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {plano.horarios.map(h => (
              <Badge key={h} variant="secondary" className="text-xs font-mono px-2 py-0.5">
                {h}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="px-4 pb-4 pt-0">
          <div className="border-t pt-3">
            {alunos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3">
                Nenhum aluno nessa turma
              </p>
            ) : (
              <div className="space-y-0.5">
                {alunos
                  .slice()
                  .sort((a, b) => a.nome.localeCompare(b.nome))
                  .map(aluno => (
                    <Link
                      key={aluno.id}
                      href={`/alunos/${aluno.id}`}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate flex-1">{aluno.nome}</span>
                      {inadimplenteIds?.has(aluno.id) && (
                        <span className="shrink-0 text-xs font-medium text-destructive">
                          em atraso
                        </span>
                      )}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}