// Returns service for managing return fees and return processing
import { baseUrl } from '@/app/constants';
import {
  ProductReturnAnalytics,
  ReasonAnalytics,
  ReturnAnalytics,
  ReturnPolicy,
  ReturnsCharge,
  YalidineReturnEvent
} from "@/models/data/charges/returns.model";
import { APIResponse } from "@/models/responses/api-response.model";


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

// Fetch parameters for returns charges
export interface FetchReturnsChargesParams {
  limit?: number;
  offset?: number;
  order_id?: number;
  original_sale_id?: number;
  customer_id?: number;
  return_reason?: "defective" | "wrong_item" | "not_as_described" | "customer_changed_mind" | "damaged_in_shipping" | "late_delivery" | "other";
  return_method?: "pickup" | "drop_off" | "mail" | "in_store";
  current_status?: "initiated" | "in_transit" | "received" | "inspecting" | "processed" | "refunded" | "closed" | "disputed";
  resolution_type?: "full_refund" | "partial_refund" | "store_credit" | "exchange" | "repair" | "no_refund";
  condition_assessment?: "new" | "like_new" | "good" | "fair" | "poor" | "damaged" | "defective";
  return_initiated_from?: string;
  return_initiated_to?: string;
  return_received_from?: string;
  return_received_to?: string;
  customer_name?: string;
  yalidine_return_id?: string;
  vendor_responsible?: boolean;
  requires_manual_review?: boolean;
  search?: string;
  sort_by?: "return_initiated_date" | "return_received_date" | "total_return_value" | "net_loss" | "created_at";
  sort_order?: "asc" | "desc";
  company_id?: number;
}

// Create returns charge data
export interface CreateReturnsChargeData {
  order_id?: number;
  original_sale_id?: number;
  customer_id?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  
  // Return details
  return_reason: "defective" | "wrong_item" | "not_as_described" | "customer_changed_mind" | "damaged_in_shipping" | "late_delivery" | "other";
  detailed_reason?: string;
  customer_complaint?: string;
  return_method: "pickup" | "drop_off" | "mail" | "in_store";
  
  // Items being returned
  returned_items: Array<{
    product_id: number;
    product_variant_id?: number;
    quantity_returned: number;
    original_price: number;
    condition: string;
    condition_notes?: string;
    item_reason?: string;
    defect_description?: string;
  }>;
  
  // Logistics
  return_shipping_cost: number;
  return_tracking_number?: string;
  yalidine_return_id?: string;
  
  // Costs
  inspection_cost: number;
  restocking_cost: number;
  refurbishment_cost?: number;
  disposal_cost?: number;
  administrative_cost: number;
  
  // Financial details
  refund_amount: number;
  restocking_fee?: number;
  shipping_refund?: number;
  processing_fee: number;
  
  // Resolution
  resolution_type: "full_refund" | "partial_refund" | "store_credit" | "exchange" | "repair" | "no_refund";
  resolution_amount?: number;
  resolution_notes?: string;
  
  // Timeline
  return_initiated_date: string;
  return_received_date?: string;
  
  // Analysis
  vendor_responsible: boolean;
  vendor_claim_amount?: number;
  return_to_inventory: boolean;
  new_inventory_status?: "sellable" | "refurbished" | "damaged" | "disposed";
  preventable: boolean;
  prevention_category?: "quality_control" | "shipping" | "description" | "customer_education" | "other";
  lessons_learned?: string;
  
  // Fraud detection
  fraud_risk_score?: number;
  fraud_indicators?: string[];
  requires_manual_review: boolean;
  
  description?: string;
  attachments?: string[];
}

// Update returns charge data
export interface UpdateReturnsChargeData extends Partial<CreateReturnsChargeData> {
  current_status?: "initiated" | "in_transit" | "received" | "inspecting" | "processed" | "refunded" | "closed" | "disputed";
  condition_assessment?: "new" | "like_new" | "good" | "fair" | "poor" | "damaged" | "defective";
  inspection_notes?: string;
  quality_photos?: string[];
  inspection_completed_date?: string;
  refund_processed_date?: string;
  case_closed_date?: string;
  vendor_claim_status?: "pending" | "approved" | "denied" | "partially_approved";
  inventory_adjustment_id?: number;
  payment_processor_refund_id?: string;
  insurance_claim_id?: string;
}

