# Frontend (React / TypeScript)

Vite + React 18 SPA. Package manager: **yarn**.

## Layout

```
frontend/src/
├── app/              # routes.tsx, constants (baseUrl)
├── components/
│   ├── ui/           # shadcn/Radix primitives (data-table, dialog, …)
│   └── feature-specific/  # domain components (orders, inventory, woo-refund, …)
├── hooks/            # Custom React hooks
├── layouts/          # Dashboard, company, franchise layouts
├── models/
│   ├── data/         # Domain types (inventory.model.ts, order.model.ts, …)
│   └── responses/    # APIResponse wrappers
├── pages/            # Route-level page components
├── schemas/          # Zod validation schemas (inventory-schema.ts, order.ts, …)
└── services/         # API fetch functions (inventory-service.ts, order-service.ts, …)
```

## Conventions

- **Path alias** — use `@/` imports (e.g. `@/services/inventory-service`).
- **API calls** — `fetch` against `baseUrl` from `@/app/constants`, with `Authorization: Bearer ${localStorage.getItem('token')}`.
- **Response shape** — backend returns `APIResponse<T>`; services throw on `!response.ok` with the error message.
- **Validation** — Zod schemas in `schemas/`; form hooks via `react-hook-form` + `@hookform/resolvers`.
- **Data fetching** — TanStack React Query where caching/refetch is needed; plain async functions in services.
- **Tables** — TanStack Table + `@/components/ui/data-table`; column defs often in `*-columns.tsx` files.
- **UI** — Tailwind CSS, shadcn/Radix components, `cn()` from `@/lib/utils` for class merging.

## Scripts

```bash
cd frontend
yarn install
yarn dev          # local dev server
yarn type-check   # tsc --noEmit
yarn lint         # eslint
yarn build        # production build
```

## Adding a feature

1. Add/update types in `models/data/`.
2. Add Zod schema in `schemas/` if the form or payload needs validation.
3. Add service functions in `services/`.
4. Build UI in `components/feature-specific/` and wire a page in `pages/`.
5. Register route in `app/routes.tsx`.

## Inventory UI

- Service: `services/inventory-service.ts`
- Models: `models/data/inventory.model.ts`
- Schema: `schemas/inventory-schema.ts`
- Discrepancies dialog: `components/feature-specific/inventory-discrepancies-dialog.tsx`

Ledger migration changed discrepancy fields (`ledger_balance`, `discrepancy`) — keep frontend aligned with backend Phase 3+ API responses.

## Boundaries

- Do not introduce new state libraries; Redux Toolkit is already used where needed.
- Match existing fetch/error-handling patterns in sibling services.
- Colocate feature components under `feature-specific/<domain>/`.
