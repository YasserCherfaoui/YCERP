## Expenses System Requirements (Frontend)

### Overview
This document defines the frontend requirements for the Expenses System, derived from the backend spec and aligned with COSMOS ERP steering. It focuses on UI/UX, routing, state management, validation, and client-side behaviors for one-time and recurring expenses, approvals, categories, reporting, and export.

### Personas
- Accountant: records and manages expenses
- Manager: approves expenses and reviews totals
- Administrator: manages categories and recurring templates

### Scope
- Company-level only (no franchise/affiliate UI)
- Currency defaults to DZD; optional currency field displayed
- Minimal workflow: recorded → approved → paid
- Lightweight analytics (totals by month/category)

### API and Transport
- Use native `fetch()` for all API calls (no Axios).
- Base path: `/api`.
- All responses follow the envelope: `{ status, message, data, error }`.

### Pages and Routes
- Expenses List: `/dashboard/company/expenses`
- Recurring Templates: `/dashboard/company/expenses/recurring`
- Categories (Planned): `/dashboard/company/expenses/categories`
- Reports: `/dashboard/company/expenses/reports`

### Expense Entry (One-time)
- As an Accountant, I can create a one-time expense with title, category, amount (> 0), date, payment method, vendor, and description.
  - Acceptance:
    - Required fields validated client-side (Zod) and error messages surfaced inline
    - On submit, mutation succeeds and list invalidates/refetches; toast feedback is shown
    - Amount is validated as positive integer (smallest unit DZD)
    - Currency defaults to DZD but can be changed if provided by backend config

### Expense Editing
- As an Accountant, I can edit an existing expense while it is recorded or approved.
  - Acceptance:
    - Form prefilled from server
    - Validation same as create
    - List updates without full page reload (React Query cache update)

### Approval and Payment
- As a Manager, I can approve a recorded expense.
  - Acceptance:
    - Approve action visible only for roles with permission
    - Confirmation dialog appears; after success, status updates to approved
- As an Accountant, I can mark an expense paid if it is recorded or approved.
  - Acceptance:
    - Mark-paid action visible per role
    - After success, status updates to paid; paid_at displayed

### Deletion
- As authorized users, I can delete recorded expenses.
  - Acceptance:
    - Protected by confirmation dialog
    - UI hides deleted items according to backend semantics

### Categorization (Planned)
- Category management UI (list/create/update/delete) is planned per API. Expense forms use a category string field.

### Recurring Monthly Expenses
- As an Administrator, I can set up monthly recurring templates (title, category, amount, currency, payment method, vendor, day_of_month, start_month, optional end_month).
  - Acceptance:
    - Create, edit, delete/end template
    - Pause/resume controls change status
    - Run-now generates current month instance and navigates to or highlights it in list
- As a Manager, I can view next_run_at and last_generated_at.

### Listing and Filtering
- As an Accountant, I can filter expenses by date range, category, status, amount range, and vendor.
  - Acceptance:
    - Filter bar persists current values in URL query params
    - Table supports sort by date/amount; pagination honors `page` and `limit` query params
    - Empty, loading, and error states are clear and actionable
    - Selection retained when paging (optional) and cleared on filter change

### Reporting
- As a Manager, I can view totals by month and by category as charts and tables.
  - Acceptance:
    - Date range selectors
    - Charts render within 300ms on typical datasets; tooltips and legends available

### Security and Access
- Route protection via existing private route patterns; expenses UI available only to authenticated company users.
- Action-level gating: approve/mark-paid limited to roles per RBAC; hidden or disabled with tooltip as per policy.
- Company isolation: all requests scope by company context.

### Non-Functional Requirements
- Performance: initial list view interactive within 1s; subsequent interactions < 200ms typical.
- Responsiveness: works on desktop and mobile breakpoints.
- Accessibility: keyboard navigable; aria labels, focus states, semantic HTML.
- Reliability: UI gracefully handles network errors and retries where appropriate.

### Success Metrics
- Users can record one-time and recurring expenses in < 10s typical.
- Filters reflect current UI state.
- Totals by month/category match backend aggregates.


