# Expenses System Specification

## Overview

The Expenses System is a simplified module focused on recording and analyzing company-level expenses. It provides essential CRUD, categorization, filtering, and lightweight reporting without the complexity of specialized subtypes or heavy workflows.

## Business Context

- Company-focused (no franchises or affiliates)
- Default currency DZD; optional currency field per expense
- Minimal workflow: record → optional approve → paid
- Lightweight analytics (totals by month/category)

## What’s Simplified Compared to Charges

- Single generic `Expense` model with a `category` string instead of separate specialized models
- Optional single-step approval (no multi-stage approvals)
- Basic filtering and summaries (no complex cost allocations or triggers)
 

## Documentation Structure

- 🧩 [Requirements](./requirements.md)
- 🏗️ [Design](./design.md)
- ✅ [Tasks](./tasks.md)

## Key Features

- CRUD for expenses and categories
- Filters by date range, category, amount, and status
- Simple totals and monthly/category summaries
- Company-level isolation and role-based access

### One-time vs Monthly
- One-time expenses: ad-hoc records such as packaging or shipping
- Monthly recurring expenses: templates (e.g., salaries, rent) that generate a monthly expense instance automatically or on-demand

## Architecture Fit

```
┌───────────────────────────────────────────────┐
│                 API Layer (Gin)              │
├───────────────────────────────────────────────┤
│               Handler Layer                  │
│                 Expenses                     │
├───────────────────────────────────────────────┤
│               Service Layer                  │
│              ExpenseService                  │
├───────────────────────────────────────────────┤
│              Model Layer (GORM)              │
│         Expense, ExpenseCategory             │
├───────────────────────────────────────────────┤
│            Database (PostgreSQL)             │
└───────────────────────────────────────────────┘
```

## Getting Started (Spec-driven)

1. Start with [Requirements](./requirements.md) user stories and acceptance criteria
2. Implement per [Design](./design.md) models, services, endpoints (including recurring)
3. Execute the phased [Tasks](./tasks.md); ensure tests cover acceptance criteria
4. Reuse existing patterns (handlers → services → models)

## Technology Stack

- Backend: Go (Gin)
- ORM: GORM
- DB: PostgreSQL
- Auth: JWT + RBAC
 

## Security

- Company-level data isolation
- Role-based permissions for CRUD and approve/pay actions
- Audit fields tracked on records

---

This spec intentionally keeps scope minimal to deliver immediate value for expense tracking while staying consistent with MyERP architecture.


