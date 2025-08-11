// Charges API service
import { baseUrl } from "@/app/constants";
import {
  AnalyticsParams,
  CreateChargeData,
  DashboardParams,
  FetchChargesParams,
  UpdateChargeData
} from "@/features/charges/charges-slice";
import {
  Charge,
  ChargeAttachment,
  ChargeCategory,
  ChargeComment
} from "@/models/data/charges/charge.model";
import { APIResponse } from "@/models/responses/api-response.model";
import {
  BulkChargeOperationResponse,
  ChargeAnalyticsResponse,
  ChargeConfigurationResponse,
  ChargeDetailResponse,
  ChargeExportResponse,
  ChargeListResponse,
  ChargesDashboardResponse
} from "@/models/responses/charge-response.model";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }
  return response;
};

// Core CRUD operations
export const getCharges = async (params: FetchChargesParams = {}): Promise<ChargeListResponse> => {
  const queryParams = new URLSearchParams();

  // Add query parameters according to API documentation
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.type) queryParams.append('type', params.type);
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);
  if (params.date_from) queryParams.append('start_date', params.date_from);
  if (params.date_to) queryParams.append('end_date', params.date_to);
  if (params.company_id) queryParams.append('company_id', params.company_id.toString());

  const url = `${baseUrl}/charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const getCharge = async (id: number): Promise<ChargeDetailResponse> => {
  const response = await fetch(`${baseUrl}/charges/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const createCharge = async (data: CreateChargeData): Promise<APIResponse<Charge>> => {
  const response = await fetch(`${baseUrl}/charges`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

export const updateCharge = async (id: number, data: UpdateChargeData): Promise<APIResponse<Charge>> => {
  const response = await fetch(`${baseUrl}/charges/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

export const deleteCharge = async (id: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/charges/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Approval operations
export const approveCharge = async (id: number, notes?: string): Promise<APIResponse<Charge>> => {
  const response = await fetch(`${baseUrl}/charges/${id}/approve`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ notes }),
  });

  await handleApiError(response);
  return response.json();
};

export const rejectCharge = async (id: number, reason: string): Promise<APIResponse<Charge>> => {
  const response = await fetch(`${baseUrl}/charges/${id}/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });

  await handleApiError(response);
  return response.json();
};

export const markChargeAsPaid = async (id: number): Promise<APIResponse<Charge>> => {
  const response = await fetch(`${baseUrl}/charges/${id}/mark-paid`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Specialized charge type endpoints
export const createExchangeRateCharge = async (data: {
  company_id: number;
  title: string;
  description: string;
  source_currency: string;
  target_currency: string;
  source_amount: number;
  target_amount: number;
  exchange_rate: number;
  rate_source: string;
  exchange_loss?: number;
  bank_fees?: number;
  total_cost: number;
}): Promise<APIResponse<Charge>> => {
  const response = await fetch(`${baseUrl}/charges/exchange-rate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

export const createEmployeeSalaryCharge = async (data: {
  company_id: number;
  employee_name: string;
  employee_position: string;
  base_salary: number;
  allowances?: number;
  overtime_hours?: number;
  overtime_rate?: number;
  overtime_amount?: number;
  payment_method: string;
}): Promise<APIResponse<Charge>> => {
  const response = await fetch(`${baseUrl}/charges/employee-salary`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

export const createBoxingCharge = async (data: {
  company_id: number;
  title: string;
  box_type: string;
  box_size: string;
  material_cost: number;
  labor_hours?: number;
  labor_rate?: number;
  labor_cost?: number;
  product_id?: number;
}): Promise<APIResponse<Charge>> => {
  const response = await fetch(`${baseUrl}/charges/boxing`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

export const createShippingCharge = async (data: {
  company_id: number;
  title: string;
  shipping_method: string;
  destination: string;
  weight?: number;
  dimensions?: string;
  distance?: number;
  fuel_cost?: number;
  driver_fee?: number;
  insurance_fee?: number;
}): Promise<APIResponse<Charge>> => {
  const response = await fetch(`${baseUrl}/charges/shipping`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

// Analytics and totals
export const getChargeTotals = async (params: {
  company_id?: number;
  start_date?: string;
  end_date?: string;
} = {}): Promise<APIResponse<any>> => {
  const queryParams = new URLSearchParams();

  if (params.company_id) queryParams.append('company_id', params.company_id.toString());
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);

  const url = `${baseUrl}/charges/totals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Legacy functions for backward compatibility
export const requestChargeApproval = async (id: number, notes?: string): Promise<APIResponse<Charge>> => {
  // This functionality is now handled by the approval workflow
  return approveCharge(id, notes);
};

export const getChargesDashboard = async (params: DashboardParams = {}): Promise<ChargesDashboardResponse> => {
  // Use the totals endpoint for dashboard data
  const totalsResponse = await getChargeTotals({
    company_id: params.company_id,
    start_date: params.date_from,
    end_date: params.date_to,
  });

  // Transform the response to match the expected dashboard format
  return {
    status: "success",
    data: {
      total_charges: 0, // This would need to be calculated from the charges list
      total_amount: totalsResponse.data?.total_amount || 0,
      pending_amount: totalsResponse.data?.pending_amount || 0,
      approved_amount: totalsResponse.data?.approved_amount || 0,
      paid_amount: totalsResponse.data?.paid_amount || 0,
      by_type: totalsResponse.data?.by_type || {},
      by_category: totalsResponse.data?.by_category || {},
      monthly_totals: totalsResponse.data?.monthly_totals || {},
    }
  };
};

export const getChargeAnalytics = async (params: AnalyticsParams): Promise<ChargeAnalyticsResponse> => {
  // Use the totals endpoint for analytics
  const totalsResponse = await getChargeTotals({
    company_id: params.company_id,
    start_date: params.start_date,
    end_date: params.end_date,
  });

  return {
    status: "success",
    data: {
      total_amount: totalsResponse.data?.total_amount || 0,
      pending_amount: totalsResponse.data?.pending_amount || 0,
      approved_amount: totalsResponse.data?.approved_amount || 0,
      paid_amount: totalsResponse.data?.paid_amount || 0,
      by_type: totalsResponse.data?.by_type || {},
      by_category: totalsResponse.data?.by_category || {},
      monthly_totals: totalsResponse.data?.monthly_totals || {},
    }
  };
};

// Legacy functions that may need to be implemented differently
export const getChargeCategories = async (): Promise<APIResponse<ChargeCategory[]>> => {
  // This would need to be implemented based on the actual API
  const response = await fetch(`${baseUrl}/charges/categories`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const createChargeCategory = async (data: Omit<ChargeCategory, 'ID' | 'created_at'>): Promise<APIResponse<ChargeCategory>> => {
  const response = await fetch(`${baseUrl}/charges/categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

export const updateChargeCategory = async (id: number, data: Partial<ChargeCategory>): Promise<APIResponse<ChargeCategory>> => {
  const response = await fetch(`${baseUrl}/charges/categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

export const deleteChargeCategory = async (id: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/charges/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Comment and attachment functions (may need to be implemented differently)
export const getChargeComments = async (chargeId: number): Promise<APIResponse<ChargeComment[]>> => {
  const response = await fetch(`${baseUrl}/charges/${chargeId}/comments`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const addChargeComment = async (chargeId: number, comment: string): Promise<APIResponse<ChargeComment>> => {
  const response = await fetch(`${baseUrl}/charges/${chargeId}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ comment }),
  });

  await handleApiError(response);
  return response.json();
};

export const getChargeAttachments = async (chargeId: number): Promise<APIResponse<ChargeAttachment[]>> => {
  const response = await fetch(`${baseUrl}/charges/${chargeId}/attachments`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const uploadChargeAttachment = async (chargeId: number, file: File): Promise<APIResponse<ChargeAttachment>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${baseUrl}/charges/${chargeId}/attachments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: formData,
  });

  await handleApiError(response);
  return response.json();
};

export const deleteChargeAttachment = async (chargeId: number, attachmentId: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/charges/${chargeId}/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Bulk operations (may need to be implemented differently)
export const bulkCreateCharges = async (charges: CreateChargeData[]): Promise<BulkChargeOperationResponse> => {
  const response = await fetch(`${baseUrl}/charges/bulk`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ charges }),
  });

  await handleApiError(response);
  return response.json();
};

export const bulkUpdateCharges = async (updates: { id: number; data: UpdateChargeData }[]): Promise<BulkChargeOperationResponse> => {
  const response = await fetch(`${baseUrl}/charges/bulk`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ updates }),
  });

  await handleApiError(response);
  return response.json();
};

export const bulkDeleteCharges = async (ids: number[]): Promise<BulkChargeOperationResponse> => {
  const response = await fetch(`${baseUrl}/charges/bulk`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  });

  await handleApiError(response);
  return response.json();
};

export const bulkApproveCharges = async (ids: number[], notes?: string): Promise<BulkChargeOperationResponse> => {
  const response = await fetch(`${baseUrl}/charges/bulk/approve`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids, notes }),
  });

  await handleApiError(response);
  return response.json();
};

export const bulkRejectCharges = async (ids: number[], reason: string): Promise<BulkChargeOperationResponse> => {
  const response = await fetch(`${baseUrl}/charges/bulk/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids, reason }),
  });

  await handleApiError(response);
  return response.json();
};

// Export and import functions (may need to be implemented differently)
export const exportCharges = async (params: FetchChargesParams & {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_attachments?: boolean;
}): Promise<ChargeExportResponse> => {
  const queryParams = new URLSearchParams();

  // Add all the query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${baseUrl}/charges/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const importCharges = async (file: File, options?: {
  skip_duplicates?: boolean;
  auto_approve?: boolean;
  default_company_id?: number;
}): Promise<BulkChargeOperationResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
  }

  const response = await fetch(`${baseUrl}/charges/import`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: formData,
  });

  await handleApiError(response);
  return response.json();
};

// Configuration and utility functions
export const getChargeConfiguration = async (): Promise<ChargeConfigurationResponse> => {
  const response = await fetch(`${baseUrl}/charges/configuration`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const searchCharges = async (query: string, filters?: Partial<FetchChargesParams>): Promise<APIResponse<Charge[]>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('search', query);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${baseUrl}/charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const getRecentCharges = async (limit: number = 10, companyId?: number): Promise<APIResponse<Charge[]>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  if (companyId) queryParams.append('company_id', companyId.toString());

  const url = `${baseUrl}/charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const getPendingApprovals = async (companyId?: number): Promise<APIResponse<Charge[]>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('status', 'pending');
  if (companyId) queryParams.append('company_id', companyId.toString());

  const url = `${baseUrl}/charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const checkForDuplicates = async (chargeData: Partial<CreateChargeData>): Promise<APIResponse<{
  has_duplicates: boolean;
  potential_duplicates: Charge[];
  confidence_scores: number[];
}>> => {
  const response = await fetch(`${baseUrl}/charges/check-duplicates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(chargeData),
  });

  await handleApiError(response);
  return response.json();
};

export const validateCharge = async (chargeData: CreateChargeData | UpdateChargeData): Promise<APIResponse<{
  is_valid: boolean;
  validation_errors: Record<string, string[]>;
  warnings: string[];
}>> => {
  const response = await fetch(`${baseUrl}/charges/validate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(chargeData),
  });

  await handleApiError(response);
  return response.json();
};