// Return cost calculation parameters
export interface ReturnCostCalculationParams {
  returned_items: Array<{
    product_id: number;
    quantity: number;
    original_price: number;
    condition: string;
  }>;
  return_reason: string;
  return_method: string;
  customer_location?: string;
  
  // Policy settings
  return_policy_id?: number;
  include_shipping_refund?: boolean;
  apply_restocking_fee?: boolean;
  
  // Processing costs
  inspection_required?: boolean;
  refurbishment_needed?: boolean;
  vendor_claim_possible?: boolean;
}

// Return cost calculation result
export interface ReturnCostCalculationResult {
  total_return_value: number;
  refund_amount: number;
  processing_costs: {
    inspection_cost: number;
    restocking_cost: number;
    refurbishment_cost: number;
    disposal_cost: number;
    administrative_cost: number;
    shipping_cost: number;
  };
  
  fees: {
    restocking_fee: number;
    processing_fee: number;
  };
  
  refunds: {
    product_refund: number;
    shipping_refund: number;
    tax_refund: number;
  };
  
  net_loss: number;
  vendor_claim_potential: number;
  
  // Item breakdown
  item_breakdown: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    original_price: number;
    refund_price: number;
    processing_cost: number;
    restocking_fee: number;
    condition_discount: number;
    vendor_claim: number;
  }>;
  
  // Recommendations
  recommendations: {
    approve_return: boolean;
    suggested_resolution: string;
    cost_optimization_tips: string[];
    fraud_risk_level: "low" | "medium" | "high";
  };
}

// Return policy management
export interface CreateReturnPolicyData {
  company_id: number;
  name: string;
  return_window_days: number;
  categories_covered: string[];
  conditions_accepted: string[];
  return_shipping_paid_by: "customer" | "company" | "shared";
  restocking_fee_percentage?: number;
  minimum_restocking_fee?: number;
  inspection_fee?: number;
  original_packaging_required: boolean;
  receipt_required: boolean;
  photos_required: boolean;
  reason_required: boolean;
  excluded_products?: string[];
  holiday_extensions?: boolean;
  international_returns_allowed: boolean;
  auto_approve_conditions?: string[];
  auto_reject_conditions?: string[];
  fraud_check_threshold?: number;
  is_active: boolean;
  effective_from: string;
  effective_until?: string;
}

// Dashboard data
export interface ReturnsDashboardParams {
  date_from?: string;
  date_to?: string;
  return_reason?: string;
  resolution_type?: string;
  company_id?: number;
}

export interface ReturnsDashboardData {
  total_returns: number;
  total_return_value: number;
  total_processing_costs: number;
  net_return_cost: number;
  return_rate: number; // percentage of sales
  
  // Status breakdown
  status_distribution: {
    initiated: number;
    in_transit: number;
    received: number;
    inspecting: number;
    processed: number;
    refunded: number;
    closed: number;
    disputed: number;
  };
  
  // Resolution breakdown
  resolution_distribution: {
    full_refund: number;
    partial_refund: number;
    store_credit: number;
    exchange: number;
    repair: number;
    no_refund: number;
  };
  
  // Performance metrics
  performance_metrics: {
    average_processing_time: number;
    customer_satisfaction_score: number;
    resolution_success_rate: number;
    vendor_claim_success_rate: number;
  };
  
  // Cost analysis
  cost_breakdown: {
    refunds_issued: number;
    processing_costs: number;
    shipping_costs: number;
    restocking_fees_collected: number;
    vendor_claims_recovered: number;
  };
  
  // Top issues
  top_return_reasons: ReasonAnalytics[];
  top_returned_products: ProductReturnAnalytics[];
  
  // Recent activity
  recent_returns: ReturnsCharge[];
  pending_approvals: ReturnsCharge[];
  high_value_returns: ReturnsCharge[];
  
  // Trends
  return_trends: Array<{
    date: string;
    return_count: number;
    return_value: number;
    processing_cost: number;
    resolution_rate: number;
  }>;
  
