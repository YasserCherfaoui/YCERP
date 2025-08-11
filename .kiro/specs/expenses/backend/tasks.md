# Expenses System Implementation Tasks

## Phase 1: Core (1–2 days)
- [ ] Models: `Expense`, `ExpenseCategory`, `ExpenseAttachment`, `RecurringExpense`
- [ ] Auto-migrate and basic indexes
- [ ] Repository + `ExpenseService`, `CategoryService` interfaces
 - [ ] `RecurringExpenseService` interface

## Phase 2: CRUD API (1–2 days)
- [ ] Handlers and routes for expenses (CRUD, approve, mark-paid)
- [ ] Handlers and routes for categories (CRUD/deactivate)
- [ ] Handlers and routes for recurring templates (CRUD, pause/resume, run-now)
- [ ] Validation and consistent responses

## Phase 3: Listing & Filtering (0.5–1 day)
- [ ] Filters: company, category, status, date range, amount range, vendor
- [ ] Sorting and pagination
- [ ] Recurring list with status filters and next_run ordering

## Phase 4: (unused)
// Attachments intentionally omitted in simplified Expenses system

## Phase 5: Reporting & Export (1 day)
- [ ] Totals by month and by category
- [ ] CSV export for filtered list
- [ ] Preview next month’s recurring totals (sum of active templates)

## Phase 6: Security & RBAC (0.5 day)
- [ ] Enforce company isolation on all queries
- [ ] Role checks for approve/mark-paid

## Phase 7: Testing & Docs (1–2 days)
- [ ] Unit tests for services (create/list/approve/paid/totals)
- [ ] Unit tests for recurring service (create/pause/resume/run-now, next_run logic)
- [ ] Handler tests for main flows
- [ ] API docs and quick user guide with user stories mapped to endpoints

## Optional Enhancements (later)
- [ ] Budgets on categories with alerts
- [ ] Tagging and saved filters
- [ ] Caching for aggregates

## Acceptance Criteria
- [ ] Create/update/delete expenses with validation
- [ ] Create/pause/resume/run recurring templates; monthly instance generation works
- [ ] Filtered lists with pagination under 200ms typical
- [ ] Approve and mark-paid flows with RBAC
- [ ] Totals endpoints return correct aggregates


