'use client';

import { AxiosError } from 'axios';
import { Check, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { MarcarPagamentoDialog } from '@/components/marcar-pagamento-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDesfazerPagamento } from '@/hooks/use-mensalidades';
import { formatCurrency, formatDate, formatMesReferencia } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Mensalidade, MensalidadeComAluno } from '@/types/mensalidade';


interface MensalidadeRowProps {
  mensalidade: Mensalidade | MensalidadeComAluno;
  showAluno?: boolean;
  readOnly?: boolean;
}

const statusConfig = {
  paga: {
    label: 'Paga',
    badgeClass: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  atrasada: {
    label: 'Atrasada',
    badgeClass: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  aberta: {
    label: 'Aberta',
    badgeClass: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
} as const;

export function MensalidadeRow({ mensalidade, showAluno = false, readOnly = false }: MensalidadeRowProps) {
  const aluno = 'aluno' in mensalidade ? mensalidade.aluno : null;
  const [marcarOpen, setMarcarOpen] = useState(false);
  const [desfazerOpen, setDesfazerOpen] = useState(false);
  const desfazerMutation = useDesfazerPagamento();

  const config = statusConfig[mensalidade.status];
  const isPaga = mensalidade.status === 'paga';

  function handleDesfazer() {
    desfazerMutation.mutate(mensalidade.id, {
      onSuccess: () => {
        toast.success('Pagamento desfeito');
        setDesfazerOpen(false);
      },
      onError: (error) => {
        if (error instanceof AxiosError && error.response?.status === 409) {
          toast.error(
            error.response.data?.message ?? 'Mensalidade não está paga.',
          );
          setDesfazerOpen(false);
          return;
        }
        toast.error('Erro ao desfazer pagamento');
        setDesfazerOpen(false);
      },
    });
  }

  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-gray-900">
                {showAluno && aluno
                  ? `${aluno.nome} · ${formatMesReferencia(mensalidade.mes_referencia)}`
                  : formatMesReferencia(mensalidade.mes_referencia)}
              </p>
              <Badge className={cn('shrink-0', config.badgeClass)}>
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Vence em {formatDate(mensalidade.data_vencimento)}
              {mensalidade.data_pagamento && (
                <> · Paga em {formatDate(mensalidade.data_pagamento)}</>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(mensalidade.valor)}
            </p>

            {!readOnly && (
              <>
                {isPaga ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-500 hover:text-gray-900"
                    onClick={() => setDesfazerOpen(true)}
                    aria-label="Desfazer pagamento"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMarcarOpen(true)}
                  >
                    <Check className="h-4 w-4" />
                    Pagar
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <MarcarPagamentoDialog
        mensalidade={mensalidade}
        open={marcarOpen}
        onOpenChange={setMarcarOpen}
      />

      <AlertDialog open={desfazerOpen} onOpenChange={setDesfazerOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desfazer pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              A mensalidade de {formatMesReferencia(mensalidade.mes_referencia)}{' '}
              vai voltar a ser considerada em aberto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={desfazerMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDesfazer}
              disabled={desfazerMutation.isPending}
            >
              Desfazer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}