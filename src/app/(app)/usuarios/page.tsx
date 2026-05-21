'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Pencil, Plus, Shield, Trash2, User, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { RoleGuard } from '@/components/role-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/error-state';
import { useAlunos } from '@/hooks/use-alunos';
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '@/hooks/use-usuarios';
import { usuarioSchema, editarUsuarioSchema, type UsuarioFormValues, type EditarUsuarioFormValues } from '@/schemas/usuario';
import type { LaravelValidationError } from '@/types/auth';
import type { UsuarioItem } from '@/types/usuario';

const roleConfig = {
  admin:     { label: 'Admin',     icon: Shield, className: 'bg-red-100 text-red-700' },
  professor: { label: 'Professor', icon: User,   className: 'bg-blue-100 text-blue-700' },
  aluno:     { label: 'Aluno',     icon: Users,  className: 'bg-green-100 text-green-700' },
};

export default function UsuariosPage() {
  const [criarOpen, setCriarOpen]       = useState(false);
  const [editando, setEditando]         = useState<UsuarioItem | null>(null);
  const [deletando, setDeletando]       = useState<UsuarioItem | null>(null);

  const usuariosQuery = useUsuarios();
  const alunosQuery   = useAlunos({ per_page: 200, ativo: true });
  const deleteMutation = useDeleteUsuario();

  if (usuariosQuery.isLoading) return <UsuariosSkeleton />;

  if (usuariosQuery.isError) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <ErrorState
          message="Não foi possível carregar os usuários."
          onRetry={() => usuariosQuery.refetch()}
        />
      </RoleGuard>
    );
  }

  const usuarios = usuariosQuery.data ?? [];
  const alunosJaVinculados = new Set(
    usuarios.filter((u) => u.id !== editando?.id).map((u) => u.aluno_id).filter(Boolean),
  );
  const alunosDisponiveis = (alunosQuery.data?.data ?? []).filter(
    (a) => !alunosJaVinculados.has(a.id),
  );

  function handleDelete() {
    if (!deletando) return;
    deleteMutation.mutate(deletando.id, {
      onSuccess: () => {
        toast.success('Usuário excluído');
        setDeletando(null);
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message ?? 'Erro ao excluir usuário');
        }
        setDeletando(null);
      },
    });
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Usuários</h1>
          <Sheet open={criarOpen} onOpenChange={setCriarOpen}>
            <SheetTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" />Novo</Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
              <SheetHeader className="px-6 pt-6">
                <SheetTitle>Novo usuário</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
                <CriarUsuarioForm
                  alunosDisponiveis={alunosDisponiveis}
                  onSuccess={() => setCriarOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-2">
          {usuarios.map((u) => {
            const config = roleConfig[u.role] ?? roleConfig.professor;
            const Icon = config.icon;
            return (
              <Card key={u.id}>
                <CardContent className="flex items-center gap-3 py-3 px-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-xs text-gray-500">{u.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
                    {config.label}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditando(u)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeletando(u)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sheet de edição */}
      <Sheet open={!!editando} onOpenChange={(open) => !open && setEditando(null)}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Editar usuário</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            {editando && (
              <EditarUsuarioForm
                usuario={editando}
                alunosDisponiveis={alunosDisponiveis}
                onSuccess={() => setEditando(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deletando} onOpenChange={(open) => !open && setDeletando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário <strong>{deletando?.name}</strong> será removido e não
              conseguirá mais fazer login. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RoleGuard>
  );
}

// ─── Formulário de criação ────────────────────────────────────────────────────

function CriarUsuarioForm({
  alunosDisponiveis,
  onSuccess,
}: {
  alunosDisponiveis: { id: number; nome: string }[];
  onSuccess: () => void;
}) {
  const createMutation = useCreateUsuario();
  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { name: '', email: '', password: '', role: 'professor', aluno_id: null },
  });
  const role = form.watch('role');

  function onSubmit(values: UsuarioFormValues) {
    createMutation.mutate(values, {
      onSuccess: () => { toast.success('Usuário criado!'); form.reset(); onSuccess(); },
      onError: (error) => handleApiError(error, form),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <UsuarioFields form={form} role={role} alunosDisponiveis={alunosDisponiveis} />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Mín. 8 caracteres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Criando...' : 'Criar usuário'}
        </Button>
      </form>
    </Form>
  );
}

// ─── Formulário de edição ─────────────────────────────────────────────────────

function EditarUsuarioForm({
  usuario,
  alunosDisponiveis,
  onSuccess,
}: {
  usuario: UsuarioItem;
  alunosDisponiveis: { id: number; nome: string }[];
  onSuccess: () => void;
}) {
  const updateMutation = useUpdateUsuario(usuario.id);
  const form = useForm<EditarUsuarioFormValues>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: {
      name:     usuario.name,
      email:    usuario.email,
      role:     usuario.role,
      aluno_id: usuario.aluno_id,
    },
  });
  const role = form.watch('role');

  function onSubmit(values: EditarUsuarioFormValues) {
    updateMutation.mutate(values, {
      onSuccess: () => { toast.success('Usuário atualizado!'); onSuccess(); },
      onError: (error) => handleApiError(error, form),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <UsuarioFields form={form} role={role} alunosDisponiveis={alunosDisponiveis} />
        <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </Form>
  );
}

// ─── Campos compartilhados entre criar e editar ───────────────────────────────

function UsuarioFields({
  form,
  role,
  alunosDisponiveis,
}: {
  form: ReturnType<typeof useForm<any>>;
  role: string;
  alunosDisponiveis: { id: number; nome: string }[];
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
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
              <Input type="email" inputMode="email" autoCapitalize="none"
                placeholder="email@exemplo.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de usuário</FormLabel>
            <Select
              onValueChange={(v) => { field.onChange(v); if (v !== 'aluno') form.setValue('aluno_id', null); }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="aluno">Aluno</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {role === 'aluno' && (
        <FormField
          control={form.control}
          name="aluno_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aluno vinculado</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(Number(v))}
                value={field.value?.toString() ?? ''}
              >
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecione o aluno" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {alunosDisponiveis.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.nome}</SelectItem>
                  ))}
                  {alunosDisponiveis.length === 0 && (
                    <SelectItem value="none" disabled>Nenhum aluno disponível</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleApiError(error: unknown, form: ReturnType<typeof useForm<any>>) {
  if (error instanceof AxiosError && error.response?.status === 422) {
    const data = error.response.data as LaravelValidationError;
    Object.entries(data.errors ?? {}).forEach(([field, messages]) => {
      form.setError(field, { message: messages[0] });
    });
    toast.error('Verifica os campos do formulário');
    return;
  }
  toast.error('Erro ao salvar usuário');
}

function UsuariosSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
    </div>
  );
}