// Other miscellaneous charges model
import { BaseCharge } from "./charge.model";

export interface OtherCharge extends BaseCharge {
  type: "other";
  
  // Categorization
  expense_category: "office_supplies" | "professional_services" | "travel" | "entertainment" | "training" | "software" | "equipment" | "miscellaneous";
  subcategory?: string;
  business_purpose: string;
  
  // Vendor/supplier information
  vendor_name?: string;
  vendor_contact?: string;
  vendor_tax_id?: string;
  vendor_address?: string;
  
  // Purchase details
  purchase_date: string | Date;
  invoice_number?: string;
  invoice_date?: string | Date;
  payment_terms?: string;
  
  // Cost breakdown
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  shipping_cost?: number;
  handling_fee?: number;
  
  // Business justification
  business_need: string;
  expected_benefit?: string;
  impact_assessment?: string;
  urgency_level: "low" | "medium" | "high" | "urgent";
  
  // Project/department association
  project_id?: string;
  project_name?: string;
  department: string;
  cost_center?: string;
  budget_line_item?: string;
  
  // Recurring expense tracking
  is_recurring: boolean;
  recurrence_frequency?: "weekly" | "monthly" | "quarterly" | "annually";
  next_occurrence_date?: string | Date;
  recurrence_end_date?: string | Date;
  parent_expense_id?: number; // for recurring expenses
  
  // Expense items breakdown
  expense_items: ExpenseItem[];
  
  // Receipt and documentation
  receipt_required: boolean;
  receipts_attached: boolean;
  receipt_urls: string[];
  supporting_documents: string[];
  
  // Reimbursement (if applicable)
  is_reimbursable: boolean;
  reimbursement_type?: "employee" | "client" | "partner" | "insurance";
  reimbursed_by?: string;
  reimbursement_amount?: number;
  reimbursement_status?: "pending" | "approved" | "paid" | "denied";
  reimbursement_date?: string | Date;
  
  // Tax and compliance
  tax_deductible: boolean;
  tax_category?: string;
  requires_tax_documentation: boolean;
  compliance_notes?: string;
  
  // Budget impact
  budget_impact: "within_budget" | "over_budget" | "unbudgeted";
  budget_variance?: number;
  budget_justification?: string;
  
  // Asset tracking (for equipment/software)
  creates_asset: boolean;
  asset_category?: "equipment" | "software" | "furniture" | "technology" | "other";
  asset_useful_life?: number; // months
  depreciation_method?: "straight_line" | "declining_balance" | "sum_of_years";
  
  // Quality and satisfaction
  vendor_rating?: number; // 1-10
  service_quality_rating?: number; // 1-10
  would_recommend_vendor: boolean;
  feedback_notes?: string;
  
  // Integration and automation
  imported_from?: "expense_app" | "credit_card" | "bank" | "manual";
  external_transaction_id?: string;
  automated_categorization: boolean;
  confidence_score?: number; // for automated categorization
  
  // Workflow and approvals
  requires_additional_approval: boolean;
  approval_workflow_stage?: string;
  escalation_level?: number;
  
  // Follow-up actions
  follow_up_required: boolean;
  follow_up_date?: string | Date;
  follow_up_notes?: string;
  completion_status: "pending" | "in_progress" | "completed" | "cancelled";
}

// Individual expense item for detailed breakdown
export interface ExpenseItem {
  ID: number;
  other_charge_id: number;
  
  // Item details
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  
  // Item specifications
  sku?: string;
  model_number?: string;
  specifications?: string;
  warranty_period?: string;
  
  // Tax and discounts
  tax_rate: number;
  tax_amount: number;
  discount_percentage?: number;
  discount_amount?: number;
  
  // Asset information (if applicable)
  is_asset: boolean;
  asset_tag?: string;
  assigned_to?: string;
  location?: string;
  
  // Quality tracking
  condition_received?: "new" | "used" | "refurbished" | "damaged";
  satisfaction_rating?: number;
  
  created_at: string;
}

// Expense category configuration
export interface ExpenseCategory {
  ID: number;
  name: string;
  parent_category_id?: number;
  description?: string;
  
  // Budget controls
  monthly_budget_limit?: number;
  annual_budget_limit?: number;
  requires_approval_above?: number;
  
  // Compliance rules
  receipt_required: boolean;
  business_purpose_required: boolean;
  pre_approval_required: boolean;
  
  // Tax and accounting
  default_tax_rate?: number;
  tax_deductible: boolean;
  accounting_code?: string;
  gl_account?: string;
  
