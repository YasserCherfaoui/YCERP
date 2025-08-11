## Expenses System Design (Frontend)

### Alignment
Follows `@steering/structure.md` and `@steering/tech.md`:
- React 18 + TypeScript, Vite
- Routing in `src/app/routes.tsx`
- State: Redux Toolkit for app-level; React Query for server state
- Forms: React Hook Form + Zod
- UI: Shadcn/Radix components; TailwindCSS
- Data: Native `fetch()` with a small typed helper in `src/lib/api-fetch.ts`

### Information Architecture
- Expenses
  - List, filters, table actions (view, edit, approve, mark paid, delete)
  - Create/Edit dialog or side panel
- Recurring Templates
  - List, create/edit dialog, pause/resume, run-now, end
- Categories
  - List, create/edit, deactivate
- Reports
  - Totals by month (line/bar)
  - Totals by category (pie/bar)

### Routing
- Add routes under company dashboard namespace using existing `private-route` conventions:
  - `/dashboard/company/expenses`
  - `/dashboard/company/expenses/recurring`
  - `/dashboard/company/expenses/categories`
  - `/dashboard/company/expenses/reports`

### UI Components (to reuse/create)
- Filters bar: date range picker, category select (async), status select, vendor input, amount min/max, sort select
- Data table: TanStack Table with server-side pagination/sorting
- Action dialogs: approve, mark-paid, delete, pause/resume, run-now
- Forms: expense form, category form, recurring template form
- Feedback: loading, error, and empty states (`components/common/*`)
- Charts: Recharts/Chart.js components for monthly/category totals

### State Management
- Server state via React Query:
  - Query keys: `['expenses', filters]`, `['expense', id]`, `['expense-categories']`, `['recurring-expenses']`, `['expense-totals', range]`
  - Mutations: create/update/delete expense, approve, mark-paid; categories CRUD; recurring CRUD, pause/resume, run-now
  - Cache invalidation on success; optimistic updates for approve/mark-paid
- Global state via Redux only for cross-cutting UI preferences if needed (e.g., page size)

### Forms and Validation
- Zod schemas co-located in `src/schemas/expense.ts`, `src/schemas/expense-category.ts`, `src/schemas/recurring-expense.ts`:
  - Expense: title, category, amount (int>0), date, payment_method, vendor, description?, currency default DZD
  - Category: name (unique), description?, is_active boolean
  - Recurring: fields per backend design with day_of_month in 1..28 and start_month first day
- React Hook Form integrates with Shadcn inputs; error display under fields

### Services (fetch)
- Shared helper in `src/lib/api-fetch.ts`:
  - `apiFetch<T>(path: string, options?: RequestInit): Promise<T>`
  - Prefixes `/api`, attaches JWT, sets `Content-Type`, parses the global envelope `{ status, message, data, error }`, throws on non-success statuses.
- `src/services/expenses-service.ts`
  - list(params): GET `/api/expenses` with query params including `company_id`, filters, `page`, `limit`
  - get(id): GET `/api/expenses/:id`
  - create(payload): POST `/api/expenses`
  - update(id, payload): PUT `/api/expenses/:id`
  - delete(id): DELETE `/api/expenses/:id`
  - approve(id): POST `/api/expenses/:id/approve`
  - markPaid(id): POST `/api/expenses/:id/mark-paid`
- `src/services/recurring-expenses-service.ts`
  - list(company_id, status?): GET `/api/recurring-expenses`
  - create(payload): POST `/api/recurring-expenses`
  - get(id): GET `/api/recurring-expenses/:id`
  - update(id, payload): PUT `/api/recurring-expenses/:id`
  - delete(id): DELETE `/api/recurring-expenses/:id`
  - pause(id): POST `/api/recurring-expenses/:id/pause`
  - resume(id): POST `/api/recurring-expenses/:id/resume`
  - runNow(id): POST `/api/recurring-expenses/:id/run`
- `src/services/expense-reports-service.ts`
  - totalsByMonth(company_id, date_from, date_to): GET `/api/expenses/reports/totals/months`
  - totalsByCategory(company_id, date_from, date_to): GET `/api/expenses/reports/totals/categories`
- Categories (Planned per API doc): `src/services/expense-categories-service.ts` with list/create/update/delete using `/api/expense-categories`

### Data Models
- Add TypeScript models in `src/models/data/expenses/`:
  - `expense.model.ts`, `expense-category.model.ts`, `recurring-expense.model.ts`
- Add response wrappers in `src/models/responses/expenses/`

### Pages and Components Placement
- Pages in `src/pages/dashboard/company/`:
  - `expenses-page.tsx`
  - `expenses-recurring-page.tsx`
  - `expenses-categories-page.tsx` (Planned)
  - `expenses-reports-page.tsx`
- Feature components in `src/components/feature-specific/expenses/`

### Access Control
- Use existing company private routes; hide or disable restricted actions based on role from auth context/slice.

### Error/Loading/Empty States
- Centralize via `components/common/loading-states.tsx` and `components/common/error-states.tsx`.

### Performance
- Server-side pagination and sorting; debounce filter inputs.
- Memoize table columns and row renderers; virtualize if needed for large lists.

### API Envelope Handling
- All responses arrive wrapped: `{ status, message, data, error }`. Components should consume `data` and surface `message` on success or toast/display `error.description` on failure.



