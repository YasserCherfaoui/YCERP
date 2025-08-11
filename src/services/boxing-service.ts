// Boxing service for managing packaging and boxing charges
import { baseUrl } from '@/app/constants';
import {
  BoxingCharge,
  MaterialUsageAnalytics,
  PackagingBatch,
  PackagingMaterial,
  PackagingTemplate
} from "@/models/data/charges/boxing.model";
import { APIResponse } from "@/models/responses/api-response.model";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
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

// Fetch parameters for boxing charges
export interface FetchBoxingChargesParams {
  limit?: number;
  offset?: number;
  company_id?: number;
  product_id?: number;
}

// Create boxing charge data
export interface CreateBoxingChargeData {
  material_type: string;
  material_cost: number;
  labor_hours?: number;
  labor_rate?: number;
  product_id?: number;
  quantity: number;
  batch_number?: string;
  batch_size?: number;
  company_id: number;
  title?: string;
  description?: string;
  date?: string;
}

// Update boxing charge data
export interface UpdateBoxingChargeData extends Partial<CreateBoxingChargeData> {}

// Cost calculation parameters
export interface BoxingCostCalculationParams {
  material_type: string;
  quantity: number;
  labor_hours?: number;
  labor_rate?: number;
}

// Cost calculation result
export interface BoxingCostCalculationResult {
  material_cost: number;
  labor_cost: number;
  total_cost: number;
  cost_per_unit: number;
  batch_size: number;
  labor_hours: number;
  labor_rate: number;
}

// Material management
export interface CreateMaterialData {
  name: string;
  type: string;
  unit_cost: number;
  unit_size: string;
  description?: string;
}

export interface UpdateMaterialData extends Partial<CreateMaterialData> {}

// Batch processing
export interface CreateBatchData {
  batch_size: number;
  material_type: string;
  labor_hours?: number;
}

// Dashboard data
export interface BoxingDashboardParams {
  date_from?: string;
  date_to?: string;
  packaging_type?: string;
  company_id: number; // Required parameter
}

export interface BoxingDashboardData {
  total_batches: number;
  total_items_packaged: number;
  total_packaging_cost: number;
  average_cost_per_item: number;
  material_cost_total: number;
  labor_cost_total: number;
  quality_metrics: {
    pass_rate: number;
    defect_rate: number;
    rework_rate: number;
  };
  efficiency_metrics: {
    average_items_per_hour: number;
    material_waste_percentage: number;
    packaging_efficiency: number;
  };
  packaging_type_breakdown: Array<{
    type: string;
    count: number;
    total_cost: number;
    percentage: number;
  }>;
  material_usage: Array<{
    material_id: number;
    material_name: string;
    quantity_used: number;
    total_cost: number;
  }>;
  recent_batches: PackagingBatch[];
  low_stock_materials: PackagingMaterial[];
}

