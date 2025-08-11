// Rent and utilities service for managing rent and utility charges
import { baseUrl } from '@/app/constants';
import {
  CostAlert,
  Property,
  RentUtilityCharge,
  UsageAlert,
  UtilityAnalytics,
  UtilityForecast,
  UtilityMeter
} from '@/models/data/charges/rent-utility.model';
import { APIResponse } from '@/models/responses/api-response.model';


// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
};

// Fetch parameters for rent utility charges
export interface FetchRentUtilityChargesParams {
  limit?: number;
  offset?: number;
  utility_type?: "rent" | "electricity" | "water" | "gas" | "internet" | "phone" | "waste" | "security" | "maintenance" | "insurance" | "other";
  property_id?: number;
  provider_name?: string;
  payment_status?: "pending" | "paid" | "overdue" | "disputed" | "partial";
  billing_period_start_from?: string;
  billing_period_start_to?: string;
  billing_period_end_from?: string;
  billing_period_end_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  sort_by?: "created_at" | "billing_period_start" | "total_cost" | "due_date";
  sort_order?: "asc" | "desc";
  company_id?: number;
}

// Create rent utility charge data
export interface CreateRentUtilityChargeData {
  utility_type: "rent" | "electricity" | "water" | "gas" | "internet" | "phone" | "waste" | "security" | "maintenance" | "insurance" | "other";
  subcategory?: string;
  property_id?: number;
  property_name: string;
  property_address: string;
  property_type: "office" | "warehouse" | "retail" | "manufacturing" | "mixed";
  floor_area_sqm?: number;
  
  // Billing period
  billing_period_start: string;
  billing_period_end: string;
  billing_cycle: "monthly" | "quarterly" | "annually" | "as_used";
  
  // Meter readings
  meter_readings?: Array<{
    meter_id: string;
    meter_type: "electricity" | "water" | "gas" | "steam" | "other";
    reading_date: string;
    reading_value: number;
    unit: string;
    reading_method: "manual" | "automatic" | "estimated" | "remote";
  }>;
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
  fixed_cost: number;
  variable_cost: number;
  additional_charges: number;
  
  // Provider information
  provider_name: string;
  provider_account_number?: string;
  provider_contact?: string;
  service_address?: string;
  
  // Payment details
  due_date: string;
  payment_status: "pending" | "paid" | "overdue" | "disputed" | "partial";
  payment_date?: string;
  payment_method?: "bank_transfer" | "check" | "cash" | "online" | "auto_debit";
  payment_reference?: string;
  
  // Document tracking
  invoice_number?: string;
  invoice_date?: string;
  invoice_file_url?: string;
  receipt_file_url?: string;
  
  // Usage analytics
  usage_efficiency_score?: number;
  usage_trend: "increasing" | "decreasing" | "stable";
  seasonal_adjustment?: number;
  
  // Cost allocation
  cost_allocation: Array<{
    department?: string;
    cost_center?: string;
    business_unit?: string;
    area_description?: string;
    allocation_method: "square_footage" | "headcount" | "usage_meter" | "fixed_percentage" | "manual";
    allocation_percentage: number;
    allocated_amount: number;
    square_footage?: number;
    headcount?: number;
    usage_factor?: number;
  }>;
  allocated_percentage: number;
  
  // Maintenance related
  maintenance_type?: "preventive" | "corrective" | "emergency" | "upgrade";
  maintenance_description?: string;
  maintenance_vendor?: string;
  warranty_covered?: boolean;
  
  // Energy efficiency
  energy_efficiency_rating?: string;
  carbon_footprint?: number;
  renewable_energy_percentage?: number;
  
  // Budget tracking
  budgeted_amount?: number;
  variance_amount?: number;
  variance_percentage?: number;
  year_to_date_total?: number;
  
  // Contract information
  contract_id?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_renewal_date?: string;
  contract_terms?: string;
  
  // Compliance
  regulatory_compliance: boolean;
  environmental_compliance: boolean;
  safety_compliance: boolean;
  compliance_notes?: string;
  
