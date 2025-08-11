# Expenses System Design

## Architecture Overview
Follows existing handler → service → model layering with Gin, GORM, and PostgreSQL.

## Data Model

### Expense
```go
type ExpenseStatus string

const (
    ExpenseStatusRecorded  ExpenseStatus = "recorded"
    ExpenseStatusApproved  ExpenseStatus = "approved"
    ExpenseStatusPaid      ExpenseStatus = "paid"
    ExpenseStatusCancelled ExpenseStatus = "cancelled"
)

type Expense struct {
    gorm.Model
    CompanyID    uint      `json:"company_id"`
    Company      *Company  `json:"company" gorm:"foreignKey:CompanyID"`

    Title        string    `json:"title"`
    Description  string    `json:"description"`
    Category     string    `json:"category"`
    Amount       int       `json:"amount"` // DZD smallest unit
    Currency     string    `json:"currency" gorm:"default:'DZD'"`
    Date         time.Time `json:"date"`

    PaymentMethod string   `json:"payment_method"` // cash, bank, other
    Vendor        string   `json:"vendor"`
    Status        ExpenseStatus `json:"status" gorm:"default:'recorded'"`

    PaidAt       *time.Time `json:"paid_at"`
    ApprovedBy   *uint      `json:"approved_by"`
    ApprovedAt   *time.Time `json:"approved_at"`

    CreatedBy    uint      `json:"created_by"`
    UpdatedBy    uint      `json:"updated_by"`
}
```

### ExpenseCategory
```go
type ExpenseCategory struct {
    gorm.Model
    Name             string `json:"name" gorm:"uniqueIndex"`
    Description      string `json:"description"`
    IsActive         bool   `json:"is_active" gorm:"default:true"`
    MonthlyBudgetDZD *int   `json:"monthly_budget_dzd"`
}
```

// (Attachments intentionally omitted in simplified Expenses system)

### RecurringExpense (Monthly)
```go
type RecurringStatus string

const (
    RecurringActive  RecurringStatus = "active"
    RecurringPaused  RecurringStatus = "paused"
    RecurringEnded   RecurringStatus = "ended"
)

type RecurringExpense struct {
    gorm.Model
    CompanyID     uint      `json:"company_id"`
    Title         string    `json:"title"`
    Description   string    `json:"description"`
    Category      string    `json:"category"`
    Amount        int       `json:"amount"` // per period in DZD
    Currency      string    `json:"currency" gorm:"default:'DZD'"`
    PaymentMethod string    `json:"payment_method"`
    Vendor        string    `json:"vendor"`

    DayOfMonth    int       `json:"day_of_month"` // 1..28 (safe default)
    StartMonth    time.Time `json:"start_month"`   // first day of month
    EndMonth      *time.Time `json:"end_month"`
    Status        RecurringStatus `json:"status" gorm:"default:'active'"`

    LastGeneratedAt *time.Time `json:"last_generated_at"`
    NextRunAt       *time.Time `json:"next_run_at"`

    CreatedBy     uint      `json:"created_by"`
    UpdatedBy     uint      `json:"updated_by"`
}
```

## API Design

### REST Endpoints
```
GET    /api/expenses                      # List with filters
POST   /api/expenses                      # Create expense
GET    /api/expenses/:id                  # Get expense
PUT    /api/expenses/:id                  # Update expense
DELETE /api/expenses/:id                  # Delete expense
POST   /api/expenses/:id/approve          # Mark approved
POST   /api/expenses/:id/mark-paid        # Mark paid

GET    /api/expense-categories            # List categories
POST   /api/expense-categories            # Create category
PUT    /api/expense-categories/:id        # Update category
DELETE /api/expense-categories/:id        # Delete category (soft-delete or deactivate)

GET    /api/expenses/reports/totals       # Totals by month/category
GET    /api/expenses/export.csv           # Export filtered list as CSV

# Recurring monthly expenses
GET    /api/recurring-expenses            # List recurring templates
POST   /api/recurring-expenses            # Create recurring template
GET    /api/recurring-expenses/:id        # Get template
PUT    /api/recurring-expenses/:id        # Update template
DELETE /api/recurring-expenses/:id        # Delete/end template
POST   /api/recurring-expenses/:id/pause  # Pause generation
POST   /api/recurring-expenses/:id/resume # Resume generation
POST   /api/recurring-expenses/:id/run    # Manually generate current month instance
```

### Query Parameters
```
?company_id=123
&category=rent
&status=paid
&date_from=2024-01-01&date_to=2024-12-31
&amount_min=1000&amount_max=100000
&vendor=SomeVendor
&has_attachments=true
&sort=date_desc  # date_desc|date_asc|amount_desc|amount_asc
&limit=50&offset=0
```

## Service Layer

```go
type ExpenseFilters struct {
    CompanyID   uint
    Category    *string
    Status      *ExpenseStatus
    DateFrom    *time.Time
    DateTo      *time.Time
    AmountMin   *int
    AmountMax   *int
    Vendor      *string
    Sort        string
    Limit       int
    Offset      int
}

type ExpenseService interface {
    Create(ctx context.Context, e *models.Expense) error
    Get(ctx context.Context, id uint) (*models.Expense, error)
    Update(ctx context.Context, e *models.Expense) error
    Delete(ctx context.Context, id uint) error
    List(ctx context.Context, f ExpenseFilters) ([]*models.Expense, int64, error)
    Approve(ctx context.Context, id uint, approverID uint) error
    MarkPaid(ctx context.Context, id uint, userID uint) error

    TotalsByMonth(ctx context.Context, companyID uint, from, to time.Time) (map[string]int64, error)
    TotalsByCategory(ctx context.Context, companyID uint, from, to time.Time) (map[string]int64, error)
}

type CategoryService interface {
    List(ctx context.Context) ([]*models.ExpenseCategory, error)
    Create(ctx context.Context, c *models.ExpenseCategory) error
    Update(ctx context.Context, c *models.ExpenseCategory) error
    Delete(ctx context.Context, id uint) error // or deactivate
}

type RecurringExpenseService interface {
    List(ctx context.Context, companyID uint) ([]*models.RecurringExpense, error)
    Create(ctx context.Context, r *models.RecurringExpense) error
    Get(ctx context.Context, id uint) (*models.RecurringExpense, error)
    Update(ctx context.Context, r *models.RecurringExpense) error
    Delete(ctx context.Context, id uint) error // end template
    Pause(ctx context.Context, id uint) error
    Resume(ctx context.Context, id uint) error
    RunNow(ctx context.Context, id uint, userID uint) (*models.Expense, error) // generate one instance
}
```

// Attachments are not part of this simplified system

## Database

### Indexes
```sql
CREATE INDEX idx_expenses_company ON expenses(company_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_recurring_company ON recurring_expenses(company_id);
CREATE INDEX idx_recurring_status ON recurring_expenses(status);
CREATE INDEX idx_recurring_next_run ON recurring_expenses(next_run_at);
```

### Migrations
- Auto-migrate models initially
- Add non-destructive indexes

## Security
- Reuse JWT auth and RBAC
- Company-level scoping in all queries
- Validate create/update permissions; restrict approve/mark-paid to elevated roles

## Performance
- Pagination on list endpoints
- Simple aggregates with indexes for totals
- Optional caching for frequent totals

## Observability
- Structured logs on create/update/approve/paid actions
- Error logging around aggregates
- Logs for recurring generation jobs and RunNow actions


