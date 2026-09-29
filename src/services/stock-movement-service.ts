import { baseUrl } from "@/app/constants";
import {
  AlignStockMovementSourcePayload,
  CompanyInventoryOption,
  CreateStockMovementPayload,
  StockMovementBill,
  StockMovementList,
  StockMovementListParams,
} from "@/models/data/stock-movement.model";
import { APIError, APIResponse } from "@/models/responses/api-response.model";

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

async function readError(response: Response, fallback: string): Promise<never> {
  const errorData = await response.json().catch(() => ({}));
  const err = new Error(errorData.message || fallback) as Error & { apiError?: APIError };
  if (errorData.error) {
    err.apiError = errorData.error as APIError;
  }
  throw err;
}

export const listCompanyInventories = async (
  companyId: number
): Promise<APIResponse<CompanyInventoryOption[]>> => {
  const response = await fetch(`${baseUrl}/companies/${companyId}/inventories`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    return readError(response, "Failed to load inventories.");
  }
  return response.json();
};

export const listStockMovements = async (
  companyId: number,
  params?: StockMovementListParams
): Promise<APIResponse<StockMovementList>> => {
  const query = new URLSearchParams();
  if (params?.from_inventory_id) query.set("from_inventory_id", String(params.from_inventory_id));
  if (params?.to_inventory_id) query.set("to_inventory_id", String(params.to_inventory_id));
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const response = await fetch(`${baseUrl}/bills/stock-movements/company/${companyId}${suffix}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    return readError(response, "Failed to load stock movements.");
  }
  return response.json();
};

export const createStockMovement = async (
  data: CreateStockMovementPayload
): Promise<APIResponse<StockMovementBill>> => {
  const response = await fetch(`${baseUrl}/bills/stock-movements`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    return readError(response, "Failed to create stock movement.");
  }
  return response.json();
};

export const alignStockMovementSource = async (
  data: AlignStockMovementSourcePayload
): Promise<APIResponse<null>> => {
  const response = await fetch(`${baseUrl}/bills/stock-movements/align-source`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    return readError(response, "Failed to align source stock.");
  }
  return response.json();
};

export const deleteStockMovement = async (billId: number): Promise<APIResponse<null>> => {
  const response = await fetch(`${baseUrl}/bills/stock-movements/${billId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    return readError(response, "Failed to delete stock movement.");
  }
  return response.json();
};

export const printStockMovement = async (billId: number): Promise<void> => {
  const response = await fetch(`${baseUrl}/bills/stock-movements/${billId}/print`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    return readError(response, "Failed to print stock movement.");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const newWindow = window.open(url, "_blank");
  if (!newWindow) {
    window.URL.revokeObjectURL(url);
    throw new Error("Popup blocked. Please allow popups for this site.");
  }
  newWindow.addEventListener("load", () => {
    newWindow.print();
  });
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};

export function shortfallsFromError(error: unknown) {
  const apiError = (error as { apiError?: APIError } | null)?.apiError;
  if (apiError?.code === "inventory/insufficient" && apiError.details?.shortfalls?.length) {
    return apiError.details.shortfalls;
  }
  return null;
}