  description?: string;
  attachments?: string[];
}

// Update rent utility charge data
export interface UpdateRentUtilityChargeData extends Partial<CreateRentUtilityChargeData> {
  payment_status?: "pending" | "paid" | "overdue" | "disputed" | "partial";
  payment_date?: string;
  payment_method?: "bank_transfer" | "check" | "cash" | "online" | "auto_debit";
  payment_reference?: string;
  usage_efficiency_score?: number;
  usage_trend?: "increasing" | "decreasing" | "stable";
}

// Usage calculation parameters
export interface UsageCalculationParams {
  property_id: number;
  utility_type: string;
  billing_period_start: string;
  billing_period_end: string;
  meter_readings: Array<{
    meter_id: string;
    reading_value: number;
    reading_date: string;
  }>;
  rate_per_unit: number;
  base_charge: number;
  service_charge: number;
  tax_rate: number;
}

// Usage calculation result
export interface UsageCalculationResult {
  total_consumption: number;
  total_cost: number;
  cost_breakdown: {
    base_charge: number;
    usage_charge: number;
    service_charge: number;
    tax_amount: number;
    total: number;
  };
  
  // Efficiency metrics
  consumption_per_sqm: number;
  cost_per_unit: number;
  efficiency_score: number;
  
  // Comparison
  previous_period_comparison: {
    consumption_change: number;
    cost_change: number;
    efficiency_change: number;
  };
  
  // Recommendations
  optimization_suggestions: string[];
  cost_reduction_opportunities: string[];
}

// Dashboard data
export interface RentUtilityDashboardParams {
  date_from?: string;
  date_to?: string;
  utility_type?: string;
  property_id?: number;
  company_id?: number;
}

export interface RentUtilityDashboardData {
  total_charges: number;
  total_cost: number;
  total_consumption: Record<string, number>;
  average_cost_per_sqm: number;
  
  // Payment status
  payment_status_breakdown: {
    pending: number;
    paid: number;
    overdue: number;
    disputed: number;
    partial: number;
  };
  
  // Utility breakdown
  utility_type_breakdown: Record<string, {
    count: number;
    total_cost: number;
    total_consumption: number;
    average_cost: number;
  }>;
  
  // Property performance
  property_performance: Array<{
    property_name: string;
    total_cost: number;
    cost_per_sqm: number;
    efficiency_score: number;
    utility_count: number;
  }>;
  
  // Usage trends
  usage_trends: Array<{
    date: string;
    electricity_consumption: number;
    water_consumption: number;
    gas_consumption: number;
    total_cost: number;
  }>;
  
  // Alerts
  overdue_charges: RentUtilityCharge[];
  high_usage_alerts: RentUtilityCharge[];
  budget_variance_alerts: RentUtilityCharge[];
  
  // Efficiency metrics
  overall_efficiency_score: number;
  cost_optimization_opportunities: string[];
  sustainability_score: number;
}

