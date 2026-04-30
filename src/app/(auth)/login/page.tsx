'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import type { LaravelValidationError, LoginResponse } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues): Promise<LoginResponse> => {
      const { data } = await api.post<LoginResponse>('/login', values);
      return data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      router.push('/dashboard');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        // Rate limit
        if (error.response?.status === 429) {
          toast.error('Muitas tentativas. Tente novamente em 1 minuto.');
          return;
        }

        // Validação / credenciais inválidas
        if (error.response?.status === 422) {
          const data = error.response.data as LaravelValidationError;
          const firstError =
            data.errors?.email?.[0] ?? data.message ?? 'Credenciais inválidas';
          toast.error(firstError);
          return;
        }
      }

      toast.error('Erro ao fazer login. Tente novamente.');
    },
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Fight House</CardTitle>
        <CardDescription>Entre com suas credenciais</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      inputMode="email"
                      placeholder="seu@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}