// API Response types
export interface BoxingChargeListResponse extends APIResponse<BoxingCharge[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface BoxingChargeResponse extends APIResponse<BoxingCharge> {}
export interface MaterialListResponse extends APIResponse<PackagingMaterial[]> {}
export interface MaterialResponse extends APIResponse<PackagingMaterial> {}
export interface TemplateListResponse extends APIResponse<PackagingTemplate[]> {}
export interface TemplateResponse extends APIResponse<PackagingTemplate> {}
export interface BatchListResponse extends APIResponse<{
  data: PackagingBatch[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}> {}
export interface BatchResponse extends APIResponse<PackagingBatch> {}
export interface CostCalculationResponse extends APIResponse<BoxingCostCalculationResult> {}
export interface DashboardResponse extends APIResponse<BoxingDashboardData> {}

// CRUD Operations - Boxing Charges

// Get boxing charges
export const getBoxingCharges = async (params: FetchBoxingChargesParams = {}): Promise<BoxingChargeListResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/charges/boxing${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get single boxing charge
export const getBoxingCharge = async (id: number): Promise<BoxingChargeResponse> => {
  const response = await fetch(`${baseUrl}/charges/boxing/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create boxing charge
export const createBoxingCharge = async (data: CreateBoxingChargeData): Promise<BoxingChargeResponse> => {
  const response = await fetch(`${baseUrl}/charges/boxing`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Update boxing charge
export const updateBoxingCharge = async (id: number, data: UpdateBoxingChargeData): Promise<BoxingChargeResponse> => {
  const response = await fetch(`${baseUrl}/charges/boxing/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Delete boxing charge
export const deleteBoxingCharge = async (id: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/charges/boxing/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Cost Calculations

// Calculate boxing costs
export const calculateBoxingCosts = async (params: BoxingCostCalculationParams): Promise<CostCalculationResponse> => {
  const response = await fetch(`${baseUrl}/charges/boxing/calculate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
};

// Calculate batch packaging costs
export const calculateBatchPackagingCosts = async (params: CreateBatchData): Promise<CostCalculationResponse> => {
  const response = await fetch(`${baseUrl}/charges/boxing/calculate-batch`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  await handleApiError(response);
  return response.json();
};

// Material Management

// Get packaging materials
export const getPackagingMaterials = async (params: {
  limit?: number;
  offset?: number;
  material_type?: string;
  low_stock_only?: boolean;
  search?: string;
} = {}): Promise<MaterialListResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/charges/boxing/materials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get single material
export const getPackagingMaterial = async (id: number): Promise<MaterialResponse> => {
  const response = await fetch(`${baseUrl}/charges/boxing/materials/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create material
export const createPackagingMaterial = async (data: CreateMaterialData): Promise<MaterialResponse> => {
  const response = await fetch(`${baseUrl}/charges/boxing/materials`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Update material
export const updatePackagingMaterial = async (id: number, data: UpdateMaterialData): Promise<MaterialResponse> => {
  const response = await fetch(`${baseUrl}/charges/boxing/materials/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Delete material
export const deletePackagingMaterial = async (id: number): Promise<APIResponse<void>> => {
  const response = await fetch(`${baseUrl}/charges/boxing/materials/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Product Packaging Profile

// Get product packaging profile
export const getProductPackagingProfile = async (productId: number): Promise<APIResponse<{
  product_id: number;
  product_name: string;
  material_type: string;
  material_cost: number;
  labor_hours: number;
  labor_rate: number;
  cost_per_unit: number;
  total_packaged: number;
  average_cost: number;
  last_packaged_at: string;
}>> => {
  const response = await fetch(`${baseUrl}/charges/boxing/products/${productId}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Template Management

// Get packaging templates
export const getPackagingTemplates = async (params: {
  limit?: number;
  offset?: number;
  product_category?: string;
  active_only?: boolean;
} = {}): Promise<TemplateListResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/packaging-templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create template
export const createPackagingTemplate = async (data: Omit<PackagingTemplate, "ID">): Promise<TemplateResponse> => {
  const response = await fetch(`${baseUrl}/packaging-templates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Batch Processing

// Get packaging batches
export const getPackagingBatches = async (params: {
  limit?: number;
  offset?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
} = {}): Promise<BatchListResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/packaging-batches${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Create packaging batch
export const createPackagingBatch = async (data: CreateBatchData): Promise<BatchResponse> => {
  const response = await fetch(`${baseUrl}/packaging-batches`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Start batch processing
export const startBatchProcessing = async (batchId: string): Promise<BatchResponse> => {
  const response = await fetch(`${baseUrl}/packaging-batches/${batchId}/start`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Complete batch processing
export const completeBatchProcessing = async (batchId: string, data: {
  actual_duration: number;
  quality_notes?: string;
  defect_count: number;
  rework_count: number;
}): Promise<BatchResponse> => {
  const response = await fetch(`${baseUrl}/packaging-batches/${batchId}/complete`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Update batch progress
export const updateBatchProgress = async (batchId: string, data: {
  completed_items: Array<{
    product_id: number;
    product_variant_id?: number;
    completed_quantity: number;
  }>;
}): Promise<BatchResponse> => {
  const response = await fetch(`${baseUrl}/packaging-batches/${batchId}/progress`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};

// Analytics and Reporting

// Get boxing dashboard data
export const getBoxingDashboard = async (params: BoxingDashboardParams): Promise<DashboardResponse> => {
  const queryParams = new URLSearchParams();
  
  // Always include company_id - if not provided, use a default or throw error
  if (!params.company_id) {
    throw new Error('company_id is required for dashboard requests');
  }
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/charges/boxing/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Get material usage analytics
export const getMaterialUsageAnalytics = async (params: {
  material_id?: number;
  date_from?: string;
  date_to?: string;
}): Promise<APIResponse<MaterialUsageAnalytics[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/material-usage-analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};



// Export and Import

// Export boxing charges
export const exportBoxingCharges = async (params: FetchBoxingChargesParams & {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  include_materials?: boolean;
}): Promise<APIResponse<{ file_url: string; file_size: number }>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${baseUrl}/boxing-charges/export?${queryParams.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  await handleApiError(response);
  return response.json();
};

// Import boxing charges
export const importBoxingCharges = async (file: File, options?: {
  skip_duplicates?: boolean;
  auto_calculate_costs?: boolean;
  default_packaging_type?: string;
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

  const response = await fetch(`${baseUrl}/boxing-charges/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: formData,
  });
  
  await handleApiError(response);
  return response.json();
};

// Quality Control

// Submit quality check
export const submitQualityCheck = async (boxingChargeId: number, data: {
  quality_check_passed: boolean;
  quality_notes?: string;
  defect_rate?: number;
  rework_required: boolean;
  inspector_id: number;
}): Promise<BoxingChargeResponse> => {
  const response = await fetch(`${baseUrl}/boxing-charges/${boxingChargeId}/quality-check`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  await handleApiError(response);
  return response.json();
};



// Cost Optimization

