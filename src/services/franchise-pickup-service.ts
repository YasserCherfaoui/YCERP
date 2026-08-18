import { baseUrl } from "@/app/constants";
import {
  CreateFranchisePickupRequestPayload,
  FranchisePickupListResponse,
  FranchisePickupRequest,
  ResolveFranchisePickupRequestPayload,
} from "@/models/data/franchise-pickup.model";
import type { APIError } from "@/models/responses/api-response.model";
import { APIResponse } from "@/models/responses/api-response.model";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.message || "API request failed") as Error & {
      apiError?: APIError;
    };
    if (errorData.error) {
      err.apiError = errorData.error as APIError;
    }
    throw err;
  }
};

export const createFranchisePickupRequest = async (
  data: CreateFranchisePickupRequestPayload
): Promise<APIResponse<FranchisePickupRequest>> => {
  const response = await fetch(`${baseUrl}/admin/pickup-requests`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  await handleApiError(response);
  return response.json();
};

export const getAdminPickupRequests = async (filters?: {
  company_id?: number;
  franchise_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<APIResponse<FranchisePickupListResponse>> => {
  const params = new URLSearchParams();
  if (filters?.company_id) params.append("company_id", String(filters.company_id));
  if (filters?.franchise_id) params.append("franchise_id", String(filters.franchise_id));
  if (filters?.status) params.append("status", filters.status);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  const qs = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${baseUrl}/admin/pickup-requests${qs}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return response.json();
};

export const cancelFranchisePickupRequest = async (
  id: number
): Promise<APIResponse<FranchisePickupRequest>> => {
  const response = await fetch(`${baseUrl}/admin/pickup-requests/${id}/cancel`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return response.json();
};

export const getFranchisePickupRequests = async (filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<APIResponse<FranchisePickupListResponse>> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.limit) params.append("limit", String(filters.limit));
  const qs = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${baseUrl}/franchise/pickup-requests${qs}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return response.json();
};

export const resolveFranchisePickupRequest = async (
  id: number,
  payload: ResolveFranchisePickupRequestPayload
): Promise<APIResponse<FranchisePickupRequest>> => {
  const response = await fetch(
    `${baseUrl}/franchise/pickup-requests/${id}/resolve`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );
  await handleApiError(response);
  return response.json();
};

export const pickFranchisePickupRequest = async (
  id: number
): Promise<APIResponse<FranchisePickupRequest>> => {
  const response = await fetch(`${baseUrl}/franchise/pickup-requests/${id}/pick`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return response.json();
};

export const markFranchisePickupNotAvailable = async (
  id: number
): Promise<APIResponse<FranchisePickupRequest>> => {
  const response = await fetch(
    `${baseUrl}/franchise/pickup-requests/${id}/not-available`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
  await handleApiError(response);
  return response.json();
};