  // Alerts
  fraud_alerts: ReturnsCharge[];
  delayed_processing: ReturnsCharge[];
  high_cost_returns: ReturnsCharge[];
}

// API Response types
export interface ReturnsChargeListResponse extends APIResponse<ReturnsCharge[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ReturnsChargeResponse extends APIResponse<ReturnsCharge> {}
export interface ReturnPolicyListResponse extends APIResponse<ReturnPolicy[]> {}
export interface ReturnPolicyResponse extends APIResponse<ReturnPolicy> {}
export interface CostCalculationResponse extends APIResponse<ReturnCostCalculationResult> {}
export interface DashboardResponse extends APIResponse<ReturnsDashboardData> {}
export interface AnalyticsResponse extends APIResponse<ReturnAnalytics> {}

// CRUD Operations - Returns Charges

// Get returns charges
export const getReturnsCharges = async (params: FetchReturnsChargesParams = {}): Promise<ReturnsChargeListResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/returns-charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get single returns charge
export const getReturnsCharge = async (id: number): Promise<ReturnsChargeResponse> => {
  const response = await fetch(`${baseUrl}/returns-charges/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create returns charge
export const createReturnsCharge = async (data: CreateReturnsChargeData): Promise<ReturnsChargeResponse> => {
  const response = await fetch(`${baseUrl}/returns-charges`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Update returns charge
export const updateReturnsCharge = async (id: number, data: UpdateReturnsChargeData): Promise<ReturnsChargeResponse> => {
  const response = await fetch(`${baseUrl}/returns-charges/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Delete returns charge
export const deleteReturnsCharge = async (id: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/returns-charges/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Cost Calculations

// Calculate return costs
export const calculateReturnCosts = async (params: ReturnCostCalculationParams): Promise<CostCalculationResponse> => {
  const response = await fetch(`${baseUrl}/returns-charges/calculate-costs`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get refund estimate
export const getRefundEstimate = async (params: {
  order_id: number;
  returned_items: Array<{
    product_id: number;
    quantity: number;
  }>;
  return_reason: string;
}): Promise<APIResponse<{
  estimated_refund: number;
  processing_fee: number;
  restocking_fee: number;
  shipping_refund: number;
  net_refund: number;
}>> => {
  const response = await fetch(`${baseUrl}/returns-charges/refund-estimate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
};

// Status and Processing

// Update return status
export const updateReturnStatus = async (id: number, data: {
  status: "initiated" | "in_transit" | "received" | "inspecting" | "processed" | "refunded" | "closed" | "disputed";
  description?: string;
  location?: string;
  photos?: string[];
  internal_notes?: string;
}): Promise<ReturnsChargeResponse> => {
  const response = await fetch(`${baseUrl}/returns-charges/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Complete inspection
export const completeInspection = async (id: number, data: {
  condition_assessment: "new" | "like_new" | "good" | "fair" | "poor" | "damaged" | "defective";
  inspection_notes: string;
  quality_photos?: string[];
  item_conditions: Array<{
    returned_item_id: number;
    condition: string;
    condition_notes?: string;
    resolution: "refund" | "exchange" | "repair" | "keep";
    resolution_value: number;
  }>;
  vendor_responsible: boolean;
  vendor_claim_amount?: number;
  return_to_inventory: boolean;
  new_inventory_status?: "sellable" | "refurbished" | "damaged" | "disposed";
}): Promise<ReturnsChargeResponse> => {
  const response = await fetch(`${baseUrl}/returns-charges/${id}/inspection`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Process refund
export const processRefund = async (id: number, data: {
  refund_amount: number;
  refund_method: "original_payment" | "store_credit" | "bank_transfer" | "check";
  notes?: string;
  partial_refund_reason?: string;
}): Promise<ReturnsChargeResponse> => {
  const response = await fetch(`${baseUrl}/returns-charges/${id}/refund`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Policy Management

// Get return policies
export const getReturnPolicies = async (params: {
  company_id?: number;
  active_only?: boolean;
  effective_date?: string;
} = {}): Promise<ReturnPolicyListResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/return-policies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create return policy
export const createReturnPolicy = async (data: CreateReturnPolicyData): Promise<ReturnPolicyResponse> => {
  const response = await fetch(`${baseUrl}/return-policies`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Update return policy
export const updateReturnPolicy = async (id: number, data: Partial<CreateReturnPolicyData>): Promise<ReturnPolicyResponse> => {
  const response = await fetch(`${baseUrl}/return-policies/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Yalidine Integration

// Get yalidine return events
export const getYalidineReturnEvents = async (params: {
  yalidine_tracking_id?: string;
  event_type?: string;
  date_from?: string;
  date_to?: string;
} = {}): Promise<APIResponse<YalidineReturnEvent[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/yalidine-return-events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Sync with yalidine
export const syncWithYalidine = async (yalidineReturnId: string): Promise<APIResponse<YalidineReturnEvent[]>> => {
  const response = await fetch(`${baseUrl}/returns-charges/sync-yalidine/${yalidineReturnId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create yalidine return
export const createYalidineReturn = async (data: {
  order_id: number;
  return_reason: string;
  pickup_address: string;
  return_address: string;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}): Promise<APIResponse<{ yalidine_return_id: string; tracking_number: string }>> => {
  const response = await fetch(`${baseUrl}/returns-charges/create-yalidine-return`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Analytics and Reporting

// Get returns dashboard data
export const getReturnsDashboard = async (params: ReturnsDashboardParams = {}): Promise<DashboardResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/returns-charges/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get return analytics
export const getReturnAnalytics = async (params: {
  date_from?: string;
  date_to?: string;
  return_reason?: string;
  group_by?: 'day' | 'week' | 'month';
}): Promise<AnalyticsResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/return-analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get fraud detection insights
export const getFraudDetectionInsights = async (params: {
  date_from?: string;
  date_to?: string;
  risk_threshold?: number;
}): Promise<APIResponse<{
  high_risk_returns: ReturnsCharge[];
  fraud_patterns: Array<{
    pattern_type: string;
    description: string;
    affected_returns: number;
    risk_score: number;
  }>;
  recommendations: string[];
}>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/fraud-detection${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Export and Import

// Export returns charges
export const exportReturnsCharges = async (params: FetchReturnsChargesParams & {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_items?: boolean;
}): Promise<APIResponse<{ file_url: string; file_size: number }>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/returns-charges/export?${queryParams.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Import returns charges
export const importReturnsCharges = async (file: File, options?: {
  skip_duplicates?: boolean;
  auto_calculate_costs?: boolean;
  default_policy_id?: number;
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

  const response = await fetch(`${baseUrl}/returns-charges/import`, {
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

// Bulk approve returns
export const bulkApproveReturns = async (data: {
  return_ids: number[];
  resolution_type: "full_refund" | "partial_refund" | "store_credit" | "exchange" | "repair" | "no_refund";
  notes?: string;
}): Promise<APIResponse<{ approved_count: number; errors: string[] }>> => {
  const response = await fetch(`${baseUrl}/returns-charges/bulk-approve`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Bulk process refunds
export const bulkProcessRefunds = async (data: {
  return_ids: number[];
  refund_method: "original_payment" | "store_credit" | "bank_transfer" | "check";
  notes?: string;
}): Promise<APIResponse<{ processed_count: number; total_amount: number; errors: string[] }>> => {
  const response = await fetch(`${baseUrl}/returns-charges/bulk-refund`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Vendor Claims

// Submit vendor claim
export const submitVendorClaim = async (returnId: number, data: {
  vendor_id: number;
  claim_amount: number;
  claim_reason: string;
  supporting_documents?: string[];
  expected_resolution_date?: string;
}): Promise<APIResponse<{ claim_id: string; status: string }>> => {
  const response = await fetch(`${baseUrl}/returns-charges/${returnId}/vendor-claim`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get vendor claim status
export const getVendorClaimStatus = async (claimId: string): Promise<APIResponse<{
  claim_id: string;
  status: "pending" | "approved" | "denied" | "partially_approved";
  approved_amount?: number;
  response_notes?: string;
  expected_payment_date?: string;
}>> => {
  const response = await fetch(`${baseUrl}/vendor-claims/${claimId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};