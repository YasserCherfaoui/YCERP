// Response models for charges API
import { Charge, ChargeApprovalHistory, ChargeAttachment, ChargeCategory, ChargeComment } from "@/models/data/charges/charge.model";
import { ExchangeRateCharge, ExchangeRateHistory, ExchangeRateSource } from "@/models/data/charges/exchange-rate.model";
import { SalaryCharge, SalaryTemplate } from "@/models/data/charges/salary.model";
import { APIResponse } from "./api-response.model";

// Generic charge responses
export interface ChargeListResponse extends APIResponse<Charge[]> {
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  filters_applied?: Record<string, any>;
  sort_order?: {
    field: string;
    direction: "asc" | "desc";
  };
}

export interface ChargeDetailResponse extends APIResponse<Charge> {
  related_charges?: Charge[];
  comments?: ChargeComment[];
  attachments?: ChargeAttachment[];
  approval_history?: ChargeApprovalHistory[];
  financial_impact?: ChargeFinancialImpact;
}

export interface ChargeFinancialImpact {
  total_cost: number;
  budget_impact: number;
  profit_margin_impact: number;
  cash_flow_impact: number;
  tax_implications: number;
  roi_calculation?: number;
}

// Dashboard and analytics responses
export interface ChargesDashboardResponse extends APIResponse<ChargesDashboard> {}

export interface ChargesDashboard {
  overview_metrics: ChargesOverviewMetrics;
  recent_charges: Charge[];
  pending_approvals: Charge[];
  cost_breakdown: ChargeCostBreakdown[];
  trends: ChargeTrendsData;
  alerts: ChargeAlert[];
  quick_actions: QuickAction[];
}

export interface ChargesOverviewMetrics {
  total_charges_this_month: number;
  total_amount_this_month: number;
  pending_approvals_count: number;
  pending_approvals_amount: number;
  overdue_charges_count: number;
  budget_utilization_percentage: number;
  month_over_month_change: number;
  year_over_year_change: number;
  average_charge_amount: number;
  top_charge_category: string;
}

export interface ChargeCostBreakdown {
  charge_type: string;
  amount: number;
  percentage: number;
  count: number;
  trend: "increasing" | "decreasing" | "stable";
  budget_allocated?: number;
  budget_remaining?: number;
}

export interface ChargeTrendsData {
  daily_trends: TrendDataPoint[];
  weekly_trends: TrendDataPoint[];
  monthly_trends: TrendDataPoint[];
  category_trends: CategoryTrendData[];
}

export interface TrendDataPoint {
  date: string;
  amount: number;
  count: number;
  cumulative_amount?: number;
}

export interface CategoryTrendData {
  category: string;
  trend_direction: "up" | "down" | "stable";
  change_percentage: number;
  current_amount: number;
  previous_period_amount: number;
}

export interface ChargeAlert {
  id: string;
  type: "budget_exceeded" | "approval_overdue" | "unusual_expense" | "policy_violation";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  charge_id?: number;
  created_at: string;
  action_required: boolean;
  action_url?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  permissions_required?: string[];
  enabled: boolean;
}

// Analytics responses
export interface ChargeAnalyticsResponse extends APIResponse<ChargeAnalytics> {}

export interface ChargeAnalytics {
  period_start: string;
  period_end: string;
  
  // Cost analysis
  total_costs: number;
  cost_by_type: Record<string, number>;
  cost_by_month: Record<string, number>;
  cost_variance: number;
  
  // Performance metrics
  average_processing_time: number;
  approval_rate: number;
  policy_compliance_rate: number;
  
  // Predictive analytics
  forecasted_costs: ForecastData[];
  budget_projections: BudgetProjection[];
  risk_indicators: RiskIndicator[];
  
  // Efficiency metrics
  cost_per_transaction: number;
  automation_rate: number;
  error_rate: number;
  
  // Recommendations
  cost_optimization_opportunities: OptimizationOpportunity[];
  process_improvements: ProcessImprovement[];
}

export interface ForecastData {
  period: string;
  forecasted_amount: number;
  confidence_interval: {
    lower: number;
    upper: number;
    confidence_level: number;
  };
  factors: string[];
}

export interface BudgetProjection {
  category: string;
  allocated_budget: number;
  projected_spend: number;
  variance: number;
  likelihood_of_overspend: number;
  recommended_action: string;
}

export interface RiskIndicator {
  risk_type: "cost_overrun" | "compliance" | "vendor" | "quality";
  risk_level: "low" | "medium" | "high";
  description: string;
  impact: number;
  probability: number;
  mitigation_suggestions: string[];
}

export interface OptimizationOpportunity {
  opportunity_type: "cost_reduction" | "process_improvement" | "vendor_optimization";
  description: string;
  potential_savings: number;
  implementation_effort: "low" | "medium" | "high";
  priority: "low" | "medium" | "high";
  action_plan: string[];
}

export interface ProcessImprovement {
  area: string;
  current_state: string;
  proposed_improvement: string;
  expected_benefit: string;
  implementation_timeline: string;
}

// Export responses
export interface ChargeExportResponse extends APIResponse<ChargeExportData> {}

export interface ChargeExportData {
  export_id: string;
  export_format: "pdf" | "excel" | "csv" | "json";
  file_url: string;
  file_size: number;
  records_count: number;
  filters_applied: Record<string, any>;
  generated_at: string;
  expires_at: string;
}

// Bulk operations responses
export interface BulkChargeOperationResponse extends APIResponse<BulkOperationResult> {}

