'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { type ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMarcarPagamento } from '@/hooks/use-mensalidades';
import { formatCurrency, formatMesReferencia } from '@/lib/format';
import {
  formasPagamento,
  marcarPagamentoSchema,
  type MarcarPagamentoFormValues,
} from '@/schemas/mensalidade';
import type { Mensalidade } from '@/types/mensalidade';

const formaPagamentoLabel: Record<(typeof formasPagamento)[number], string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  transferencia: 'Transferência',
};

interface MarcarPagamentoDialogProps {
  mensalidade: Mensalidade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
}

export function MarcarPagamentoDialog({
  mensalidade,
  open,
  onOpenChange,
  trigger,
}: MarcarPagamentoDialogProps) {
  const marcarMutation = useMarcarPagamento();

  const form = useForm<MarcarPagamentoFormValues>({
    resolver: zodResolver(marcarPagamentoSchema),
    defaultValues: {
      data_pagamento: new Date().toISOString().split('T')[0],
      forma_pagamento: 'pix',
      observacoes: '',
    },
  });

  // Reseta o form toda vez que o modal abre
  useEffect(() => {
    if (open) {
      form.reset({
        data_pagamento: new Date().toISOString().split('T')[0],
        forma_pagamento: 'pix',
        observacoes: '',
      });
    }
  }, [open, form]);

  function handleSubmit(values: MarcarPagamentoFormValues) {
    marcarMutation.mutate(
      {
        mensalidadeId: mensalidade.id,
        payload: {
          data_pagamento: values.data_pagamento,
          forma_pagamento: values.forma_pagamento,
          observacoes: values.observacoes.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Pagamento registrado');
          onOpenChange(false);
        },
        onError: (error) => {
          if (error instanceof AxiosError && error.response?.status === 409) {
            toast.error(
              error.response.data?.message ?? 'Mensalidade já está paga.',
            );
            onOpenChange(false);
            return;
          }
          if (error instanceof AxiosError && error.response?.status === 422) {
            toast.error('Verifica os campos do formulário');
            return;
          }
          toast.error('Erro ao registrar pagamento');
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como paga</DialogTitle>
          <DialogDescription>
            {formatMesReferencia(mensalidade.mes_referencia)} ·{' '}
            {formatCurrency(mensalidade.valor)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="data_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do pagamento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formasPagamento.map((forma) => (
                        <SelectItem key={forma} value={forma}>
                          {formaPagamentoLabel[forma]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={marcarMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={marcarMutation.isPending}>
                {marcarMutation.isPending ? 'Salvando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}