// API Response types
export interface RentUtilityChargeListResponse extends APIResponse<RentUtilityCharge[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface RentUtilityChargeResponse extends APIResponse<RentUtilityCharge> {}
export interface UsageCalculationResponse extends APIResponse<UsageCalculationResult> {}
export interface DashboardResponse extends APIResponse<RentUtilityDashboardData> {}
export interface AnalyticsResponse extends APIResponse<UtilityAnalytics> {}

// CRUD Operations - Rent Utility Charges

// Get rent utility charges
export const getRentUtilityCharges = async (params: FetchRentUtilityChargesParams = {}): Promise<RentUtilityChargeListResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/rent-utility-charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get single rent utility charge
export const getRentUtilityCharge = async (id: number): Promise<RentUtilityChargeResponse> => {
  const response = await fetch(`${baseUrl}/rent-utility-charges/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create rent utility charge
export const createRentUtilityCharge = async (data: CreateRentUtilityChargeData): Promise<RentUtilityChargeResponse> => {
  const response = await fetch(`${baseUrl}/rent-utility-charges`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Update rent utility charge
export const updateRentUtilityCharge = async (id: number, data: UpdateRentUtilityChargeData): Promise<RentUtilityChargeResponse> => {
  const response = await fetch(`${baseUrl}/rent-utility-charges/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Delete rent utility charge
export const deleteRentUtilityCharge = async (id: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/rent-utility-charges/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Usage Calculations

// Calculate usage and costs
export const calculateUsage = async (params: UsageCalculationParams): Promise<UsageCalculationResponse> => {
  const response = await fetch(`${baseUrl}/rent-utility-charges/calculate-usage`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get usage forecast
export const getUsageForecast = async (params: {
  property_id: number;
  utility_type: string;
  forecast_periods: number;
}): Promise<APIResponse<UtilityForecast>> => {
  const response = await fetch(`${baseUrl}/rent-utility-charges/usage-forecast`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
};

// Property Management

// Get properties
export const getProperties = async (params: {
  active_only?: boolean;
  property_type?: string;
  search?: string;
} = {}): Promise<APIResponse<Property[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create property
export const createProperty = async (data: Omit<Property, "ID">): Promise<APIResponse<Property>> => {
  const response = await fetch(`${baseUrl}/properties`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Meter Management

// Get utility meters
export const getUtilityMeters = async (params: {
  property_id?: number;
  meter_type?: string;
  active_only?: boolean;
} = {}): Promise<APIResponse<UtilityMeter[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/utility-meters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create utility meter
export const createUtilityMeter = async (data: Omit<UtilityMeter, "ID">): Promise<APIResponse<UtilityMeter>> => {
  const response = await fetch(`${baseUrl}/utility-meters`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Alert Management

// Get usage alerts
export const getUsageAlerts = async (params: {
  property_id?: number;
  utility_type?: string;
  active_only?: boolean;
} = {}): Promise<APIResponse<UsageAlert[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/usage-alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create usage alert
export const createUsageAlert = async (data: Omit<UsageAlert, "ID">): Promise<APIResponse<UsageAlert>> => {
  const response = await fetch(`${baseUrl}/usage-alerts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get cost alerts
export const getCostAlerts = async (params: {
  property_id?: number;
  active_only?: boolean;
} = {}): Promise<APIResponse<CostAlert[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/cost-alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Analytics and Reporting

// Get rent utility dashboard
export const getRentUtilityDashboard = async (params: RentUtilityDashboardParams): Promise<DashboardResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/rent-utility-charges/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get utility analytics
export const getUtilityAnalytics = async (params: {
  property_id: number;
  date_from?: string;
  date_to?: string;
  utility_type?: string;
}): Promise<AnalyticsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/utility-analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Export and Import

// Export rent utility charges
export const exportRentUtilityCharges = async (params: FetchRentUtilityChargesParams & {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_meter_readings?: boolean;
}): Promise<APIResponse<{ file_url: string; file_size: number }>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/rent-utility-charges/export?${queryParams.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Import rent utility charges
export const importRentUtilityCharges = async (file: File, options?: {
  skip_duplicates?: boolean;
  auto_calculate_usage?: boolean;
  default_property_id?: number;
}): Promise<APIResponse<{ imported_count: number; errors: string[] }>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
  }

  const response = await fetch(`${baseUrl}/rent-utility-charges/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: formData,
  });
  
  await handleApiError(response);
  return response.json();
};

// Bulk Operations

// Bulk update payment status
export const bulkUpdatePaymentStatus = async (data: {
  charge_ids: number[];
  payment_status: "paid" | "overdue" | "disputed";
  payment_date?: string;
  notes?: string;
}): Promise<APIResponse<{ updated_count: number; errors: string[] }>> => {
  const response = await fetch(`${baseUrl}/rent-utility-charges/bulk-update-payment`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Bulk calculate usage
export const bulkCalculateUsage = async (charges: UsageCalculationParams[]): Promise<APIResponse<UsageCalculationResult[]>> => {
  const response = await fetch(`${baseUrl}/rent-utility-charges/bulk-calculate-usage`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ charges }),
  });
  
  await handleApiError(response);
  return response.json();
}; 