export interface BulkOperationResult {
  operation_id: string;
  operation_type: "create" | "update" | "delete" | "approve" | "export";
  total_records: number;
  successful_records: number;
  failed_records: number;
  
  // Detailed results
  success_details: BulkOperationDetail[];
  error_details: BulkOperationError[];
  
  // Processing info
  started_at: string;
  completed_at: string;
  processing_time_seconds: number;
  
  // File information (for imports)
  source_file?: string;
  result_file?: string;
}

export interface BulkOperationDetail {
  record_id: string;
  operation: string;
  status: "success" | "warning";
  message?: string;
  created_charge_id?: number;
}

export interface BulkOperationError {
  record_id: string;
  row_number?: number;
  error_code: string;
  error_message: string;
  field_errors?: Record<string, string>;
}

// Specific charge type responses
export interface ExchangeRateChargeResponse extends APIResponse<ExchangeRateCharge> {
  current_rates?: ExchangeRateHistory[];
  rate_sources?: ExchangeRateSource[];
  historical_performance?: ExchangeRatePerformance;
}

export interface ExchangeRatePerformance {
  average_rate: number;
  best_rate: number;
  worst_rate: number;
  volatility_score: number;
  trend_analysis: string;
}

export interface SalaryChargeResponse extends APIResponse<SalaryCharge> {
  payroll_summary?: PayrollSummary;
  templates_available?: SalaryTemplate[];
  compliance_check?: ComplianceStatus;
}

export interface PayrollSummary {
  total_gross: number;
  total_deductions: number;
  total_net: number;
  employee_count: number;
  average_salary: number;
  overtime_total: number;
}

export interface ComplianceStatus {
  tax_compliance: boolean;
  social_security_compliance: boolean;
  labor_law_compliance: boolean;
  issues: string[];
}

// Configuration responses
export interface ChargeConfigurationResponse extends APIResponse<ChargeConfiguration> {}

export interface ChargeConfiguration {
  charge_types: ChargeTypeConfig[];
  approval_workflows: ApprovalWorkflowConfig[];
  categories: ChargeCategory[];
  budget_settings: BudgetSettings;
  integration_settings: IntegrationSettings;
  notification_settings: NotificationSettings;
}

export interface ChargeTypeConfig {
  type: string;
  name: string;
  description: string;
  is_enabled: boolean;
  default_approval_required: boolean;
  required_fields: string[];
  optional_fields: string[];
  validation_rules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule_type: "required" | "min_value" | "max_value" | "regex" | "custom";
  rule_value: any;
  error_message: string;
}

export interface ApprovalWorkflowConfig {
  id: string;
  name: string;
  description: string;
  triggers: WorkflowTrigger[];
  stages: WorkflowStage[];
  is_active: boolean;
}

export interface WorkflowTrigger {
  condition_type: "amount_threshold" | "charge_type" | "category" | "custom";
  condition_value: any;
  operator: "equals" | "greater_than" | "less_than" | "contains";
}

export interface WorkflowStage {
  stage_id: string;
  stage_name: string;
  approver_roles: string[];
  approval_type: "any" | "all" | "majority";
  timeout_hours?: number;
  escalation_enabled: boolean;
}

export interface BudgetSettings {
  budget_periods: BudgetPeriod[];
  budget_alerts: BudgetAlert[];
  variance_thresholds: VarianceThreshold[];
}

export interface BudgetPeriod {
  period_type: "monthly" | "quarterly" | "annually";
  start_date: string;
  end_date: string;
  total_budget: number;
  allocated_budgets: Record<string, number>;
}

export interface BudgetAlert {
  threshold_percentage: number;
  alert_type: "email" | "notification" | "dashboard";
  recipients: string[];
  enabled: boolean;
}

export interface VarianceThreshold {
  charge_type: string;
  warning_threshold: number;
  critical_threshold: number;
  action_required: boolean;
}

export interface IntegrationSettings {
  external_systems: ExternalSystemConfig[];
  api_settings: ApiSettings;
  sync_schedules: SyncSchedule[];
}

export interface ExternalSystemConfig {
  system_name: string;
  system_type: "accounting" | "erp" | "payment" | "banking";
  connection_status: "connected" | "disconnected" | "error";
  last_sync: string;
  sync_frequency: string;
  enabled: boolean;
}

export interface ApiSettings {
  rate_limits: Record<string, number>;
  timeout_seconds: number;
  retry_attempts: number;
  webhook_endpoints: string[];
}

export interface SyncSchedule {
  system_name: string;
  data_type: string;
  frequency: "real_time" | "hourly" | "daily" | "weekly";
  last_run: string;
  next_run: string;
  status: "active" | "paused" | "error";
}

export interface NotificationSettings {
  email_notifications: EmailNotificationConfig[];
  push_notifications: PushNotificationConfig[];
  sms_notifications: SmsNotificationConfig[];
  in_app_notifications: InAppNotificationConfig[];
}

export interface EmailNotificationConfig {
  event_type: string;
  enabled: boolean;
  recipients: string[];
  template_id: string;
  frequency: "immediate" | "daily_digest" | "weekly_digest";
}

export interface PushNotificationConfig {
  event_type: string;
  enabled: boolean;
  priority: "low" | "medium" | "high";
  sound_enabled: boolean;
}

export interface SmsNotificationConfig {
  event_type: string;
  enabled: boolean;
  recipients: string[];
  urgent_only: boolean;
}

export interface InAppNotificationConfig {
  event_type: string;
  enabled: boolean;
  show_badge: boolean;
  auto_dismiss_seconds?: number;
}