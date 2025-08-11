// Rent and utilities charge model
import { BaseCharge } from "./charge.model";

export interface RentUtilityCharge extends BaseCharge {
  type: "rent_utility";
  
  // Charge category
  utility_type: "rent" | "electricity" | "water" | "gas" | "internet" | "phone" | "waste" | "security" | "maintenance" | "insurance" | "other";
  subcategory?: string;
  
  // Property/facility information
  property_id?: number;
  property_name: string;
  property_address: string;
  property_type: "office" | "warehouse" | "retail" | "manufacturing" | "mixed";
  floor_area_sqm?: number;
  
  // Billing period
  billing_period_start: string | Date;
  billing_period_end: string | Date;
  billing_cycle: "monthly" | "quarterly" | "annually" | "as_used";
  
  // Meter readings (for utilities)
  meter_readings?: MeterReading[];
  previous_reading?: number;
  current_reading?: number;
  consumption_amount?: number;
  consumption_unit?: "kwh" | "cubic_meter" | "gallons" | "units";
  
  // Rate information
  rate_per_unit?: number;
  base_charge?: number;
  service_charge?: number;
  tax_amount?: number;
  late_fee?: number;
  
  // Cost breakdown
  fixed_cost: number; // rent, base charges
  variable_cost: number; // usage-based costs
  additional_charges: number; // fees, penalties, etc.
  
  // Provider information
  provider_name: string;
  provider_account_number?: string;
  provider_contact?: string;
  service_address?: string;
  
  // Payment details
  due_date: string | Date;
  payment_status: "pending" | "paid" | "overdue" | "disputed" | "partial";
  payment_date?: string | Date;
  payment_method?: "bank_transfer" | "check" | "cash" | "online" | "auto_debit";
  payment_reference?: string;
  
  // Document tracking
  invoice_number?: string;
  invoice_date?: string | Date;
  invoice_file_url?: string;
  receipt_file_url?: string;
  
  // Usage analytics
  usage_efficiency_score?: number; // compared to benchmarks
  usage_trend: "increasing" | "decreasing" | "stable";
  seasonal_adjustment?: number;
  
  // Cost allocation
  cost_allocation: CostAllocation[];
  allocated_percentage: number; // how much of total property cost
  
  // Maintenance related (if applicable)
  maintenance_type?: "preventive" | "corrective" | "emergency" | "upgrade";
  maintenance_description?: string;
  maintenance_vendor?: string;
  warranty_covered?: boolean;
  
  // Energy efficiency (for utilities)
  energy_efficiency_rating?: string;
  carbon_footprint?: number; // kg CO2
  renewable_energy_percentage?: number;
  
  // Budget tracking
  budgeted_amount?: number;
  variance_amount?: number;
  variance_percentage?: number;
  year_to_date_total?: number;
  
  // Contract information
  contract_id?: string;
  contract_start_date?: string | Date;
  contract_end_date?: string | Date;
  contract_renewal_date?: string | Date;
  contract_terms?: string;
  
  // Alerts and notifications
  usage_alerts?: UsageAlert[];
  cost_alerts?: CostAlert[];
  
  // Integration with property management
  property_management_system_id?: string;
  facility_manager_id?: number;
  
  // Compliance and regulations
  regulatory_compliance: boolean;
  environmental_compliance: boolean;
  safety_compliance: boolean;
  compliance_notes?: string;
}

// Meter reading tracking
export interface MeterReading {
  ID: number;
  rent_utility_charge_id: number;
  
  // Reading details
  meter_id: string;
  meter_type: "electricity" | "water" | "gas" | "steam" | "other";
  reading_date: string | Date;
  reading_value: number;
  unit: string;
  
  // Reading validation
  reading_method: "manual" | "automatic" | "estimated" | "remote";
  reader_id?: number;
  photo_url?: string;
  gps_coordinates?: string;
  
  // Quality control
  is_validated: boolean;
  validation_notes?: string;
  estimated_reading: boolean;
  adjustment_amount?: number;
  
  // Comparison with previous
  previous_reading?: number;
  consumption_since_last: number;
  consumption_rate: number; // per day
  
  created_at: string;
}

// Cost allocation across departments/areas
export interface CostAllocation {
  ID: number;
  rent_utility_charge_id: number;
  
  // Allocation target
  department?: string;
  cost_center?: string;
  business_unit?: string;
  area_description?: string;
  
  // Allocation method
  allocation_method: "square_footage" | "headcount" | "usage_meter" | "fixed_percentage" | "manual";
  allocation_percentage: number;
  allocated_amount: number;
  
  // Supporting data
  square_footage?: number;
  headcount?: number;
  usage_factor?: number;
  
  // Approval
  approved_by_id?: number;
  approval_date?: string;
  
  created_at: string;
}

