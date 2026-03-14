import { baseUrl } from "@/app/constants";
import {
  VariantDeposit,
  VariantDepositListResponse,
  VariantDepositResponse,
} from "@/models/data/variant-deposit.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { CreateVariantDepositSchema } from "@/schemas/variant-deposit";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string })?.message || "API request failed"
    );
  }
};

/** Franchise admin: create a variant deposit (advance order) */
export const createVariantDeposit = async (
  data: CreateVariantDepositSchema
): Promise<APIResponse<VariantDepositResponse>> => {
  const response = await fetch(`${baseUrl}/franchise/variant-deposits`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  await handleApiError(response);
  return response.json();
};

/** Franchise admin: list variant deposits with optional filters */
export const getVariantDeposits = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
  product_variant_id?: number;
}): Promise<APIResponse<VariantDepositListResponse>> => {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", params.page.toString());
  if (params?.limit) search.set("limit", params.limit.toString());
  if (params?.product_variant_id)
    search.set("product_variant_id", params.product_variant_id.toString());
  const qs = search.toString();
  const response = await fetch(
    `${baseUrl}/franchise/variant-deposits${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: getAuthHeaders() }
  );
  await handleApiError(response);
  return response.json();
};

/** Franchise admin: get one variant deposit */
export const getVariantDeposit = async (
  id: number
): Promise<APIResponse<VariantDepositResponse>> => {
  const response = await fetch(`${baseUrl}/franchise/variant-deposits/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return response.json();
};

/** Franchise admin: update (e.g. cancel or refund) */
export const updateVariantDeposit = async (
  id: number,
  data: { status?: "cancelled" | "refunded"; comment?: string }
): Promise<APIResponse<VariantDepositResponse>> => {
  const response = await fetch(`${baseUrl}/franchise/variant-deposits/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  await handleApiError(response);
  return response.json();
};

/** Franchise admin: fulfill deposit by creating a sale */
export const fulfillVariantDeposit = async (
  id: number,
  body?: { discount?: number; rating?: number }
): Promise<
  APIResponse<{ deposit: VariantDeposit; sale: { id: number; total: number } }>
> => {
  const response = await fetch(
    `${baseUrl}/franchise/variant-deposits/${id}/fulfill`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        discount: body?.discount ?? 0,
        ...(body?.rating != null ? { rating: body.rating } : {}),
      }),
    }
  );
  await handleApiError(response);
  return response.json();
};

// --- Company admin (viewing a specific franchise) ---

/** Company admin: list variant deposits for a franchise */
export const getVariantDepositsCompany = async (
  franchiseId: number,
  params?: { status?: string; page?: number; limit?: number }
): Promise<APIResponse<VariantDepositListResponse>> => {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", params.page.toString());
  if (params?.limit) search.set("limit", params.limit.toString());
  const qs = search.toString();
  const response = await fetch(
    `${baseUrl}/franchises/${franchiseId}/variant-deposits${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: getAuthHeaders() }
  );
  await handleApiError(response);
  return response.json();
};

/** Company admin: get one variant deposit */
export const getVariantDepositCompany = async (
  franchiseId: number,
  depositId: number
): Promise<APIResponse<VariantDepositResponse>> => {
  const response = await fetch(
    `${baseUrl}/franchises/${franchiseId}/variant-deposits/${depositId}`,
    { method: "GET", headers: getAuthHeaders() }
  );
  await handleApiError(response);
  return response.json();
};

/** Company admin: update (e.g. cancel) */
export const updateVariantDepositCompany = async (
  franchiseId: number,
  depositId: number,
  data: { status?: "cancelled" | "refunded"; comment?: string }
): Promise<APIResponse<VariantDepositResponse>> => {
  const response = await fetch(
    `${baseUrl}/franchises/${franchiseId}/variant-deposits/${depositId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  await handleApiError(response);
  return response.json();
};

/** Company admin: fulfill deposit */
export const fulfillVariantDepositCompany = async (
  franchiseId: number,
  depositId: number,
  body?: { discount?: number; rating?: number }
): Promise<
  APIResponse<{ deposit: VariantDeposit; sale: { id: number; total: number } }>
> => {
  const response = await fetch(
    `${baseUrl}/franchises/${franchiseId}/variant-deposits/${depositId}/fulfill`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        discount: body?.discount ?? 0,
        ...(body?.rating != null ? { rating: body.rating } : {}),
      }),
    }
  );
  await handleApiError(response);
  return response.json();
};
