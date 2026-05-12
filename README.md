# Fight House Web

> Frontend de um sistema de gestão de mensalidades para academia de jiu-jitsu.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)

Aplicação Next.js 16 com TypeScript e Tailwind v4, desenvolvida como projeto sem fins lucrativos para a Fight House Club. Interface mobile-first para cadastro de alunos, registro de pagamentos e visão financeira mensal.

A API que este frontend consome está em [fighthouse-api](https://github.com/Kuligowskilucas/fighthouse-api).

---

## Sobre o projeto

A Fight House Club é uma academia de jiu-jitsu cujo dono, Marquete, hoje gerencia as mensalidades dos ~30 alunos em um caderno físico. Este projeto é uma alternativa digital gratuita, construída com prioridade absoluta em uso mobile — Marquete vai usar muito mais o celular do que o desktop.

---

## Stack

- **Next.js 16** com App Router e Turbopack
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (preset Nova)
- **TanStack Query** para fetching e cache
- **React Hook Form** + **Zod** para formulários
- **Axios** com interceptor para autenticação Bearer
- **Sonner** para notificações toast
- **Lucide React** para ícones

---

## Funcionalidades

### Autenticação
- Login com persistência via localStorage
- Proteção de rotas via `<AuthGuard>` no layout autenticado
- Logout completo (invalida token no backend)

### Dashboard
- Resumo do mês: recebido, a receber, total atrasado, inadimplentes
- Lista de inadimplentes com valor devido e dias de atraso

### Alunos
- Lista com busca debounce, filtro de ativos/inativos e paginação
- Cadastro e edição com validação Zod refletindo regras do backend
- Detalhe com histórico financeiro e resumo
- Desativar/reativar/excluir com confirmação

### Mensalidades
- Lista geral com filtros por status (tabs) e mês (select)
- Marcar pagamento com modal (data, forma, observações)
- Desfazer pagamento com confirmação
- Geração manual de mensalidades do mês (idempotente)

---

## Decisões técnicas

### Mobile-first
Toda a UI foi desenhada a partir do mobile e expandida pra desktop com breakpoints. Botões com áreas de toque confortáveis, listas de cards empilhados em vez de tabelas, drawer lateral em vez de sidebar fixa.

### Autenticação via localStorage
Token Bearer salvo no localStorage. Trade-off conhecido (vulnerável a XSS) aceito porque o sistema é interno, com poucos usuários conhecidos, sem dados financeiros reais sendo manipulados e deploy em domínios separados (Vercel + Fly.io) — cookies cross-domain seriam mais complexos. Token expira em 7 dias com prune diário no backend.

### URL como source of truth para filtros
Filtros (busca, status, mês, paginação) ficam na URL via `useSearchParams`. F5 mantém o estado, links são compartilháveis, voltar do browser desfaz filtros naturalmente.

### Server Components por padrão
Apenas componentes que usam state, eventos ou hooks viram Client. Reduz bundle JS e mantém a renderização inicial rápida.

### Componente `<AlunoForm>` reusado entre criar e editar
Mesmo componente alimentado por `defaultValues` opcionais e callback `onSubmit`. Mapeamento de erros 422 do Laravel pros campos via `setError` do React Hook Form — usuário vê "Telefone já existe" embaixo do campo telefone, não em toast genérico.

### Invalidação de queries hierárquica
QueryKeys em array tipo `['alunos', 'list', params]`. Permite invalidar tudo de alunos com `invalidateQueries({ queryKey: ['alunos'] })` — afeta lista e detalhe simultaneamente. Marcar pagamento de uma mensalidade atualiza dashboard, listas e detalhes em cadeia.

---

## Como rodar local

### Pré-requisitos
- Node.js 20+
- Backend rodando ([fighthouse-api](https://github.com/Kuligowskilucas/fighthouse-api))

### Instalação

```bash
git clone https://github.com/Kuligowskilucas/fighthouse-web.git
cd fighthouse-web
npm install
```

### Variáveis de ambiente

Cria o arquivo `.env.local` na raiz:

```env
NEXT_PUBLIC_API_URL=http://localhost
```

### Rodar em dev

```bash
npm run dev
```

Acessa em http://localhost:3000.

---

## Estrutura

```
src/
app/
(auth)/login/         # Rota não autenticada
(app)/                # Rotas protegidas (AuthGuard no layout)
dashboard/
alunos/
mensalidades/
layout.tsx            # Root layout com Providers
not-found.tsx         # 404 customizado
error.tsx             # Error boundary global
components/
ui/                   # Componentes shadcn
*.tsx                 # Componentes do domínio
hooks/                  # Hooks customizados (TanStack Query)
lib/                    # Utilitários e cliente HTTP
schemas/                # Schemas Zod
types/                  # Interfaces TypeScript
```

---

## Roadmap

### v1 (em desenvolvimento)
- [x] CRUD de alunos
- [x] Gestão de mensalidades
- [x] Dashboard mensal
- [x] Geração manual de mensalidades
- [ ] Tela de trocar senha
- [ ] Deploy (Fly.io + Vercel + Neon Postgres)

### v2 (futuro)
- [ ] Notificações por email para inadimplentes
- [ ] Reset de senha por email