# Decisões do projeto (frontend)

Documento vivo com as decisões técnicas e de UX tomadas no desenvolvimento do frontend.

> Última atualização: maio de 2026 (pós deploy em produção).

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Data fetching:** TanStack Query
- **Deploy:** Vercel
- **Conexão com o backend:** API REST do Laravel via `NEXT_PUBLIC_API_URL`

---

## Filosofia: mobile-first como prioridade

A academia usa muito mais celular do que desktop — Marquete e equipe vão acessar quase sempre de mobile durante o dia, conferindo aluno, marcando pagamento, vendo inadimplentes. Por isso:

- **Todas as telas são desenhadas primeiro pra mobile**, então expandidas pra desktop com breakpoints do Tailwind.
- Toda feature passa por teste em viewport pequeno antes de ser considerada pronta.
- Componentes que ficariam apertados em mobile (tabelas grandes, formulários longos) são repensados como listas ou painéis abertos em sequência.
- Navegação principal via menu hambúrguer (componente `Sheet` do shadcn/ui), economizando espaço vertical.

Esse é o padrão default. Desktop é responsividade, não foco.

---

## Data fetching: TanStack Query com queryKeys hierárquicas

### Por que TanStack Query (e não fetch direto via useEffect)

- Cache automático entre componentes — duas telas que precisam da mesma data não fazem duas requisições.
- Refetch automático em eventos (foco da janela, reconexão de rede).
- Estado de loading/error padronizado, sem boilerplate por componente.
- Invalidação granular após mutações (`marcar pagamento` invalida só o que foi afetado).

### Padrão: hooks customizados por feature

Cada feature tem seu hook próprio, encapsulando `queryKey`, `queryFn` e configurações específicas. Componentes consomem o hook, não chamam `useQuery` diretamente.

### Padrão: queryKeys como arrays hierárquicos

Em vez de strings simples como `'dashboard'`, uso arrays do tipo `['dashboard', 'resumo']`, `['alunos', alunoId]`, `['mensalidades', 'aluno', alunoId]`.

Vantagem: invalidação por prefixo. Quando uma mutação altera dados de um aluno, posso invalidar `['alunos']` e todas as queries que começam com esse prefixo (`['alunos']`, `['alunos', '123']`, etc.) entram em refetch automaticamente, sem ter que listar cada uma manualmente.

---

## Renderização: Server Components por padrão

- O default no App Router é Server Component, e mantenho isso o máximo possível.
- `'use client'` apenas em componentes que **realmente** precisam de interatividade (formulários, modais, hooks de estado, event handlers).
- Componentes de leitura pura (cards de dashboard, listagens estáticas, header) ficam server.

Benefícios: menos JavaScript no bundle do cliente, primeiro paint mais rápido, dados sensíveis (tokens, fetches autenticados) podem ficar no servidor.

---

## Loading states: skeleton, não spinner

- Toda tela com fetch async mostra **skeleton** (versão neutra da estrutura final em cinza claro) durante o carregamento.
- Spinners genéricos só em ações pontuais (botão de submit) — não em telas inteiras.

Por quê: skeleton dá noção de "o que vai aparecer aqui em segundos" e reduz a percepção de espera. Spinner em tela cheia indica que "alguma coisa está carregando" mas o usuário não sabe o quê — fica mais ansioso.

---

## Autenticação: AuthGuard como wrapper

- Rotas autenticadas são envolvidas por um componente `AuthGuard` que valida o token Sanctum antes de renderizar.
- Sem token válido → redireciona pra `/login`.
- Token expirado/inválido → limpa estado, redireciona pra `/login`.
- Login bem-sucedido → guarda token e redireciona pra `/dashboard`.

---

## Padrões de UI

### Formulário reusado para criar e editar

`AlunoForm` (e equivalentes) é um componente único que serve pra criação E edição. Recebe valores iniciais opcionais e um handler de submit configurável. Evita duplicação de regras de validação e layout entre fluxos.

### Filtros e paginação: URL como source of truth

Filtros (busca, ativo/inativo, etc.) e paginação ficam refletidos como query params na URL via `useSearchParams`. Vantagens:

- Compartilhar uma view filtrada é só copiar o link.
- Navegação back/forward do browser funciona naturalmente.
- Refresh da página mantém o estado.
- Não precisa de state management externo pra isso.

### Componentes de feedback consistentes

- `ErrorState` — componente padrão pra erro carregando dados, com mensagem e botão de retry.
- `not-found.tsx` — página 404 customizada do App Router.
- `error.tsx` — error boundary do App Router pra erros não tratados.

---

## Build e deploy

### Por que Vercel

- Integração nativa com Next.js (criado pelos mesmos mantenedores do framework).
- Preview deploys automáticos por PR — útil pra revisar feature antes de mergear.
- Edge network global pra distribuir os assets estáticos.
- Free tier suficiente pro projeto.
- Build e deploy disparados automaticamente em cada push pra `main`.

### Configuração de ambiente

- `NEXT_PUBLIC_API_URL` — URL pública do backend. Variável precisa do prefixo `NEXT_PUBLIC_` pra ser exposta ao cliente; sem ele, ficaria só no servidor.
- Em produção: `https://fighthouseapi.duckdns.org`.

---

## Fora do escopo da v1

- **Modo offline** — não há cache local de dados; perdeu internet, perdeu acesso. Aceitável pro caso de uso (academia tem Wi-Fi confiável). Se um dia virar mobile-pesado fora da academia, considerar PWA + storage local.
- **Tema escuro** — não implementado. shadcn/ui já suporta nativamente, é trivial de ativar se for solicitado.
- **Internacionalização** — UI 100% em português. Sistema é regional, não há justificativa pra adicionar i18n agora.
- **Animações elaboradas** — uso transições simples do Tailwind (`transition-colors`, `hover:`). Framer Motion ou animações complexas ficam pra quando houver demanda real.