  // Automation rules
  auto_categorization_keywords: string[];
  default_approval_workflow?: string;
  
  // Reporting
  include_in_reports: boolean;
  report_grouping?: string;
  
  is_active: boolean;
  created_at: string;
}

// Vendor master data
export interface Vendor {
  ID: number;
  name: string;
  legal_name?: string;
  vendor_type: "individual" | "company" | "government" | "non_profit";
  
  // Contact information
  primary_contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  
  // Address
  address: string;
  city: string;
  country: string;
  postal_code?: string;
  
  // Business information
  tax_id?: string;
  business_registration?: string;
  industry?: string;
  
  // Payment information
  preferred_payment_method?: "bank_transfer" | "check" | "cash" | "credit_card";
  payment_terms?: string;
  bank_account?: string;
  currency_preference?: string;
  
  // Performance tracking
  total_transactions: number;
  total_amount_paid: number;
  average_transaction_amount: number;
  payment_punctuality_score: number;
  
  // Ratings and reviews
  overall_rating: number;
  reliability_score: number;
  quality_score: number;
  communication_score: number;
  
  // Compliance and verification
  verification_status: "unverified" | "verified" | "rejected";
  verification_date?: string;
  compliance_documents: string[];
  
  // Contract information
  has_contract: boolean;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_value?: number;
  
  // Status
  vendor_status: "active" | "inactive" | "blacklisted" | "pending_approval";
  blacklist_reason?: string;
  
  created_at: string;
  last_transaction_date?: string;
}

// Expense approval workflow
export interface ExpenseApprovalWorkflow {
  ID: number;
  name: string;
  description?: string;
  
  // Trigger conditions
  amount_threshold?: number;
  category_ids: number[];
  department_ids?: number[];
  
  // Approval stages
  approval_stages: ApprovalStage[];
  
  // Timing
  stage_timeout_hours?: number;
  total_timeout_hours?: number;
  
  // Escalation
  escalation_enabled: boolean;
  escalation_after_hours?: number;
  
  // Notifications
  notification_template?: string;
  reminder_frequency_hours?: number;
  
  is_active: boolean;
  created_at: string;
}

export interface ApprovalStage {
  stage_number: number;
  stage_name: string;
  approver_role?: string;
  approver_user_ids?: number[];
  approval_type: "any_one" | "all_required" | "majority";
  is_final_stage: boolean;
  auto_approve_conditions?: string[];
  stage_timeout_hours?: number;
}

// Expense analytics
export interface ExpenseAnalytics {
  period_start: string;
  period_end: string;
  
  // Overall metrics
  total_expenses: number;
  total_transactions: number;
  average_expense_amount: number;
  
  // Category breakdown
  expenses_by_category: CategoryExpense[];
  top_spending_categories: string[];
  
  // Department analysis
  expenses_by_department: DepartmentExpense[];
  
  // Vendor analysis
  top_vendors: VendorExpense[];
  vendor_concentration_risk: number; // percentage from top vendor
  
  // Trend analysis
  expense_trend: "increasing" | "decreasing" | "stable";
  month_over_month_change: number;
  year_over_year_change: number;
  
  // Budget analysis
  budget_utilization: number; // percentage
  over_budget_categories: string[];
  budget_variance: number;
  
  // Approval metrics
  average_approval_time_hours: number;
  approval_success_rate: number;
  most_rejected_categories: string[];
  
  // Efficiency metrics
  processing_time_days: number;
  automation_rate: number; // percentage of auto-categorized
  receipt_compliance_rate: number;
  
  // Compliance and control
  policy_violation_count: number;
  fraud_risk_score: number;
  audit_findings_count: number;
  
  // Forecasting
  next_month_forecast: number;
  annual_projection: number;
  seasonality_factor: number;
}

export interface CategoryExpense {
  category_name: string;
  total_amount: number;
  transaction_count: number;
  percentage_of_total: number;
  budget_allocated?: number;
  budget_utilization?: number;
  trend: "increasing" | "decreasing" | "stable";
}

export interface DepartmentExpense {
  department_name: string;
  total_amount: number;
  transaction_count: number;
  per_employee_average?: number;
  top_category: string;
  budget_variance?: number;
}

export interface VendorExpense {
  vendor_id: number;
  vendor_name: string;
  total_amount: number;
  transaction_count: number;
  average_transaction: number;
  last_transaction_date: string;
  payment_terms_compliance: number; // percentage
}