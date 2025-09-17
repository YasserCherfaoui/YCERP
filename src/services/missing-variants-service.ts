import { baseUrl } from "@/app/constants";
import {
    CreateExitBillFromMissingVariantsResponse,
    MissingVariantByFranchiseResponse,
    MissingVariantListResponse,
    MissingVariantRequest
} from "@/models/data/missing-variant.model";
import { APIResponse } from "@/models/responses/api-response.model";
import {
    CreateExitBillFromMissingVariantsSchema,
    CreateMissingVariantRequestSchema,
    MissingVariantFiltersSchema,
    UpdateMissingVariantRequestSchema,
} from "@/schemas/missing-variant";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "API request failed");
  }
};

// Franchise Administrator Endpoints

export const createMissingVariantRequest = async (
  data: CreateMissingVariantRequestSchema
): Promise<APIResponse<MissingVariantRequest>> => {
  const response = await fetch(`${baseUrl}/franchises/missing-variants`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

export const getFranchiseMissingVariantRequests = async (
  filters?: Partial<MissingVariantFiltersSchema>
): Promise<APIResponse<MissingVariantListResponse>> => {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append("status", filters.status);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const url = `${baseUrl}/franchises/missing-variants${params.toString() ? `?${params.toString()}` : ""}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const updateMissingVariantRequest = async (
  id: number,
  data: UpdateMissingVariantRequestSchema
): Promise<APIResponse<MissingVariantRequest>> => {
  const response = await fetch(`${baseUrl}/franchises/missing-variants/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};

export const cancelMissingVariantRequest = async (
  id: number
): Promise<APIResponse<MissingVariantRequest>> => {
  const response = await fetch(`${baseUrl}/franchises/missing-variants/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

// Company Administrator Endpoints

export const getAllMissingVariantRequests = async (
  filters?: Partial<MissingVariantFiltersSchema>
): Promise<APIResponse<MissingVariantListResponse>> => {
  const params = new URLSearchParams();
  
  if (filters?.franchise_id) params.append("franchise_id", filters.franchise_id.toString());
  if (filters?.status) params.append("status", filters.status);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const url = `${baseUrl}/admin/missing-variants${params.toString() ? `?${params.toString()}` : ""}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const getMissingVariantRequestsByFranchise = async (
  franchiseId: number,
  filters?: Partial<MissingVariantFiltersSchema>
): Promise<APIResponse<MissingVariantByFranchiseResponse>> => {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append("status", filters.status);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const url = `${baseUrl}/admin/missing-variants/franchise/${franchiseId}${params.toString() ? `?${params.toString()}` : ""}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  await handleApiError(response);
  return response.json();
};

export const createExitBillFromMissingVariants = async (
  data: CreateExitBillFromMissingVariantsSchema
): Promise<APIResponse<CreateExitBillFromMissingVariantsResponse>> => {
  console.log('Service received data:', data);
  
  // Filter out items with 0 quantity from quantity_adjustments
  const filteredQuantityAdjustments = data.quantity_adjustments?.filter(
    adjustment => adjustment.quantity > 0
  );

  console.log('Filtered quantity adjustments:', filteredQuantityAdjustments);

  const requestBody = {
    franchise_id: data.franchise_id,
    company_id: data.company_id,
    comment: data.comment,
    // Include request_ids only if provided and not empty
    ...(data.request_ids && data.request_ids.length > 0 && { 
      request_ids: data.request_ids 
    }),
    // Include quantity adjustments only if there are items with quantity > 0
    ...(filteredQuantityAdjustments && filteredQuantityAdjustments.length > 0 && { 
      quantity_adjustments: filteredQuantityAdjustments 
    }),
    // Include additional_items if provided
    ...(data.additional_items && data.additional_items.length > 0 && { 
      additional_items: data.additional_items 
    }),
  };

  console.log('Request body being sent:', requestBody);

  const response = await fetch(`${baseUrl}/admin/missing-variants/create-exit-bill`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);

  await handleApiError(response);
  return response.json();
};

export const bulkCreateMissingVariantRequests = async (
  data: { requests: Array<{ product_variant_id: number; requested_quantity: number; comment?: string }> }
): Promise<APIResponse<any>> => {
  const response = await fetch(`${baseUrl}/franchises/missing-variants/bulk`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleApiError(response);
  return response.json();
};
