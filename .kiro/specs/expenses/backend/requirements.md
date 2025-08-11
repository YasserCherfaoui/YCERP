# Expenses System Requirements (User Stories)

## Overview
User stories capturing simplified expense tracking for one-time and monthly recurring expenses, with attachments, categorization, and lightweight reporting.

## Personas
- Accountant (enters and manages expenses)
- Manager (approves expenses and reviews totals)
- Administrator (configures categories and permissions)

## User Stories

### Expense Entry (One-time)
- As an Accountant, I want to record a one-time expense with title, category, amount, and date so that I can track ad-hoc costs (e.g., shipping, packaging).
  - Acceptance:
    - Given required fields are provided and amount > 0
    - When I submit the expense
    - Then the expense is saved with status "recorded" and is visible in the list for my company

### Recurring Monthly Expenses (e.g., Salaries, Rent)
- As an Administrator, I want to set up a monthly recurring expense template so that the system can generate monthly salary/rent expenses automatically.
  - Acceptance:
    - Given title, category, amount, start_month and day_of_month are set
    - When the month begins (or I trigger manual generation)
    - Then a new expense instance is created for that month with status "recorded"

- As an Accountant, I want to pause or resume a recurring expense so that I can temporarily stop generation.
  - Acceptance:
    - Given a recurring expense is active
    - When I pause it
    - Then no new monthly instances are generated until resumed

- As a Manager, I want to preview the next generated date and total for recurring expenses so that I can plan cash flow.
  - Acceptance:
    - Given a recurring expense exists
    - When I view its details
    - Then I see next_run_at and last_generated_at

### Approval and Payment
- As a Manager, I want to approve an expense so that it becomes ready for payment.
  - Acceptance:
    - Given an expense is in status "recorded"
    - When I approve it
    - Then status becomes "approved" with approver and timestamp recorded

- As an Accountant, I want to mark an expense as paid so that it appears in paid totals.
  - Acceptance:
    - Given an expense is "recorded" or "approved"
    - When I mark it paid
    - Then status becomes "paid" and a paid_at timestamp is stored

### Categorization
- As an Administrator, I want to manage expense categories so that users can classify expenses consistently.
  - Acceptance:
    - I can create, rename, deactivate categories
    - Deactivated categories cannot be assigned to new expenses



### Listing and Filtering
- As an Accountant, I want to filter expenses by date range, category, status, amount, and vendor so that I can quickly find records.
  - Acceptance:
    - Given filters are applied
    - When I query the list
    - Then I receive a paginated, sorted result matching the filters

### Reporting and Export
- As a Manager, I want totals by month and by category so that I can see spending trends.
  - Acceptance:
    - Given a date range and company
    - When I fetch totals
    - Then I receive aggregated amounts grouped by month or category

- As an Accountant, I want to export filtered expenses to CSV so that I can share them with external systems.
  - Acceptance:
    - Given filters are applied
    - When I export
    - Then I receive a CSV with the filtered dataset

### Security and Access
- As an Administrator, I want company-level data isolation and role-based permissions so that users only see and do what they’re allowed to.
  - Acceptance:
    - JWT + RBAC enforced; only permitted actions are available per role

## Non-Functional Requirements
- List/detail responses < 200ms under typical loads
- Consistent error responses and input validation
- Audit fields maintained for key actions

## Success Metrics
- Users can record one-time and recurring expenses quickly (< 10s typical)
- Monthly/category totals are clear and accurate
- CSV export reliably reflects current filters


