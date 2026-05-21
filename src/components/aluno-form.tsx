'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { usePlanos } from '@/hooks/use-planos';
import { formatCurrency } from '@/lib/format';
import { alunoSchema, type AlunoFormValues } from '@/schemas/aluno';

const formDefaults: AlunoFormValues = {
  nome: '',
  telefone: '',
  email: '',
  plano_id: 0,
  valor_personalizado: '',
  dia_vencimento: 5,
  data_matricula: new Date().toISOString().split('T')[0],
  horario_treino: '',
  observacoes: '',
};

interface AlunoFormProps {
  defaultValues?: Partial<AlunoFormValues>;
  onSubmit: (values: AlunoFormValues) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  apiErrors?: Record<string, string[]>;
}

export function AlunoForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Salvar',
  isSubmitting = false,
  apiErrors,
}: AlunoFormProps) {
  const planosQuery = usePlanos();
  const [showValorPersonalizado, setShowValorPersonalizado] = useState(
    Boolean(defaultValues?.valor_personalizado),
  );

  const form = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoSchema),
    defaultValues: { ...formDefaults, ...defaultValues },
  });

  // Mapear erros 422 do backend pros campos do form
  useEffect(() => {
    if (!apiErrors) return;
    Object.entries(apiErrors).forEach(([field, messages]) => {
      form.setError(field as keyof AlunoFormValues, {
        type: 'server',
        message: messages[0],
      });
    });
  }, [apiErrors, form]);

  const planoSelecionadoId = form.watch('plano_id');
  const planoSelecionado = planosQuery.data?.find(
    (p) => p.id === planoSelecionadoId,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone *</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="(41) 99999-9999"
                  autoComplete="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  placeholder="opcional"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plano_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plano *</FormLabel>
              <Select
                value={field.value ? String(field.value) : ''}
                onValueChange={(val) => field.onChange(Number(val))}
                disabled={planosQuery.isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {planosQuery.data?.map((plano) => (
                    <SelectItem key={plano.id} value={String(plano.id)}>
                      {plano.nome} — {formatCurrency(plano.valor)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {planoSelecionado && (
                <FormDescription>
                  Valor padrão: {formatCurrency(planoSelecionado.valor)}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dia_vencimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dia de vencimento *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  inputMode="numeric"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>Dia do mês em que a mensalidade vence (1-31)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_matricula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de matrícula *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="horario_treino"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de treino</FormLabel>
              <FormControl>
                <Input
                  placeholder="ex: Seg/Qua/Sex 19h"
                  autoCapitalize="none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Quando o aluno costuma treinar (opcional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowValorPersonalizado((v) => !v)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            {showValorPersonalizado ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Valor personalizado (opcional)
          </button>

          {showValorPersonalizado && (
            <FormField
              control={form.control}
              name="valor_personalizado"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={9999.99}
                      inputMode="decimal"
                      placeholder="Ex: 150.00"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Sobrescreve o valor do plano. Deixe vazio pra usar o valor padrão.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Opcional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}