// Usage alert configuration
export interface UsageAlert {
  ID: number;
  property_id: number;
  utility_type: string;
  
  // Alert conditions
  alert_type: "consumption_threshold" | "cost_threshold" | "efficiency_drop" | "meter_malfunction";
  threshold_value: number;
  threshold_unit: string;
  comparison_period: "daily" | "weekly" | "monthly" | "yearly";
  
  // Notification settings
  notification_emails: string[];
  notification_sms?: string[];
  alert_frequency: "immediate" | "daily_summary" | "weekly_summary";
  
  // Alert history
  last_triggered_at?: string;
  trigger_count: number;
  
  is_active: boolean;
  created_at: string;
}

// Cost alert configuration
export interface CostAlert {
  ID: number;
  property_id: number;
  
  // Alert conditions
  budget_threshold_percentage: number; // alert when X% of budget used
  cost_increase_threshold: number; // alert when cost increases by X%
  comparison_period: "month_over_month" | "year_over_year" | "quarter_over_quarter";
  
  // Notification settings
  notification_emails: string[];
  escalation_emails?: string[]; // for urgent alerts
  
  // Alert history
  last_triggered_at?: string;
  trigger_count: number;
  
  is_active: boolean;
  created_at: string;
}

// Property/facility master data
export interface Property {
  ID: number;
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code?: string;
  
  // Property details
  property_type: string;
  total_area_sqm: number;
  usable_area_sqm: number;
  floor_count: number;
  year_built?: number;
  
  // Ownership/lease information
  ownership_type: "owned" | "leased" | "subleased";
  lease_start_date?: string;
  lease_end_date?: string;
  lease_renewal_options?: string;
  
  // Facility management
  property_manager?: string;
  management_company?: string;
  emergency_contact?: string;
  
  // Utilities infrastructure
  electricity_meters: UtilityMeter[];
  water_meters: UtilityMeter[];
  gas_meters: UtilityMeter[];
  
  // Cost centers
  cost_centers: string[];
  departments: string[];
  
  // Status
  occupancy_status: "fully_occupied" | "partially_occupied" | "vacant" | "under_renovation";
  maintenance_status: "good" | "fair" | "needs_attention" | "critical";
  
  created_at: string;
  is_active: boolean;
}

// Utility meter configuration
export interface UtilityMeter {
  ID: string;
  property_id: number;
  
  // Meter details
  meter_type: string;
  meter_model?: string;
  serial_number?: string;
  installation_date?: string;
  last_calibration_date?: string;
  
  // Location
  location_description: string;
  building_section?: string;
  floor?: string;
  room?: string;
  
  // Technical specifications
  capacity?: number;
  unit: string;
  accuracy_class?: string;
  digital_enabled: boolean;
  remote_reading_capable: boolean;
  
  // Service provider
  utility_provider: string;
  provider_meter_id?: string;
  tariff_code?: string;
  
  // Status
  meter_status: "active" | "inactive" | "faulty" | "replaced";
  last_reading_date?: string;
  next_reading_date?: string;
  
  // Maintenance
  maintenance_schedule?: string;
  warranty_expiry?: string;
  replacement_due_date?: string;
  
  created_at: string;
}

// Utility analytics and reporting
export interface UtilityAnalytics {
  property_id: number;
  period_start: string;
  period_end: string;
  
  // Cost analytics
  total_utility_costs: number;
  cost_breakdown: Record<string, number>; // by utility type
  cost_per_sqm: number;
  cost_trend: "increasing" | "decreasing" | "stable";
  
  // Usage analytics
  total_consumption: Record<string, number>; // by utility type
  consumption_per_sqm: Record<string, number>;
  usage_efficiency_score: number;
  
  // Benchmarking
  industry_benchmark_comparison: number; // percentage vs industry average
  similar_properties_comparison: number; // percentage vs similar properties
  
  // Peak usage analysis
  peak_usage_periods: PeakUsagePeriod[];
  load_factor: number; // average/peak usage ratio
  
  // Cost optimization opportunities
  potential_savings: number;
  optimization_recommendations: string[];
  
  // Environmental impact
  carbon_footprint_kg: number;
  renewable_energy_usage: number;
  sustainability_score: number;
  
  // Forecast
  next_period_forecast: UtilityForecast;
  annual_projection: UtilityForecast;
}

export interface PeakUsagePeriod {
  utility_type: string;
  peak_time: string;
  peak_usage: number;
  duration_hours: number;
  cost_impact: number;
  frequency: "daily" | "weekly" | "seasonal" | "occasional";
}

export interface UtilityForecast {
  period: string;
  forecasted_consumption: Record<string, number>;
  forecasted_cost: Record<string, number>;
  confidence_level: number; // percentage
  factors_considered: string[];
  
  // Scenarios
  optimistic_scenario: number;
  realistic_scenario: number;
  pessimistic_scenario: number;
}