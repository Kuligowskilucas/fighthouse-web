# Fight House Web

> Frontend for a monthly fee management system for a jiu-jitsu gym.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)

A Next.js 16 application built with TypeScript and Tailwind v4, developed as a non-profit project for Fight House Club. Mobile-first interface for student registration, payment tracking, and monthly financial overview.

The API this frontend consumes is available at [fighthouse-api](https://github.com/Kuligowskilucas/fighthouse-api).

---

## About the project

Fight House Club is a jiu-jitsu gym whose owner, Marquete, currently manages monthly fees for ~60 students using a physical notebook. This project is a free digital alternative, built with absolute priority on mobile usage — Marquete will use it on his phone far more than on a desktop.

---

## Stack

- **Next.js 16** with App Router and Turbopack
- **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Nova preset)
- **TanStack Query** for data fetching and caching
- **React Hook Form** + **Zod** for forms
- **Axios** with interceptor for Bearer authentication
- **Sonner** for toast notifications
- **Lucide React** for icons

---

## Features

### Authentication
- Login with persistence via localStorage
- Route protection via `<AuthGuard>` in the authenticated layout
- Full logout (invalidates token on the backend)

### Dashboard
- Monthly summary: collected, pending, total overdue, defaulters
- Defaulters list with amount owed and days overdue

### Students
- List with debounced search, active/inactive filter, and pagination
- Create and edit with Zod validation mirroring backend rules
- Detail view with financial history and summary
- Deactivate / reactivate / delete with confirmation

### Monthly Fees
- General list with status filters (tabs) and month selector
- Mark payment with modal (date, method, notes)
- Undo payment with confirmation
- Manual generation of monthly fees (idempotent)

---

## Technical decisions

### Mobile-first
The entire UI was designed from mobile up, expanded to desktop via breakpoints. Comfortable touch targets, stacked card lists instead of tables, a lateral drawer instead of a fixed sidebar.

### Authentication via localStorage
Bearer token stored in localStorage. Known trade-off (vulnerable to XSS) accepted because the system is internal, with a small set of known users, no real financial data being manipulated, and deployment on separate domains (Vercel + Fly.io) — cross-domain cookies would add unnecessary complexity. Token expires in 7 days with daily pruning on the backend.

### URL as source of truth for filters
Filters (search, status, month, pagination) are stored in the URL via `useSearchParams`. F5 preserves state, links are shareable, and hitting back in the browser naturally undoes filter changes.

### Server Components by default
Only components that use state, events, or hooks become Client Components. This reduces the JS bundle and keeps the initial render fast.

### Reusable `<StudentForm>` component for create and edit
The same component is fed optional `defaultValues` and an `onSubmit` callback. Laravel 422 errors are mapped to fields via React Hook Form's `setError` — the user sees "Phone already exists" under the phone field, not a generic toast.

### Hierarchical query invalidation
QueryKeys are structured as arrays like `['students', 'list', params]`. This allows invalidating everything related to students with `invalidateQueries({ queryKey: ['students'] })` — affecting both list and detail simultaneously. Marking a fee as paid updates the dashboard, lists, and details in a chain.

---

## Running locally

### Prerequisites
- Node.js 20+
- Backend running ([fighthouse-api](https://github.com/Kuligowskilucas/fighthouse-api))

### Installation

```bash
git clone https://github.com/Kuligowskilucas/fighthouse-web.git
cd fighthouse-web
npm install
```

### Environment variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost
```

### Start dev server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Project structure

```
src/
  app/
    (auth)/login/         # Unauthenticated route
    (app)/                # Protected routes (AuthGuard in layout)
      dashboard/
      students/
      fees/
    layout.tsx            # Root layout with Providers
    not-found.tsx         # Custom 404
    error.tsx             # Global error boundary
  components/
    ui/                   # shadcn components
    *.tsx                 # Domain components
  hooks/                  # Custom hooks (TanStack Query)
  lib/                    # Utilities and HTTP client
  schemas/                # Zod schemas
  types/                  # TypeScript interfaces
```

---

## Roadmap

### v1 (in development)
- [x] Student CRUD
- [x] Monthly fee management
- [x] Monthly dashboard
- [x] Manual fee generation
- [ ] Change password screen
- [ ] Deployment (Fly.io + Vercel + Neon Postgres)

### v2 (future)
- [ ] Email notifications for defaulters
- [ ] Password reset via email
