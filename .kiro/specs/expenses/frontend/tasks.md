## Expenses Frontend Implementation Tasks

### Phase 0: Foundations
- [x] Create directory structure:
  - `src/components/feature-specific/expenses/`
  - `src/models/data/expenses/`
  - `src/models/responses/expenses/`
  - `src/services/expenses-*`
  - `src/schemas/expenses/*`
- [x] Add routes in `src/app/routes.tsx` for expenses pages (protected)

### Phase 1: Models, Schemas, and Services
- [x] Define TS models: `Expense`, `ExpenseCategory`, `RecurringExpense`
- [x] Define Zod schemas: expense, category, recurring
- [x] Implement services:
  - `lib/api-fetch.ts`: shared `fetch()` helper handling JWT and response envelope
  - `expenses-service.ts` (CRUD, approve, mark-paid, list)
  - `recurring-expenses-service.ts` (CRUD, pause, resume, runNow)
  - `expense-reports-service.ts` (totals by month and by category)
  - `expense-categories-service.ts` (Planned)

### Phase 2: Pages and Navigation
- [x] `expenses-page.tsx`: list + filters + table actions + create/edit dialog
- [x] `expenses-recurring-page.tsx`: list + create/edit + pause/resume + run-now
- [ ] `expenses-categories-page.tsx` (Planned): list + create/edit + deactivate
- [x] `expenses-reports-page.tsx`: charts for totals by month/category, date range controls
- [x] Add sidebar entries in existing company navigation (if applicable)

### Phase 3: Components
- [x] Filters bar component with URL state sync (date, category, status, vendor, amount, sort)
- [x] Expense form component (create/edit)
- [x] Approve/Mark-paid dialogs with confirmations and toasts
- [ ] Categories form and list components
- [x] Recurring template form and actions
- [x] Common empty/loading/error states reused

### Phase 4: Tables and Interactions
- [x] TanStack Table with server-side pagination/sorting (basic table with server params)
- [x] Row actions: edit, approve, mark-paid, delete
- [ ] Bulk actions (optional): approve/mark-paid if allowed
- [x] Persist page size (local storage)

### Phase 5: Reporting
- [x] Charts (Recharts) for monthly and category totals

### Phase 6: Access Control & UX
- [x] Protect routes via company private route
- [ ] Hide or disable restricted actions per RBAC (pending roles mapping)
- [x] Toast notifications and error toasts across mutations
- [x] Form accessibility and keyboard navigation (via UI primitives)

### Phase 7: Quality
- [ ] Type-check clean (`npm run build`)
- [x] Lint clean (`npm run lint` on changed files)
- [ ] Basic unit tests for utilities and components (where feasible)
- [ ] E2E smoke tests for create/approve/mark-paid flows (optional)

### Acceptance Criteria
- [x] Create/update/delete expenses with validation and real-time list updates
- [ ] Approve and mark-paid flows reflect correct UI state and role restrictions (RBAC pending)
- [x] Filters, pagination, and sorting work with URL sync
- [x] Reporting charts match backend aggregates



